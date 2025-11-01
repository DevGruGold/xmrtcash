import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueryMemoryRequest {
  query: string;
  limit?: number;
  threshold?: number;
  context_type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 10, threshold = 0.7, context_type }: QueryMemoryRequest = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required', memories: [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🧠 Searching memories for:', query);

    // Generate embedding for query using OpenAI
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured',
          memories: []
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get embedding
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: query,
        model: 'text-embedding-3-small'
      })
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search memories using pgvector
    const { data: memories, error: searchError } = await supabase.rpc(
      'match_memories',
      {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_context_type: context_type
      }
    );

    if (searchError) {
      console.error('Memory search error:', searchError);
      throw searchError;
    }

    console.log(`✅ Found ${memories?.length || 0} relevant memories`);

    return new Response(
      JSON.stringify({
        query,
        memories: memories || [],
        count: memories?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('query-memory error:', error);
    return new Response(
      JSON.stringify({ 
        error: error?.message || 'Failed to query memories',
        memories: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
