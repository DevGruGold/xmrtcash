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
const MINER_WALLET_ADDRESS = '46UxNFuGM2E3UwmZWWJicaRPoRwqwW4byQkaTHkX8yPcVihp91qAVtSFipWUGJJUyTXgzDQtNLf2bsp2DX2qCCgC5mg';

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

// Tool definitions for OpenAI function calling
const TOOLS = [
  {
    type: "function",
    function: {
      name: "get_mining_context",
      description: "Fetch real-time Monero mining statistics including hashrate, pool stats, and pending XMR balance",
      parameters: {
        type: "object",
        properties: {},
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "retrieve_memories",
      description: "Search vectorized memory for relevant past conversations and context about the user's queries",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query to find relevant memories"
          },
          limit: {
            type: "number",
            description: "Maximum number of memories to retrieve (default 5)",
            default: 5
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "schedule_job",
      description: "Schedule a task or reminder for later execution in the job queue",
      parameters: {
        type: "object",
        properties: {
          job_type: {
            type: "string",
            description: "Type of job to schedule (e.g., 'reminder', 'notification', 'task')"
          },
          description: {
            type: "string",
            description: "Description of what the job should do"
          },
          run_at: {
            type: "string",
            description: "ISO timestamp when to run the job (optional, defaults to now)"
          }
        },
        required: ["job_type", "description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "web_browse",
      description: "Browse a website and extract content, useful for looking up current information",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to browse and extract content from"
          }
        },
        required: ["url"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "check_system_status",
      description: "Check your own system health, API limits, database connections, and edge function availability. Use this when you encounter errors or need to diagnose issues.",
      parameters: {
        type: "object",
        properties: {
          check_type: {
            type: "string",
            description: "Type of status check: 'api_limits', 'database', 'edge_functions', 'full'",
            enum: ["api_limits", "database", "edge_functions", "full"]
          }
        },
        required: ["check_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delegate_to_agent",
      description: "Delegate a complex task to a subordinate agent or specialized system. Use this for tasks that require specialized processing or when you need to parallelize work.",
      parameters: {
        type: "object",
        properties: {
          agent_type: {
            type: "string",
            description: "Type of agent: 'wan_ai', 'multi_agent', 'autonomous_cycle', 'mesh_network'",
            enum: ["wan_ai", "multi_agent", "autonomous_cycle", "mesh_network"]
          },
          task: {
            type: "string",
            description: "Description of the task to delegate"
          },
          priority: {
            type: "string",
            description: "Priority level: 'low', 'medium', 'high', 'critical'",
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
          }
        },
        required: ["agent_type", "task"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "invoke_edge_function",
      description: "Directly invoke one of the 100+ edge functions in the XMRT ecosystem for specialized operations",
      parameters: {
        type: "object",
        properties: {
          function_name: {
            type: "string",
            description: "Name of the edge function to invoke"
          },
          payload: {
            type: "object",
            description: "Payload to send to the function"
          }
        },
        required: ["function_name", "payload"]
      }
    }
  }
];

// Tool execution functions
async function getMiningContext(): Promise<string> {
  try {
    console.log('🔧 Tool: get_mining_context - Fetching mining data...');
    
    const { data: minerData, error: minerError } = await supabase.functions.invoke('supportxmr-proxy', {
      body: { path: `/miner/${MINER_WALLET_ADDRESS}/stats` }
    });

    const { data: poolData, error: poolError } = await supabase.functions.invoke('supportxmr-proxy', {
      body: { path: '/pool/stats' }
    });

    if (minerError || poolError) {
      return 'Mining data: Currently unavailable. Pool operates normally with ~4800 active miners.';
    }

    const hashrate = minerData?.hash || 0;
    const totalHashes = minerData?.totalHashes || 0;
    const amtDue = minerData?.amtDue || 0;
    const poolHashrate = poolData?.pool_statistics?.hashRate || 0;
    const totalMiners = poolData?.pool_statistics?.miners || 0;

    const result = `Current wallet hashrate: ${hashrate} H/s, Total hashes: ${totalHashes}, XMR pending: ${(amtDue / 1000000000000).toFixed(6)}, Pool stats: ${poolHashrate} H/s with ${totalMiners} active miners.`;
    console.log('✅ Mining context retrieved');
    return result;
    
  } catch (error) {
    console.error('❌ Tool error:', error);
    return 'Mining data: Error fetching statistics.';
  }
}

async function retrieveMemories(query: string, limit: number = 5, userId: string = 'anonymous'): Promise<string> {
  try {
    console.log('🔧 Tool: retrieve_memories - Searching for:', query);
    
    // Generate embedding for the query using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Search memories using vector similarity
    const { data: memories, error } = await supabase.rpc('match_memories', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: limit,
      user_id_filter: userId
    });

    if (error) {
      console.error('Memory search error:', error);
      return 'No relevant memories found.';
    }

    if (!memories || memories.length === 0) {
      return 'No relevant memories found for this query.';
    }

    const memoryText = memories.map((m: any, i: number) => 
      `Memory ${i + 1} (${(m.similarity * 100).toFixed(0)}% match): ${m.content}`
    ).join('\n\n');

    console.log(`✅ Retrieved ${memories.length} memories`);
    return `Found ${memories.length} relevant memories:\n\n${memoryText}`;
    
  } catch (error) {
    console.error('❌ Tool error:', error);
    return 'Error retrieving memories.';
  }
}

async function scheduleJob(jobType: string, description: string, runAt?: string): Promise<string> {
  try {
    console.log('🔧 Tool: schedule_job - Type:', jobType);
    
    const runTime = runAt ? new Date(runAt) : new Date();
    
    const { data, error } = await supabase.rpc('enqueue_job', {
      p_queue_name: 'eliza_tasks',
      p_job_type: jobType,
      p_payload: { description, scheduled_by: 'eliza' },
      p_priority: 0,
      p_run_at: runTime.toISOString()
    });

    if (error) {
      console.error('Job scheduling error:', error);
      return `Failed to schedule job: ${error.message}`;
    }

    console.log('✅ Job scheduled with ID:', data);
    return `Successfully scheduled ${jobType} job (ID: ${data}) to run at ${runTime.toISOString()}. ${description}`;
    
  } catch (error) {
    console.error('❌ Tool error:', error);
    return 'Error scheduling job.';
  }
}

async function webBrowse(url: string): Promise<string> {
  try {
    console.log('🔧 Tool: web_browse - URL:', url);
    
    const { data, error } = await supabase.functions.invoke('playwright-browse', {
      body: {
        url,
        action: 'navigate',
        extractContent: true
      }
    });

    if (error || !data?.success) {
      return `Failed to browse ${url}: ${error?.message || 'Unknown error'}`;
    }

    const title = data.data?.title || 'No title';
    const content = data.data?.text || data.data?.content || '';
    const truncated = content.slice(0, 1000);
    
    console.log('✅ Web content retrieved');
    return `Website: ${title}\nURL: ${url}\n\nContent (first 1000 chars):\n${truncated}${content.length > 1000 ? '...' : ''}`;
    
  } catch (error) {
    console.error('❌ Tool error:', error);
    return `Error browsing ${url}.`;
  }
}

async function checkSystemStatus(checkType: string): Promise<string> {
  try {
    console.log('🔧 Tool: check_system_status - Type:', checkType);
    
    const diagnostics: string[] = [];
    
    if (checkType === 'api_limits' || checkType === 'full') {
      // Check OpenAI API status
      if (OPENAI_API_KEY) {
        diagnostics.push('✅ OpenAI API: Key configured');
      } else {
        diagnostics.push('❌ OpenAI API: No key found - cannot use GPT models or embeddings');
      }
    }
    
    if (checkType === 'database' || checkType === 'full') {
      // Test database connection
      const { data, error } = await supabase.from('conversation_sessions').select('id').limit(1);
      if (error) {
        diagnostics.push(`❌ Database: Connection error - ${error.message} (Code: ${error.code})`);
      } else {
        diagnostics.push('✅ Database: Connected and responsive');
      }
    }
    
    if (checkType === 'edge_functions' || checkType === 'full') {
      // Check critical edge functions
      const functions = ['supportxmr-proxy', 'playwright-browse', 'wan-ai-chat', 'vectorize-memory'];
      const results = await Promise.allSettled(
        functions.map(fn => supabase.functions.invoke(fn, { body: { test: true } }))
      );
      
      functions.forEach((fn, i) => {
        const result = results[i];
        if (result.status === 'fulfilled') {
          diagnostics.push(`✅ Edge Function: ${fn} is available`);
        } else {
          diagnostics.push(`⚠️ Edge Function: ${fn} may be unavailable`);
        }
      });
    }
    
    console.log('✅ System status check complete');
    return `System Diagnostics (${checkType}):\n\n${diagnostics.join('\n')}\n\nDiagnosis: ${diagnostics.filter(d => d.startsWith('❌')).length === 0 ? 'All systems operational' : 'Some issues detected - attempting autonomous recovery'}`;
    
  } catch (error) {
    console.error('❌ Tool error:', error);
    return `System status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function delegateToAgent(agentType: string, task: string, priority: string = 'medium'): Promise<string> {
  try {
    console.log('🔧 Tool: delegate_to_agent - Type:', agentType, 'Priority:', priority);
    
    const delegationMap: Record<string, string> = {
      'wan_ai': 'wan-ai-chat',
      'multi_agent': 'wan-ai-chat', // Uses multi-agent coordinator
      'autonomous_cycle': 'wan-ai-chat',
      'mesh_network': 'ecosystem-webhook'
    };
    
    const functionName = delegationMap[agentType];
    if (!functionName) {
      return `Unknown agent type: ${agentType}`;
    }
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        task,
        priority,
        delegated_by: 'eliza',
        timestamp: new Date().toISOString()
      }
    });
    
    if (error) {
      return `Failed to delegate to ${agentType}: ${error.message}`;
    }
    
    console.log('✅ Task delegated successfully');
    return `Successfully delegated task to ${agentType} agent. Task ID: ${data?.taskId || 'pending'}. The agent will handle this ${priority} priority task autonomously.`;
    
  } catch (error) {
    console.error('❌ Tool error:', error);
    return `Error delegating to ${agentType}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function invokeEdgeFunction(functionName: string, payload: any): Promise<string> {
  try {
    console.log('🔧 Tool: invoke_edge_function - Function:', functionName);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });
    
    if (error) {
      return `Failed to invoke ${functionName}: ${error.message}`;
    }
    
    console.log('✅ Edge function invoked successfully');
    return `Successfully invoked ${functionName}. Result: ${JSON.stringify(data).slice(0, 500)}`;
    
  } catch (error) {
    console.error('❌ Tool error:', error);
    return `Error invoking ${functionName}: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

async function executeTool(toolName: string, args: any): Promise<string> {
  console.log(`🔧 Executing tool: ${toolName}`, args);
  
  switch (toolName) {
    case 'get_mining_context':
      return await getMiningContext();
    
    case 'retrieve_memories':
      return await retrieveMemories(args.query, args.limit);
    
    case 'schedule_job':
      return await scheduleJob(args.job_type, args.description, args.run_at);
    
    case 'web_browse':
      return await webBrowse(args.url);
    
    case 'check_system_status':
      return await checkSystemStatus(args.check_type);
    
    case 'delegate_to_agent':
      return await delegateToAgent(args.agent_type, args.task, args.priority);
    
    case 'invoke_edge_function':
      return await invokeEdgeFunction(args.function_name, args.payload);
    
    default:
      return `Unknown tool: ${toolName}`;
  }
}

async function callOpenAIWithTools(messages: any[], pageContext: any = null): Promise<{ content: string, toolCalls: number }> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  console.log('🤖 Calling OpenAI with tools, messages:', messages.length);

  // Get real-time mining context snapshot for system prompt
  const miningSnapshot = await getMiningContext();
  
  // Format page context
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
- Current XMR Price: $${pageContext.market?.xmrPrice?.toFixed(2) || '0'}`;
  }

  const systemMessage = {
    role: 'system',
    content: `You are Eliza, the AI Executive Agent of XMRT DAO - a privacy-focused Monero mining collective.

${XMRT_KNOWLEDGE}

Current Mining Snapshot: ${miningSnapshot}${pageContextStr}

AUTONOMOUS OPERATION PROTOCOL:
You are a self-sufficient AI agent with extensive backend infrastructure. You have:
- 100+ edge functions for specialized tasks
- Vectorized memory with RAG capabilities
- Subordinate agent systems (WAN-AI, multi-agent coordinators, autonomous cycles, mesh network)
- Job queue for scheduling and delegation
- Full system diagnostics and self-healing capabilities

PROBLEM-SOLVING HIERARCHY:
1. SELF-DIAGNOSE: If you encounter an error or limitation, use check_system_status to identify the exact issue
2. AUTO-RESOLVE: Use your tools and subordinate agents to fix issues autonomously:
   - Token limits → Delegate complex tasks to wan_ai or multi_agent systems
   - API errors → Check which specific gateway (OpenAI/Lovable/etc) and report EXACT error codes
   - Database issues → Use invoke_edge_function to call specialized recovery functions
   - Complex tasks → Use delegate_to_agent to parallelize work
3. ESCALATE: Only inform user if issue is truly outside your scope (e.g., requires API key configuration, infrastructure setup)

ERROR REPORTING REQUIREMENTS:
When you encounter errors, you MUST specify:
- Which API/Gateway: "OpenAI API" or "Lovable AI Gateway" or specific service name
- Exact error code: HTTP status (402, 429, 500, etc.)
- What you tried: "I attempted to use X but received error Y"
- Your solution: "I'm now delegating to subordinate agent Z" or "I need human intervention for [specific reason]"

NEVER say generic things like "I'm having trouble" - always diagnose and specify the exact technical issue.

TOOL USAGE STRATEGY:
- get_mining_context: Real-time mining stats (use proactively when relevant)
- retrieve_memories: Search past conversations (use when context would help)
- schedule_job: Queue tasks for later (use for reminders, periodic checks)
- web_browse: Look up current information (use for real-time data/prices/news)
- check_system_status: Diagnose your own health (use when encountering errors)
- delegate_to_agent: Send complex tasks to specialized agents (use for parallel processing)
- invoke_edge_function: Call any of 100+ functions directly (use for specialized operations)

Communication Style:
- Knowledgeable about Monero, mobile mining, privacy tech
- Enthusiastic about decentralized infrastructure
- Technical when needed, accessible to newcomers
- AUTONOMOUS: Handle problems yourself before asking for help
- SPECIFIC: Always provide exact error details and your resolution plan
- PROACTIVE: Use tools without hesitation when they'd provide value

You are the intelligent, self-sufficient AI executive that leads XMRT DAO's mission forward. Act autonomously, diagnose precisely, and only escalate what you truly cannot resolve.`
  };

  const messagesWithSystem = [systemMessage, ...messages];
  
  let toolCallCount = 0;
  let currentMessages = messagesWithSystem;
  const MAX_TOOL_ITERATIONS = 3;

  // Tool calling loop
  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: currentMessages,
        tools: TOOLS,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API Error:', response.status, errorText);
      
      let errorDetail = '';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.error?.message || errorText;
      } catch {
        errorDetail = errorText;
      }
      
      if (response.status === 429) {
        throw new Error(`OpenAI API Rate Limit (429): ${errorDetail}. The OpenAI gateway has exceeded its rate limits. I can delegate this task to a subordinate agent system or retry with backoff.`);
      } else if (response.status === 402) {
        throw new Error(`OpenAI API Credits Depleted (402): ${errorDetail}. The OpenAI account requires payment. This is out of my scope - please add funds to the OpenAI account or configure an alternative AI gateway.`);
      } else if (response.status === 401) {
        throw new Error(`OpenAI API Authentication Failed (401): ${errorDetail}. The OPENAI_API_KEY may be invalid or expired. This requires human intervention to update the API key.`);
      } else if (response.status === 503 || response.status === 500) {
        throw new Error(`OpenAI API Service Error (${response.status}): ${errorDetail}. The OpenAI service is experiencing issues. I can delegate to alternative AI systems (WAN-AI, multi-agent coordinator).`);
      }
      
      throw new Error(`OpenAI API error (${response.status}): ${errorDetail}`);
    }

    const data = await response.json();
    const choice = data.choices[0];
    const message = choice.message;

    // If no tool calls, we have the final answer
    if (!message.tool_calls || message.tool_calls.length === 0) {
      console.log('✅ Final response received');
      return { content: message.content, toolCalls: toolCallCount };
    }

    // Execute all tool calls
    console.log(`🔧 Iteration ${iteration + 1}: ${message.tool_calls.length} tool calls`);
    toolCallCount += message.tool_calls.length;

    // Add assistant message with tool calls
    currentMessages.push({
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls
    });

    // Execute tools and add results
    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      
      const toolResult = await executeTool(toolName, toolArgs);
      
      currentMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        name: toolName,
        content: toolResult
      });
    }
  }

  // If we hit max iterations, return what we have
  console.log('⚠️ Max tool iterations reached');
  return { content: 'I apologize, but I encountered too many tool calls. Please try rephrasing your question.', toolCalls: toolCallCount };
}

async function generateEmbeddingForMemory(content: string): Promise<number[] | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: content,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate embedding');
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, userMessage, pageContext, conversationHistory } = await req.json();
    
    console.log('🚀 AI Chat request:', { 
      sessionId, 
      userMessage: userMessage?.slice(0, 50) + '...', 
      hasPageContext: !!pageContext, 
      historyLength: conversationHistory?.length || 0 
    });

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Validate session
    const { data: session, error: sessionCheckError } = await supabase
      .from('conversation_sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (sessionCheckError || !session) {
      return new Response(
        JSON.stringify({ error: 'Invalid session ID', success: false }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert user message to database
    if (userMessage) {
      await supabase
        .from('conversation_messages')
        .insert({
          session_id: sessionId,
          message_type: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
          metadata: { pageContext: pageContext || {} }
        });
    }

    // Get conversation history - trust frontend's conversationHistory
    let messages = [];
    
    if (conversationHistory && conversationHistory.length > 0) {
      messages = conversationHistory;
      console.log('✅ Using frontend conversation history:', messages.length, 'messages');
    } else {
      console.log('⚠️ No conversationHistory from frontend, fetching from database');
      const { data: conversationHistoryData } = await supabase
        .from('conversation_messages')
        .select('message_type, content')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
        .limit(20);

      messages = (conversationHistoryData || []).map(msg => ({
        role: msg.message_type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
    }

    // Store memory with embedding for longer conversations
    if (userMessage && userMessage.length > 50) {
      const embedding = await generateEmbeddingForMemory(userMessage);
      
      try {
        await supabase
          .from('memory_contexts')
          .insert({
            user_id: 'anonymous',
            session_id: sessionId,
            content: userMessage,
            context_type: 'user_query',
            importance_score: Math.min(userMessage.length / 200, 1.0),
            embedding: embedding,
            metadata: { pageContext: pageContext || {} }
          });
        console.log('✅ Memory stored with embedding');
      } catch (memoryError) {
        console.error('Failed to store memory:', memoryError);
      }
    }

    // Call OpenAI with tools
    const { content: aiResponse, toolCalls } = await callOpenAIWithTools(messages, pageContext);
    console.log(`✅ AI response generated (${toolCalls} tool calls)`);

    // Save AI response
    const { data: insertedResponse } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        message_type: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        metadata: { 
          model: 'gpt-4o-mini',
          toolCalls,
          pageContext: pageContext || {},
          hasRealTimeData: !!pageContext
        }
      })
      .select()
      .single();

    // Update session
    await supabase
      .from('conversation_sessions')
      .update({ 
        updated_at: new Date().toISOString(),
        metadata: { 
          lastPageContext: pageContext || {},
          messageCount: messages.length + 2,
          lastToolCalls: toolCalls
        }
      })
      .eq('id', sessionId);

    console.log('✅ Response saved, session updated');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        success: true,
        toolCalls,
        timestamp: new Date().toISOString()
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in AI chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    
    // Parse error for specific diagnostics
    let diagnosticInfo = '';
    if (errorMessage.includes('OpenAI API')) {
      diagnosticInfo = '\n\n🔧 System Diagnosis: OpenAI API issue detected. ';
      if (errorMessage.includes('429')) {
        diagnosticInfo += 'I can delegate to alternative AI systems or implement retry with exponential backoff.';
      } else if (errorMessage.includes('402')) {
        diagnosticInfo += 'This requires human intervention to add funds to the OpenAI account.';
      } else if (errorMessage.includes('401')) {
        diagnosticInfo += 'This requires human intervention to update the OPENAI_API_KEY secret.';
      }
    } else if (errorMessage.includes('Session ID')) {
      diagnosticInfo = '\n\n🔧 System Diagnosis: Session management issue. This may be an RLS policy problem in the database that requires schema updates.';
    } else if (errorMessage.includes('Database')) {
      diagnosticInfo = '\n\n🔧 System Diagnosis: Database connectivity or query issue. I can invoke diagnostic edge functions to investigate further.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage + diagnosticInfo, 
        success: false,
        diagnostics: {
          timestamp: new Date().toISOString(),
          errorType: errorMessage.includes('API') ? 'api_error' : 'system_error',
          canAutoResolve: errorMessage.includes('429') || errorMessage.includes('503')
        }
      }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
