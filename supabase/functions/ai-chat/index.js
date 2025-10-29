import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import { OpenAI } from 'https://esm.sh/openai@4.49.1'

console.info('ai-chat started - Agent Router with Tool Use');

// --- Configuration ---
const SUPABASE_URL = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'); // Should be set for secure internal calls

// --- Tool Definitions for OpenAI ---
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
  // Placeholder for cron job tool
  // {
  //   type: "function",
  //   function: {
  //     name: "manage_cron_job",
  //     description: "Manages scheduled cron jobs (listing, adding, deleting).",
  //     parameters: { ... }
  //   }
  // }
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
      content: "You are the intelligent agent 'Eliza'. You have access to a suite of tools to execute code and manage tasks. Your primary goal is to assist the user by intelligently deciding whether to use a tool or provide a direct answer. If the user asks to run code, use the `exec_python` tool. If the user provides content (code, URL), analyze it and respond directly. Do not use tools for analysis."
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
      
      if (functionName === 'exec_python') {
        // Execute the function
        toolOutput = await callEdgeFunction('python-executor', { code: functionArgs.code });
        
        // Add the function response to the messages for the next turn
        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: functionName,
          content: JSON.stringify(toolOutput),
        });
      }
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
      version: 'agent-tool-use'
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
    
    // Check for CLI command (Manual override for direct commands, for testing/debugging)
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

