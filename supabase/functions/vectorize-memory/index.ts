import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Processing pending memory vectorizations...');

    // Find pending vectorization jobs
    const { data: pendingLogs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .in('webhook_name', ['vectorize_memory', 'auto_vectorize_memory'])
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (logsError || !pendingLogs || pendingLogs.length === 0) {
      console.log('✅ No pending vectorizations');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending vectorizations' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${pendingLogs.length} memories to vectorize`);

    let processed = 0;
    let failed = 0;

    for (const log of pendingLogs) {
      try {
        const memoryId = log.payload?.memory_id;
        if (!memoryId) {
          console.warn('⚠️ Log missing memory_id:', log.id);
          continue;
        }

        // Get the memory
        const { data: memory, error: memError } = await supabase
          .from('memory_contexts')
          .select('*')
          .eq('id', memoryId)
          .single();

        if (memError || !memory || memory.embedding) {
          // Skip if already has embedding or not found
          await supabase
            .from('webhook_logs')
            .update({ status: 'completed' })
            .eq('id', log.id);
          continue;
        }

        // Generate embedding
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: memory.content,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Update memory with embedding
        await supabase
          .from('memory_contexts')
          .update({ embedding })
          .eq('id', memoryId);

        // Mark log as completed
        await supabase
          .from('webhook_logs')
          .update({ status: 'completed', response_data: { vectorized: true } })
          .eq('id', log.id);

        processed++;
        console.log(`✅ Vectorized memory ${memoryId}`);

      } catch (error: any) {
        console.error(`❌ Failed to vectorize:`, error);
        const errorMessage = error?.message || String(error) || 'Unknown error';
        await supabase
          .from('webhook_logs')
          .update({ status: 'failed', error_message: errorMessage })
          .eq('id', log.id);
        failed++;
      }
    }

    console.log(`✅ Vectorization complete: ${processed} processed, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        processed, 
        failed, 
        total: pendingLogs.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in vectorize-memory function:', error);
    const errorMessage = error?.message || String(error) || 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
