import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import { OpenAI } from 'https://esm.sh/openai@4.49.1'

console.info('ai-chat started - OpenMemory Agent');

// --- Configuration ---
const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // Should be set for secure internal calls

// --- Tool Definitions for OpenAI (Reflecting OpenMemory API) ---
const tools = [
  {
    type: "function",
    function: {
      name: "exec_python",
      description: "Executes a Python code snippet via the python-executor Edge Function. Use this tool when the user asks to run or execute Python code.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The Python code snippet to execute. Must be a single string."
          }
        },
        required: ["code"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_memory",
      description: "Adds a new memory to the OpenMemory system. Use this when the user provides a fact, insight, or important piece of information to be stored.",
      parameters: {
        type: "object",
        properties: {
          content: {
            type: "string",
            description: "The content of the memory to be stored."
          },
          sector: {
            type: "string",
            description: "The primary memory sector (e.g., 'semantic', 'episodic', 'procedural'). Defaults to 'semantic'."
          }
        },
        required: ["content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "query_memory",
      description: "Queries the OpenMemory system for relevant memories based on a user's question or context. Use this to retrieve facts or past information.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The natural language query to search for relevant memories."
          },
          k: {
            type: "integer",
            description: "The number of top memories to retrieve (e.g., 5). Defaults to 5."
          }
        },
        required: ["query"]
      }
    }
  }
];

// --- Lazy OpenAI Client Initialization ---
let openaiClient = null;

function getOpenAIClient() {
  if (openaiClient) return openaiClient;
  
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable is not set. AI functions will be disabled.");
      return null; 
  }
  
  openaiClient = new OpenAI({
    apiKey: apiKey,
    baseURL: Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1',
  });
  return openaiClient;
}

// --- Internal Function Calling ---

// Function to call another Supabase Edge Function
async function callEdgeFunction(functionName, payload) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return { error: "Supabase URL or Service Role Key is missing for internal function calls." };
  }
  
  // NOTE: Assuming OpenMemory API is exposed via a separate Edge Function or a dedicated API endpoint.
  // For this implementation, we will assume a generic 'openmemory-api' Edge Function handles the memory operations.
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        return { error: `Function call failed with status ${response.status}: ${errorText}` };
    }

    return await response.json();
  } catch (error) {
    return { error: `Network error calling function ${functionName}: ${error.message}` };
  }
}

// --- AI Chat Logic with Tool Use ---

// Helper function to determine content type and extract text/url
function extractContent(body) {
  let content = '';
  let contentType = 'text';
  
  if (body && body.text) {
    content = body.text;
  } else if (body && body.url) {
    content = body.url;
    contentType = 'url';
  } else if (typeof body === 'string') {
    content = body;
  }
  
  // Basic check for a URL pattern in the text
  if (content.startsWith('http://') || content.startsWith('https://')) {
    contentType = 'url';
  }
  
  return { content, contentType };
}

// Function to fetch content from a URL (e.g., GitHub raw file, simple text file)
async function fetchUrlContent(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return `Error fetching content from ${url}: ${response.statusText}`;
    }
    // Limit size to prevent abuse and memory issues
    const text = await response.text();
    if (text.length > 50000) { // 50KB limit
        return "Content too large to process.";
    }
    return text;
  } catch (error) {
    return `Network error fetching content: ${error.message}`;
  }
}

// Function to call the AI model for analysis and response generation
async function getAIResponse(userContent, contentType) {
  const client = getOpenAIClient();
  if (!client) {
      return "AI service is unavailable. OPENAI_API_KEY is missing in the environment.";
  }
  
  let messages = [
    {
      role: "system",
      content: "You are the intelligent agent 'Eliza', powered by the OpenMemory architecture. You have access to tools for code execution and memory management. Your primary goal is to assist the user by intelligently deciding whether to use a tool or provide a direct answer. Use the `add_memory` tool when the user provides a fact or insight to be stored. Use the `query_memory` tool when the user asks a question that requires retrieving past information. Use the `exec_python` tool when the user asks to run or execute Python code. If the user provides content (code, URL), analyze it and respond directly. Do not use tools for analysis."
    },
    {
      role: "user",
      content: userContent
    }
  ];

  let toolCalls = [];
  let finalResponse = null;
  let toolOutput = null;

  // First call to the model
  const firstResponse = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    tools: tools,
    tool_choice: "auto",
  });

  if (firstResponse.choices[0].message.tool_calls) {
    toolCalls = firstResponse.choices[0].message.tool_calls;
    messages.push(firstResponse.choices[0].message);

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      
      let functionResult = null;

      if (functionName === 'exec_python') {
        functionResult = await callEdgeFunction('python-executor', { code: functionArgs.code });
      } else if (functionName === 'add_memory') {
        // NOTE: Assuming a separate 'openmemory-api' function handles the memory logic
        const payload = {
            endpoint: '/memory/add',
            content: functionArgs.content,
            sector: functionArgs.sector || 'semantic'
        };
        functionResult = await callEdgeFunction('openmemory-api', payload);
      } else if (functionName === 'query_memory') {
        const payload = {
            endpoint: '/memory/query',
            query: functionArgs.query,
            k: functionArgs.k || 5
        };
        functionResult = await callEdgeFunction('openmemory-api', payload);
      }
      
      // Add the function response to the messages for the next turn
      messages.push({
        tool_call_id: toolCall.id,
        role: "tool",
        name: functionName,
        content: JSON.stringify(functionResult),
      });
    }

    // Second call to the model to summarize the tool output
    const secondResponse = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });
    
    finalResponse = secondResponse.choices[0].message.content.trim();

  } else {
    // No tool call, just a direct text response
    finalResponse = firstResponse.choices[0].message.content.trim();
  }

  return finalResponse;
}

// --- Main Deno Serve Handler ---

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Health check: GET returns 200
  if (req.method === 'GET' && (url.pathname === '/ai-chat' || url.pathname === '/')) {
    return new Response(JSON.stringify({
      status: 'ok',
      version: 'openmemory-agent'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  }

  if (req.method === 'POST') {
    let body = {};
    const contentType = req.headers.get('content-type');
    const contentLength = req.headers.get('content-length');

    // Safe body parsing logic
    try {
      if (contentLength === '0' || !contentType) {
        body = {}; // Handle empty body
      } else if (contentType.includes('application/json')) {
        body = await req.json();
      } else {
        // Fallback for non-JSON content types
        const text = await req.text();
        try {
          body = text ? JSON.parse(text) : {};
        } catch (_) {
          body = { text: text };
        }
      }
    } catch (e) {
      // Catch all parsing errors and return 400
      return new Response(JSON.stringify({
        error: 'Invalid or unparsable request body',
        details: String(e)
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        }
      });
    }

    const { content: userContent, contentType: detectedType } = extractContent(body);
    let finalResponse = null;
    
    // Check for manual CLI command (for testing/debugging)
    if (detectedType === 'text' && userContent.toLowerCase().startsWith('exec-python ')) {
        const code = userContent.substring('exec-python '.length).trim();
        const toolOutput = await callEdgeFunction('python-executor', { code: code });
        finalResponse = `Manual Python Execution Result: ${JSON.stringify(toolOutput, null, 2)}`;
    }
    
    // If not a manual CLI command, proceed with AI Tool Use logic
    if (finalResponse === null) {
        let aiInputContent = userContent;
        let aiContentType = detectedType;
        
        // Ingest content if it's a URL
        if (detectedType === 'url') {
          console.info(`Attempting to ingest content from URL: ${userContent}`);
          aiInputContent = await fetchUrlContent(userContent);
          aiContentType = 'ingested-' + detectedType;
        }
        
        // Get AI response (which might involve tool calls)
        finalResponse = await getAIResponse(aiInputContent, aiContentType);
    }

    return new Response(JSON.stringify({
      ok: true,
      query_content: userContent,
      query_type: detectedType,
      ai_response: finalResponse,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  }

  return new Response(JSON.stringify({
    error: 'Method not allowed'
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'GET, POST',
      'Connection': 'keep-alive'
    }
  });
});

