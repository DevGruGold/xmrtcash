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

  // GET endpoint - List available functions
  if (req.method === 'GET') {
    const documentation = {
      name: "Eliza Python Executor",
      description: "Execute Python code with access to Eliza's tool ecosystem",
      endpoint: "https://vawouugtzwmejxqkeqqj.supabase.co/functions/v1/python-executor",
      
      usage: {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          code: "Python code to execute (required)",
          workflow_id: "Optional workflow identifier",
          source: "Optional source identifier (default: 'direct')",
          metadata: "Optional metadata object"
        }
      },

      available_tools: {
        description: "All tools are accessible via the 'tools' object in your Python code",
        
        ai_orchestration: [
          {
            name: "tools.ai_chat(message, model='gemini', context=None)",
            description: "Chat with AI providers (gemini, deepseek, kimi, wan-ai)",
            example: "response = await tools.ai_chat('Explain quantum computing', model='gemini')"
          },
          {
            name: "tools.wan_ai_chat(message)",
            description: "Chat using WAN-AI provider",
            example: "response = await tools.wan_ai_chat('What is machine learning?')"
          },
          {
            name: "tools.gemini_chat(message)",
            description: "Chat using Google Gemini",
            example: "response = await tools.gemini_chat('Summarize this text')"
          }
        ],

        web_browsing: [
          {
            name: "tools.browse_web(url)",
            description: "Browse and extract content from web pages",
            example: "content = await tools.browse_web('https://example.com')"
          }
        ],

        mining_data: [
          {
            name: "tools.get_mining_stats()",
            description: "Get SupportXMR mining pool statistics",
            example: "stats = await tools.get_mining_stats()"
          }
        ],

        memory_management: [
          {
            name: "tools.vectorize_memory(content, memory_id=None)",
            description: "Store content in vector memory for semantic search",
            example: "result = await tools.vectorize_memory('Important information to remember')"
          },
          {
            name: "tools.extract_knowledge(content, source=None)",
            description: "Extract structured knowledge from content",
            example: "knowledge = await tools.extract_knowledge('Article text here')"
          }
        ],

        voice_processing: [
          {
            name: "tools.text_to_speech(text, voice='Aria')",
            description: "Convert text to speech audio",
            example: "audio = await tools.text_to_speech('Hello world')"
          },
          {
            name: "tools.speech_to_text(audio_data)",
            description: "Convert speech audio to text",
            example: "text = await tools.speech_to_text(audio_bytes)"
          }
        ],

        ecosystem: [
          {
            name: "tools.ecosystem_webhook(event_type, data)",
            description: "Trigger ecosystem webhook events",
            example: "result = await tools.ecosystem_webhook('user_action', {'action': 'login'})"
          }
        ],

        generic: [
          {
            name: "tools.invoke_function(function_name, payload=None)",
            description: "Invoke any Supabase edge function directly",
            example: "result = await tools.invoke_function('custom-function', {'param': 'value'})"
          }
        ]
      },

      examples: {
        parallel_execution: `# Execute multiple AI calls in parallel
import asyncio

responses = await asyncio.gather(
  tools.gemini_chat('What is Python?'),
  tools.wan_ai_chat('What is JavaScript?'),
  tools.get_mining_stats()
)

print(responses)`,

        conditional_workflow: `# Conditional workflow with error handling
try:
  stats = await tools.get_mining_stats()
  if stats['hashrate'] > 1000000:
    summary = await tools.ai_chat(f"Summarize: {stats}", model='gemini')
    await tools.vectorize_memory(summary)
  print("Workflow completed")
except Exception as e:
  print(f"Error: {e}")`,

        data_pipeline: `# Data gathering and processing pipeline
web_content = await tools.browse_web('https://docs.python.org')
knowledge = await tools.extract_knowledge(web_content, source='python_docs')
summary = await tools.gemini_chat(f"Summarize: {knowledge}")
print(summary)`
      },

      request_example: {
        curl: `curl -X POST https://vawouugtzwmejxqkeqqj.supabase.co/functions/v1/python-executor \\
  -H "Content-Type: application/json" \\
  -d '{
    "code": "response = await tools.ai_chat('Hello Eliza'); print(response)",
    "source": "user_request"
  }'`,
        
        javascript: `const response = await fetch('https://vawouugtzwmejxqkeqqj.supabase.co/functions/v1/python-executor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: "response = await tools.ai_chat('Hello Eliza'); print(response)",
    source: 'user_request'
  })
});
const result = await response.json();
console.log(result);`
      },

      response_format: {
        success: {
          execution_id: "uuid",
          status: "completed",
          result: "Execution result (any type)",
          error_message: null,
          exit_code: 0,
          execution_time_ms: 1234
        },
        error: {
          execution_id: "uuid",
          status: "failed",
          result: null,
          error_message: "Error description",
          exit_code: 1,
          execution_time_ms: 567
        }
      }
    };

    return new Response(
      JSON.stringify(documentation, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }

  // POST endpoint - Execute Python code
  try {
    let request: PythonExecutionRequest;
    
    try {
      const body = await req.text();
      if (!body || body.trim() === '') {
        return new Response(
          JSON.stringify({ error: 'Request body is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      request = JSON.parse(body);
    } catch (parseError: any) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError?.message || 'Failed to parse JSON'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { code, workflow_id, source = 'direct', metadata = {} } = request;

    if (!code || typeof code !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Python code is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    const errorMessage = error?.message || String(error) || 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to execute Python code'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
