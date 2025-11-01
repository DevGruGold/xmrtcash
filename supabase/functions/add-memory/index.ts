import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddMemoryRequest {
  content: string;
  context_type: string;
  importance_score?: number;
  metadata?: Record<string, any>;
  session_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      content, 
      context_type, 
      importance_score = 5, 
      metadata = {},
      session_id 
    }: AddMemoryRequest = await req.json();

    if (!content || !context_type) {
      return new Response(
        JSON.stringify({ error: 'content and context_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('💾 Storing memory:', { context_type, content_length: content.length });

    // Generate embedding
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured - memory stored without embedding',
          memory_id: null
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: content,
        model: 'text-embedding-3-small'
      })
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // Store memory with embedding
    const { data: memory, error: insertError } = await supabase
      .from('memory_contexts')
      .insert({
        content,
        context_type,
        importance_score,
        embedding,
        metadata: {
          ...metadata,
          stored_at: new Date().toISOString(),
          embedding_model: 'text-embedding-3-small'
        },
        session_id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to store memory:', insertError);
      throw insertError;
    }

    console.log('✅ Memory stored:', memory.id);

    // Trigger knowledge extraction (fire and forget)
    supabase.functions.invoke('extract-knowledge', {
      body: { memory_id: memory.id }
    }).catch((err: any) => console.warn('Knowledge extraction failed:', err));

    return new Response(
      JSON.stringify({
        success: true,
        memory_id: memory.id,
        context_type,
        importance_score
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('add-memory error:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to store memory'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
