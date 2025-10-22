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
    console.log('🔄 Processing pending knowledge extractions...');

    // Find pending extraction jobs
    const { data: pendingLogs, error: logsError } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_name', 'auto_extract_knowledge')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (logsError || !pendingLogs || pendingLogs.length === 0) {
      console.log('✅ No pending extractions');
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending extractions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Found ${pendingLogs.length} messages to extract knowledge from`);

    let processed = 0;
    let failed = 0;

    for (const log of pendingLogs) {
      try {
        const messageId = log.payload?.message_id;
        if (!messageId) {
          console.warn('⚠️ Log missing message_id:', log.id);
          continue;
        }

        // Get the message
        const { data: message, error: msgError } = await supabase
          .from('conversation_messages')
          .select('*')
          .eq('id', messageId)
          .single();

        if (msgError || !message || message.message_type !== 'assistant') {
          // Skip if not found or not an assistant message
          await supabase
            .from('webhook_logs')
            .update({ status: 'completed' })
            .eq('id', log.id);
          continue;
        }

        // Use OpenAI to extract entities
        const extractionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Extract key entities (concepts, technologies, people, organizations) from the text. Return a JSON array of objects with: entity_name, entity_type, description. Keep it concise.'
              },
              {
                role: 'user',
                content: message.content
              }
            ],
            max_tokens: 500,
            temperature: 0.3,
          }),
        });

        if (!extractionResponse.ok) {
          throw new Error(`OpenAI API error: ${extractionResponse.status}`);
        }

        const extractionData = await extractionResponse.json();
        const extractedText = extractionData.choices[0].message.content;

        // Try to parse JSON from response
        let entities = [];
        try {
          const jsonMatch = extractedText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            entities = JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          console.warn('Could not parse entities JSON:', parseError);
        }

        // Insert entities into knowledge_entities
        if (entities.length > 0) {
          for (const entity of entities.slice(0, 5)) { // Limit to 5 entities per message
            await supabase
              .from('knowledge_entities')
              .insert({
                entity_name: entity.entity_name || 'Unknown',
                entity_type: entity.entity_type || 'concept',
                description: entity.description || '',
                confidence_score: 0.7,
                source_type: 'conversation',
                source_id: messageId,
                metadata: { extractedFrom: 'assistant_message' }
              });
          }
          console.log(`✅ Extracted ${entities.length} entities from message ${messageId}`);
        }

        // Mark log as completed
        await supabase
          .from('webhook_logs')
          .update({ 
            status: 'completed', 
            response_data: { entities_extracted: entities.length } 
          })
          .eq('id', log.id);

        processed++;

      } catch (error) {
        console.error(`❌ Failed to extract knowledge:`, error);
        await supabase
          .from('webhook_logs')
          .update({ status: 'failed', error_message: error.message })
          .eq('id', log.id);
        failed++;
      }
    }

    console.log(`✅ Knowledge extraction complete: ${processed} processed, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        processed, 
        failed, 
        total: pendingLogs.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in extract-knowledge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
