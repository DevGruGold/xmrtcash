import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/functions/v1/supportxmr-proxy', '');
    
    // Map paths to SupportXMR API endpoints
    let apiUrl: string;
    
    if (path === '/pool/stats') {
      apiUrl = 'https://supportxmr.com/api/pool/stats';
    } else if (path.startsWith('/miner/') && path.endsWith('/stats')) {
      const address = path.replace('/miner/', '').replace('/stats', '');
      apiUrl = `https://supportxmr.com/api/miner/${address}/stats`;
    } else if (path.startsWith('/pool/workers/')) {
      const address = path.replace('/pool/workers/', '');
      apiUrl = `https://supportxmr.com/api/pool/workers/${address}`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Proxying request to: ${apiUrl}`);

    // Make request to SupportXMR API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'XMRT-DAO-Mining-Dashboard/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`SupportXMR API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ 
          error: 'SupportXMR API unavailable', 
          status: response.status,
          statusText: response.statusText 
        }), 
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log(`Successfully proxied data from ${apiUrl}`);

    return new Response(JSON.stringify(data), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30' // Cache for 30 seconds
      },
    });

  } catch (error) {
    console.error('Error in supportxmr-proxy function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Proxy server error', 
        message: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});