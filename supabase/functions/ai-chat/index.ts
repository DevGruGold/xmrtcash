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

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

async function callOpenAI(messages: any[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not found in environment variables');
    throw new Error('OPENAI_API_KEY not configured. Please add your API key in Supabase secrets.');
  }

  console.log('Calling OpenAI with', messages.length, 'messages');

  // Add system message for context
  const systemMessage = {
    role: 'system',
    content: 'You are Eliza, an intelligent AI assistant for the XMRT DAO platform - a privacy-focused Monero mining collective. You help users with mining questions, DAO governance, technical support, and general XMRT ecosystem topics. Be helpful, knowledgeable about Monero and mining, and maintain a friendly tone while respecting privacy principles.'
  };

  const messagesWithSystem = [systemMessage, ...messages];
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messagesWithSystem,
      max_tokens: 1000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API Error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    console.error('OpenAI returned no choices:', data);
    throw new Error('OpenAI returned no response choices');
  }
  
  return data.choices[0].message.content;
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

    // Validate session exists
    const { data: session, error: sessionCheckError } = await supabase
      .from('conversation_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (sessionCheckError || !session) {
      console.error('Invalid session ID:', sessionId, sessionCheckError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid session ID',
          success: false
        }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get conversation history from database
    const { data: messages, error: messagesError } = await supabase
      .from('conversation_messages')
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
      const { data: insertedMessage, error: insertError } = await supabase
        .from('conversation_messages')
        .insert({
          session_id: sessionId,
          message_type: 'user',
          content: userMessage,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting user message:', insertError);
        throw insertError;
      }
      
      console.log('Inserted user message with ID:', insertedMessage?.id);
    }

    // Prepare conversation history for AI
    const conversationHistory = (messages || []).map(msg => ({
      role: msg.message_type === 'user' ? 'user' : 'assistant',
      content: msg.content
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
      // Check if OpenAI API key is configured
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY in Supabase secrets.');
      }

      // Call OpenAI
      aiResponse = await callOpenAI(conversationHistory);
      console.log('✅ OpenAI response received successfully');
      
    } catch (openaiError) {
      console.error('❌ OpenAI API failed:', openaiError);
      
      // Provide specific error message based on the failure type
      if (openaiError instanceof Error && openaiError.message.includes('not configured')) {
        throw new Error('OpenAI API key is not properly configured. Please check your OPENAI_API_KEY in Supabase secrets.');
      } else {
        throw new Error('OpenAI service is currently unavailable. Please try again later.');
      }
    }

    // Save AI response to database
    const { data: insertedResponse, error: responseError } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        message_type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        metadata: { confidence_score: 0.9 }
      })
      .select()
      .single();

    if (responseError) {
      console.error('Error saving AI response:', responseError);
      throw responseError;
    }

    console.log('Inserted AI response with ID:', insertedResponse?.id);

    // Update session activity
    const { error: sessionError } = await supabase
      .from('conversation_sessions')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (sessionError) {
      console.error('Error updating session:', sessionError);
    } else {
      console.log('Updated session timestamp successfully');
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