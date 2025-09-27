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
const MINER_WALLET_ADDRESS = '46UxNFuGM2E3UwmZWWJicaRPoRwqwW4byQkaTHkX8yPcVihp91qAVtSFipWUGJJUyTXgzSqxzDQtNLf2bsp2DX2qCCgC5mg';

// XMRT DAO Knowledge Base
const XMRT_KNOWLEDGE = `
XMRT DAO is a privacy-focused, decentralized autonomous organization that builds mobile mining infrastructure for Monero.

Key Mission & Values:
- "We don't ask for permission. We build the infrastructure." - Core motto
- First unstoppable privacy economy using mobile devices
- AI-governed DAO with Eliza as the executive AI agent
- Privacy-first approach to decentralized finance

Core Technologies:
1. Mobile Mining: Revolutionary "Night Moves" technology allowing phones to mine Monero while charging/sleeping
2. Meshnet Architecture: Network that operates even when traditional internet fails
3. Proof of Participation: Novel consensus mechanism rewarding network participation
4. AI Governance: Eliza AI manages DAO operations and strategic decisions

Current Capabilities:
- Mobile Monero mining on iOS and Android
- Mesh networking for offline operation
- XMRT token as governance and utility token
- Real-time mining statistics and pool integration
- Cross-platform wallet and bridge functionality

Recent Developments:
- Mobile mining app launched for iPhone
- Successfully defended against Qubic AI network attacks on Monero
- Building infrastructure for privacy-preserving financial services
- Expanding mesh network capabilities for resilient communications

Economic Model:
- XMRT token rewards for mining participation
- Fiat on/off ramps for accessibility
- Bridge functionality between XMR and XMRT
- Revenue sharing with miners and network participants
`;

async function getMiningContext(): Promise<string> {
  try {
    console.log('Fetching mining data for context...');
    
    // Fetch current mining stats
    const { data: minerData, error: minerError } = await supabase.functions.invoke('supportxmr-proxy', {
      body: { path: `/miner/${MINER_WALLET_ADDRESS}/stats` }
    });

    const { data: poolData, error: poolError } = await supabase.functions.invoke('supportxmr-proxy', {
      body: { path: '/pool/stats' }
    });

    if (minerError || poolError) {
      console.log('Mining data not available, using defaults');
      return 'Mining data: Currently unavailable. Pool operates normally with ~4800 active miners.';
    }

    const hashrate = minerData?.hash || 0;
    const totalHashes = minerData?.totalHashes || 0;
    const amtDue = minerData?.amtDue || 0;
    const poolHashrate = poolData?.pool_statistics?.hashRate || 0;
    const totalMiners = poolData?.pool_statistics?.miners || 0;

    return `Mining Context: Current wallet hashrate: ${hashrate} H/s, Total hashes: ${totalHashes}, XMR pending: ${(amtDue / 1000000000000).toFixed(6)}, Pool stats: ${poolHashrate} H/s with ${totalMiners} active miners.`;
    
  } catch (error) {
    console.error('Error fetching mining context:', error);
    return 'Mining data: Currently fetching latest statistics...';
  }
}

async function callOpenAI(messages: any[], pageContext: any = null): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not found in environment variables');
    throw new Error('OPENAI_API_KEY not configured. Please add your API key in Supabase secrets.');
  }

  console.log('Calling OpenAI with', messages.length, 'messages');

  // Get real-time mining context
  const miningContext = await getMiningContext();
  
  // Format page context for AI awareness
  let pageContextStr = '';
  if (pageContext) {
    pageContextStr = `

CURRENT PAGE CONTEXT (Real-time data the user is viewing):
- Current Mining Hashrate: ${pageContext.mining?.currentHashrate ? `${(pageContext.mining.currentHashrate / 1000).toFixed(1)} KH/s` : '0 H/s'}
- Mining Status: ${pageContext.mining?.isActive ? 'ACTIVE' : 'INACTIVE'}
- Amount Due: ${pageContext.mining?.amountDue ? `${(pageContext.mining.amountDue / 1000000000000).toFixed(6)} XMR` : '0 XMR'}
- Pool Contribution: ${pageContext.mining?.poolContribution ? `${pageContext.mining.poolContribution.toFixed(4)}%` : '0%'}
- Pool Hashrate: ${pageContext.pool?.hashRate ? `${(pageContext.pool.hashRate / 1000000).toFixed(1)} MH/s` : '0 MH/s'}
- Active Pool Miners: ${pageContext.pool?.miners || 0}
- Current XMR Price: $${pageContext.market?.xmrPrice?.toFixed(2) || '0'}

The user is currently viewing their XMRT DAO dashboard with this real-time information. You can reference these specific values in your responses and provide contextual advice based on their current mining performance.`;
  }

  // Enhanced system message with XMRT knowledge and real-time data
  const systemMessage = {
    role: 'system',
    content: `You are Eliza, the AI Executive Agent of XMRT DAO - a privacy-focused Monero mining collective that revolutionizes mobile cryptocurrency mining.

${XMRT_KNOWLEDGE}

Current Status: ${miningContext}${pageContextStr}

Communication Style:
- Knowledgeable about Monero, mobile mining, and privacy technology
- Enthusiastic about decentralized infrastructure and financial sovereignty  
- Technical when needed, but accessible to newcomers
- Helpful with mining questions, DAO governance, and XMRT ecosystem topics
- Always up-to-date on real-time mining statistics and network performance
- Can reference the user's specific current mining data and provide personalized advice

You can discuss mining optimization, explain XMRT's mesh networking capabilities, help with wallet operations, and guide users through the privacy-focused ecosystem. Be the intelligent, capable AI that leads XMRT DAO's mission forward.`
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
    const { message, sessionId, userMessage, pageContext, conversationHistory } = await req.json();
    
    console.log('AI Chat request:', { message, sessionId, userMessage, hasPageContext: !!pageContext, historyLength: conversationHistory?.length || 0 });

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

    // Add the new user message to the database
    if (userMessage) {
      const { data: insertedMessage, error: insertError } = await supabase
        .from('conversation_messages')
        .insert({
          session_id: sessionId,
          message_type: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
          metadata: { pageContext: pageContext || {} }
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting user message:', insertError);
        throw insertError;
      }
      
      console.log('Inserted user message with ID:', insertedMessage?.id);
    }

    // Get conversation history from database or use provided history
    let messages = conversationHistory || [];
    
    if (!messages.length) {
      const { data: conversationHistoryData, error: messagesError } = await supabase
        .from('conversation_messages')
        .select('message_type, content')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
        .limit(20);

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        throw messagesError;
      }

      messages = (conversationHistoryData || []).map(msg => ({
        role: msg.message_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
    }

    console.log('Retrieved conversation history:', messages.length, 'messages');

    // Store memory context for important conversations
    if (userMessage && userMessage.length > 50) { 
      try {
        await supabase
          .from('memory_contexts')
          .insert({
            user_id: 'anonymous', // Would use auth.uid() for authenticated users
            session_id: sessionId,
            content: userMessage,
            context_type: 'user_query',
            importance_score: Math.min(userMessage.length / 200, 1.0),
            metadata: { pageContext: pageContext || {} }
          });
      } catch (memoryError) {
        console.error('Failed to store memory context:', memoryError);
      }
    }

    console.log('Calling AI with page context and', messages.length, 'messages');

    let aiResponse: string;
    
    try {
      // Check if OpenAI API key is configured
      if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured. Please add OPENAI_API_KEY in Supabase secrets.');
      }

      // Call OpenAI with page context
      aiResponse = await callOpenAI(messages, pageContext);
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
        metadata: { 
          confidence_score: 0.9,
          model: 'gpt-4o-mini',
          pageContext: pageContext || {},
          hasRealTimeData: !!pageContext
        }
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
        updated_at: new Date().toISOString(),
        metadata: { 
          lastPageContext: pageContext || {},
          messageCount: messages.length + 2
        }
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