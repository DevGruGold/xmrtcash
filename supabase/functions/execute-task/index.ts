import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExecuteTaskRequest {
  task_id?: string;
  auto_claim?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { task_id, auto_claim = false }: ExecuteTaskRequest = body;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let task: any;

    // Get specific task or claim next pending task
    if (task_id) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', task_id)
        .single();
      
      if (error) throw error;
      task = data;
    } else if (auto_claim) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', 'PENDING')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ message: 'No pending tasks available' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      task = data;
    } else {
      return new Response(
        JSON.stringify({ error: 'Either task_id or auto_claim must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('⚙️ Executing task:', task.id, '-', task.title);

    // Update task status to EXECUTING
    await supabase
      .from('tasks')
      .update({ 
        status: 'EXECUTING',
        claimed_by: 'eliza-task-executor',
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    const executionStart = Date.now();
    let result: any = null;
    let executionError: string | null = null;

    try {
      // Route task execution based on category
      switch (task.category) {
        case 'code':
        case 'python':
          // Execute via python-executor
          const pythonResult = await supabase.functions.invoke('python-executor', {
            body: {
              code: task.details?.code || task.description,
              source: 'task_execution',
              workflow_id: task.id,
              metadata: { task_id: task.id, category: task.category }
            }
          });
          result = pythonResult.data;
          break;

        case 'api':
          // Make HTTP call
          if (task.details?.url) {
            const apiResponse = await fetch(task.details.url, {
              method: task.details.method || 'GET',
              headers: task.details.headers || {},
              body: task.details.body ? JSON.stringify(task.details.body) : undefined
            });
            result = await apiResponse.json();
          }
          break;

        case 'analysis':
        case 'ai':
          // Call AI for analysis
          const aiResult = await supabase.functions.invoke('ai-chat', {
            body: {
              userMessage: task.description,
              pageContext: { task_id: task.id, category: task.category }
            }
          });
          result = aiResult.data;
          break;

        default:
          result = { message: 'Task category not yet implemented', category: task.category };
      }

      // Update task as completed
      await supabase
        .from('tasks')
        .update({ 
          status: 'COMPLETED',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      console.log('✅ Task completed:', task.id);

    } catch (error: any) {
      executionError = error?.message || String(error);
      console.error('❌ Task execution failed:', executionError);

      // Update task as failed
      await supabase
        .from('tasks')
        .update({ 
          status: 'FAILED',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);
    }

    const executionTime = Date.now() - executionStart;

    // Log execution
    await supabase
      .from('task_executions')
      .insert({
        task_id: task.id,
        agent_id: 'eliza-task-executor',
        status: executionError ? 'failed' : 'completed',
        result,
        error_message: executionError,
        execution_time_ms: executionTime,
        started_at: new Date(executionStart).toISOString(),
        finished_at: new Date().toISOString()
      });

    // Log autonomous action
    await supabase
      .from('autonomous_actions_log')
      .insert({
        action_type: 'task_execution',
        trigger_reason: auto_claim ? 'self_initiated' : 'requested',
        action_details: {
          task_id: task.id,
          task_title: task.title,
          task_category: task.category,
          execution_time_ms: executionTime
        },
        outcome: executionError ? 'failure' : 'success',
        confidence_score: executionError ? 0.3 : 0.9,
        learning_notes: executionError ? `Failed: ${executionError}` : 'Task completed successfully'
      });

    return new Response(
      JSON.stringify({
        task_id: task.id,
        task_title: task.title,
        status: executionError ? 'failed' : 'completed',
        result,
        error: executionError,
        execution_time_ms: executionTime
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('execute-task error:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to execute task'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
