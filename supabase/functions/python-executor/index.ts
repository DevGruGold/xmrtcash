import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PythonRuntime } from './python-runtime.ts';
import { PythonExecutionRequest, PythonExecutionResponse } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: PythonExecutionRequest = await req.json();
    const { code, workflow_id, source = 'direct', metadata = {} } = request;

    if (!code || typeof code !== 'string') {
      throw new Error('Python code is required');
    }

    console.log('🐍 Python Executor - Starting execution');
    console.log('📝 Source:', source);
    console.log('🔖 Workflow ID:', workflow_id || 'none');
    console.log('📄 Code length:', code.length, 'characters');

    // Create execution record
    const executionId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from('eliza_python_executions')
      .insert({
        id: executionId,
        code,
        status: 'running',
        started_at: new Date().toISOString(),
        source,
        workflow_id,
        metadata: {
          ...metadata,
          code_length: code.length,
          timestamp: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('❌ Failed to create execution record:', insertError);
      throw insertError;
    }

    // Initialize Python runtime
    const runtime = new PythonRuntime(supabaseUrl, supabaseServiceKey);
    await runtime.initialize();

    // Execute Python code
    const startTime = Date.now();
    let result: any;
    let exitCode = 0;
    let errorMessage: string | null = null;

    try {
      result = await runtime.execute(code);
      console.log('✅ Python execution successful');
      console.log('📊 Result type:', typeof result);
    } catch (error: any) {
      exitCode = 1;
      errorMessage = error.message || String(error);
      console.error('❌ Python execution failed:', errorMessage);
      result = null;
    }

    const executionTime = Date.now() - startTime;

    // Update execution record
    const { error: updateError } = await supabase
      .from('eliza_python_executions')
      .update({
        status: exitCode === 0 ? 'completed' : 'failed',
        finished_at: new Date().toISOString(),
        result: result ? JSON.parse(JSON.stringify(result)) : null,
        error_message: errorMessage,
        exit_code: exitCode,
        metadata: {
          ...metadata,
          code_length: code.length,
          execution_time_ms: executionTime,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', executionId);

    if (updateError) {
      console.error('⚠️ Failed to update execution record:', updateError);
    }

    // Prepare response
    const response: PythonExecutionResponse = {
      execution_id: executionId,
      status: exitCode === 0 ? 'completed' : 'failed',
      result,
      error_message: errorMessage,
      exit_code: exitCode,
      execution_time_ms: executionTime
    };

    if (exitCode !== 0) {
      return new Response(
        JSON.stringify(response),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Python executor error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to execute Python code'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
