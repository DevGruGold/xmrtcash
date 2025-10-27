
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.0'
import { OpenAI } from 'https://esm.sh/openai@4.49.1'

console.info('ai-chat started - Enhanced');

// Initialize OpenAI client
// Note: The Edge Function environment must have OPENAI_API_KEY and OPENAI_BASE_URL set.
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
  baseURL: Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1',
});

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
  let prompt = `You are an intelligent assistant. The user has provided the following content of type "${contentType}". Analyze it and provide a helpful, concise response. 
  
  If the content is a code snippet (Python, Solidity, etc.), explain what it does and suggest a potential improvement or use case.
  If the content is a URL, and you successfully fetched its content, analyze the fetched content. If fetching failed, explain the error.
  If the content is simple text, respond to the user's message.
  
  --- CONTENT ---
  ${userContent}
  ---
  
  Your response:`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // A capable and cost-effective model
      messages: [{ role: "user", content: prompt }],
      max_tokens: 512,
    });
    
    return chatCompletion.choices[0].message.content.trim();
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return "I encountered an error while processing your request with the AI model. Please check the logs.";
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Health check: GET returns 200
  if (req.method === 'GET' && (url.pathname === '/ai-chat' || url.pathname === '/')) {
    return new Response(JSON.stringify({
      status: 'ok',
      version: 'enhanced'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });
  }

  if (req.method === 'POST') {
    // Safely parse JSON body or extract text
    let body = null;
    const contentTypeHeader = req.headers.get('content-type') || '';
    try {
      if (contentTypeHeader.includes('application/json')) {
        body = await req.json();
      } else {
        const text = await req.text();
        try {
          body = text ? JSON.parse(text) : { text };
        } catch (_) {
          body = { text };
        }
      }
    } catch (e) {
      return new Response(JSON.stringify({
        error: 'Invalid or empty body',
        details: String(e)
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive'
        }
      });
    }

    const { content: userContent, contentType } = extractContent(body);
    let aiInputContent = userContent;
    let aiContentType = contentType;
    
    // Ingest content if it's a URL
    if (contentType === 'url') {
      console.info(`Attempting to ingest content from URL: ${userContent}`);
      // NOTE: This fetch is a simple GET request. For complex GitHub repos, 
      // a dedicated service or a more robust parsing logic would be needed.
      // For now, this handles raw file links.
      aiInputContent = await fetchUrlContent(userContent);
      aiContentType = 'ingested-' + aiContentType;
    }
    
    // Get AI response
    const aiResponse = await getAIResponse(aiInputContent, aiContentType);

    return new Response(JSON.stringify({
      ok: true,
      query_content: userContent,
      query_type: contentType,
      ai_response: aiResponse,
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
