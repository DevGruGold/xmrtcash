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
    // Handle both GET requests with query params and POST requests with JSON body
    let path = '';
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      path = url.pathname + url.search;
    } else {
      try {
        const body = await req.json();
        path = body.path || '';
      } catch (parseError) {
        console.error('Failed to parse JSON body:', parseError);
        path = new URL(req.url).pathname;
      }
    }
    
    console.log('Ecosystem webhook called with path:', path);

    // Mock ecosystem activity data for development
    const mockActivityData = {
      success: true,
      activities: [
        {
          id: '1',
          type: 'mining',
          timestamp: new Date().toISOString(),
          description: 'New block mined',
          hashrate: '1.2 MH/s',
          reward: '0.15 XMR'
        },
        {
          id: '2',
          type: 'transaction',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          description: 'Transaction confirmed',
          amount: '2.5 XMRT',
          status: 'confirmed'
        },
        {
          id: '3',
          type: 'worker',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          description: 'New worker connected',
          worker_id: 'worker-001',
          hashrate: '450 KH/s'
        }
      ],
      total_count: 3,
      page_size: 20
    };

    // If this was a real implementation, you would:
    // 1. Parse the path to determine what ecosystem data to fetch
    // 2. Make requests to real mining pool APIs or blockchain explorers
    // 3. Format and return the actual data
    
    return new Response(
      JSON.stringify(mockActivityData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Ecosystem webhook error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch ecosystem data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});