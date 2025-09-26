import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { path } = await req.json();
    
    if (!path) {
      return new Response(
        JSON.stringify({ error: 'Path parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Proxying request to SupportXMR:', path);

    // Proxy the request to SupportXMR API with timeout
    const supportXMRUrl = `https://supportxmr.com/api${path}`;
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(supportXMRUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'XMRT-Platform/1.0',
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`SupportXMR API responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify(data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } finally {
      clearTimeout(timeoutId);
    }
    
  } catch (error) {
    console.error('SupportXMR proxy error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch data from SupportXMR API',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});