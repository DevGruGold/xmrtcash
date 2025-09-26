import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const WAN_AI_API_KEY = Deno.env.get('WAN_AI_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

async function callWanAI(messages: any[]): Promise<string> {
  if (!WAN_AI_API_KEY) {
    throw new Error('WAN_AI_API_KEY not configured');
  }

  const response = await fetch('https://wanai.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WAN_AI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-1-20250805',
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7,
      system: "You are an intelligent AI assistant for an XMRT (Monero mining ecosystem) platform. You provide helpful, accurate, and engaging responses about cryptocurrency mining, Monero, blockchain technology, and related topics. Be conversational and remember the context of our conversation. Avoid canned responses - provide thoughtful, personalized answers based on the conversation history."
    }),
  });

  if (!response.ok) {
    throw new Error(`WAN AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(messages: any[]): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  // Convert messages to Gemini format
  const conversationText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an intelligent AI assistant for an XMRT (Monero mining ecosystem) platform. Based on the conversation history below, provide a helpful, accurate, and engaging response. Be conversational and remember the context. Avoid canned responses.\n\nConversation:\n${conversationText}\n\nProvide your response:`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userMessage } = await req.json();
    
    console.log('AI Chat request:', { message, sessionId, userMessage });

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Get conversation history from database
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      throw messagesError;
    }

    console.log('Retrieved conversation history:', messages?.length || 0, 'messages');

    // Add the new user message to the database
    if (userMessage) {
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          sender: 'user',
          message_text: userMessage,
          timestamp: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting user message:', insertError);
        throw insertError;
      }
    }

    // Prepare conversation history for AI
    const conversationHistory = (messages || []).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.message_text
    }));

    // Add the current user message if provided
    if (userMessage) {
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });
    }

    console.log('Sending to AI:', conversationHistory.length, 'messages');

    let aiResponse: string;
    
    try {
      // Try WAN AI first
      aiResponse = await callWanAI(conversationHistory);
      console.log('WAN AI response received');
    } catch (wanError) {
      console.warn('WAN AI failed, trying Gemini:', wanError);
      try {
        // Fallback to Gemini
        aiResponse = await callGemini(conversationHistory);
        console.log('Gemini response received');
      } catch (geminiError) {
        console.error('Both AI services failed:', { wanError, geminiError });
        throw new Error('All AI services are currently unavailable. Please try again later.');
      }
    }

    // Save AI response to database
    const { error: responseError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: sessionId,
        sender: 'assistant',
        message_text: aiResponse,
        timestamp: new Date().toISOString(),
        confidence_score: 0.9
      });

    if (responseError) {
      console.error('Error saving AI response:', responseError);
      throw responseError;
    }

    // Update session activity
    const { error: sessionError } = await supabase
      .from('chat_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (sessionError) {
      console.error('Error updating session:', sessionError);
    }

    console.log('AI Chat response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        timestamp: new Date().toISOString()
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in AI chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred while processing your request';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});