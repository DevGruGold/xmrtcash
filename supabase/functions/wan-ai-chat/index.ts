import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WanAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: WanAIMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

serve(async (req) => {
  console.log('🔍 Incoming request:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const wanAiApiKey = Deno.env.get('WAN_AI_API_KEY');
    if (!wanAiApiKey) {
      console.error('❌ WAN_AI_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'WAN AI API key not configured' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { messages, model = 'qwen-max', temperature = 0.7, max_tokens = 2000 }: ChatRequest = await req.json();
    
    console.log('📦 Request data:', { model, messagesCount: messages.length });
    
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wanAiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Wan AI API Error:', response.status, errorText);
      
      let errorMessage = 'Wan AI API request failed';
      if (response.status === 401) {
        errorMessage = 'Invalid WAN AI API key';
      } else if (response.status === 429) {
        errorMessage = 'WAN AI API quota exceeded';
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: errorText }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('✅ Wan AI response received');
    
    if (!data.choices || data.choices.length === 0) {
      console.error('❌ No choices in Wan AI response');
      return new Response(
        JSON.stringify({ error: 'No response generated from WAN AI' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        content: data.choices[0].message.content,
        usage: data.usage 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});