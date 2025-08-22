import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

interface EcosystemActivity {
  source_system: string;
  event_type: string;
  data: any;
  timestamp: string;
  event_id: string;
  received_at: string;
}

interface EcosystemState {
  last_sync?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage for activities (in production, would use Supabase tables)
let receivedActivities: EcosystemActivity[] = [];
let ecosystemState: EcosystemState = {};

// Initialize with some demo activities
const initializeDemoActivities = () => {
  const demoActivities: EcosystemActivity[] = [
    {
      source_system: "supportxmr",
      event_type: "mining_update",
      data: {
        total_hashrate: "1.2 GH/s",
        active_miners: 4828,
        wallet_hashrate: "0 KH/s", // Inactive wallet
        blocks_found: 3
      },
      timestamp: new Date().toISOString(),
      event_id: `demo_mining_${Date.now()}`,
      received_at: new Date().toISOString()
    },
    {
      source_system: "meshnet",
      event_type: "meshnet_update",
      data: {
        active_nodes: 25,
        network_coverage: "expanding",
        new_connections: 3
      },
      timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      event_id: `demo_meshnet_${Date.now() - 300000}`,
      received_at: new Date(Date.now() - 300000).toISOString()
    },
    {
      source_system: "agent_system",
      event_type: "agent_discussion",
      data: {
        agent_name: "Eliza",
        message: "Analyzing current market trends and optimizing DAO strategy...",
        topic: "market_analysis"
      },
      timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      event_id: `demo_agent_${Date.now() - 600000}`,
      received_at: new Date(Date.now() - 600000).toISOString()
    },
    {
      source_system: "growth_tracker",
      event_type: "growth_update",
      data: {
        overall_health: "excellent",
        motivation: "increasing",
        metrics_updated: true
      },
      timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
      event_id: `demo_growth_${Date.now() - 900000}`,
      received_at: new Date(Date.now() - 900000).toISOString()
    }
  ];
  
  receivedActivities = demoActivities;
  console.log(`🚀 Initialized with ${demoActivities.length} demo activities`);
};

// Initialize demo data on startup
initializeDemoActivities();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  let path = url.pathname;
  
  console.log(`🔍 Incoming request: ${req.method} ${path}`);
  
  // Handle POST requests with path in body (for supabase.functions.invoke calls)
  if (req.method === 'POST' && req.headers.get('content-type')?.includes('application/json')) {
    try {
      const bodyText = await req.text();
      const body = JSON.parse(bodyText);
      console.log(`📦 Request body:`, body);
      
      if (body.path) {
        path = body.path.split('?')[0]; // Remove query params from path
        console.log(`🔄 Updated path from body: ${path}`);
        
        // Set query params from the path if they exist
        if (body.path.includes('?')) {
          const queryString = body.path.split('?')[1];
          const searchParams = new URLSearchParams(queryString);
          // Update url with query params for later use
          url.search = queryString;
          console.log(`🔍 Query params: ${queryString}`);
        }
      }
      
      // Re-create request with updated body if needed
      req = new Request(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.log(`❌ Error parsing body:`, e);
      // If not JSON or no path in body, continue with original path
    }
  }

  try {
    // Webhook receiver endpoint
    if (path === '/webhook/receive' && req.method === 'POST') {
      const data = await req.json();
      
      if (!data) {
        return new Response(JSON.stringify({ error: "No data provided" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate required fields
      const requiredFields = ['source_system', 'event_type', 'data', 'timestamp', 'event_id'];
      if (!requiredFields.every(field => field in data)) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Store the activity
      const activity: EcosystemActivity = {
        source_system: data.source_system,
        event_type: data.event_type,
        data: data.data,
        timestamp: data.timestamp,
        event_id: data.event_id,
        received_at: new Date().toISOString()
      };

      receivedActivities.push(activity);

      // Keep only last 100 activities
      if (receivedActivities.length > 100) {
        receivedActivities.shift();
      }

      console.log(`📨 Received ${data.event_type} from ${data.source_system}`);

      return new Response(JSON.stringify({
        success: true,
        message: "Activity received successfully",
        event_id: data.event_id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Ecosystem state sync endpoint
    if (path === '/ecosystem/sync' && req.method === 'POST') {
      const data = await req.json();
      
      if (!data) {
        return new Response(JSON.stringify({ error: "No data provided" }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update ecosystem state
      ecosystemState = { ...ecosystemState, ...data };
      ecosystemState.last_sync = new Date().toISOString();

      console.log("🔄 Ecosystem state synchronized");

      return new Response(JSON.stringify({
        success: true,
        message: "Ecosystem state synchronized",
        timestamp: ecosystemState.last_sync
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get ecosystem activities (handle both GET and POST with body.path)
    if (path === '/ecosystem/activities') {
      const eventType = url.searchParams.get('event_type');
      const sourceSystem = url.searchParams.get('source_system');
      const limit = parseInt(url.searchParams.get('limit') || '50');

      let filteredActivities = [...receivedActivities];

      if (eventType) {
        filteredActivities = filteredActivities.filter(a => a.event_type === eventType);
      }

      if (sourceSystem) {
        filteredActivities = filteredActivities.filter(a => a.source_system === sourceSystem);
      }

      // Apply limit
      filteredActivities = filteredActivities.slice(-limit);

      return new Response(JSON.stringify({
        success: true,
        activities: filteredActivities,
        total_count: filteredActivities.length,
        ecosystem_state: ecosystemState
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get ecosystem status (handle both GET and POST with body.path)
    if (path === '/ecosystem/status') {
      const status = {
        webhook_active: true,
        received_activities_count: receivedActivities.length,
        last_activity: receivedActivities[receivedActivities.length - 1] || null,
        ecosystem_state: ecosystemState,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify({
        success: true,
        status: status
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Activity feed for frontend (handle both GET and POST with body.path)
    if (path === '/activity/feed') {
      console.log(`✅ Activity feed endpoint matched! Processing request...`);
      
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const recentActivities = receivedActivities.slice(-limit);

      console.log(`📊 Returning ${recentActivities.length} activities (limit: ${limit})`);

      // Format activities for display
      const formattedActivities = recentActivities.map(activity => ({
        id: activity.event_id,
        title: formatActivityTitle(activity),
        description: formatActivityDescription(activity),
        source: activity.source_system,
        timestamp: activity.timestamp,
        type: activity.event_type,
        data: activity.data
      }));

      return new Response(JSON.stringify({
        success: true,
        activities: formattedActivities,
        total_count: formattedActivities.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Add simulated mining activities for demo
    if (path === '/simulate/mining' && req.method === 'POST') {
      const simulatedActivity: EcosystemActivity = {
        source_system: "supportxmr",
        event_type: "mining_update",
        data: {
          total_hashrate: "1.2 GH/s",
          active_miners: 4800,
          wallet_hashrate: "2.5 KH/s",
          blocks_found: 3
        },
        timestamp: new Date().toISOString(),
        event_id: `mining_${Date.now()}`,
        received_at: new Date().toISOString()
      };

      receivedActivities.push(simulatedActivity);

      return new Response(JSON.stringify({
        success: true,
        message: "Mining activity simulated",
        activity: simulatedActivity
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default 404 response
    return new Response(JSON.stringify({ 
      error: "Endpoint not found",
      available_endpoints: [
        "POST /webhook/receive",
        "POST /ecosystem/sync",
        "GET /ecosystem/activities",
        "GET /ecosystem/status",
        "GET /activity/feed",
        "POST /simulate/mining"
      ]
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ecosystem webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function formatActivityTitle(activity: EcosystemActivity): string {
  const eventType = activity.event_type;
  const source = activity.source_system;

  const titles: Record<string, string> = {
    'growth_update': "📈 Growth Metrics Updated",
    'system_status': `🔧 System Status from ${source.charAt(0).toUpperCase() + source.slice(1)}`,
    'agent_discussion': `💬 Agent Discussion in ${source.charAt(0).toUpperCase() + source.slice(1)}`,
    'mining_update': "⛏️ Mining Stats Updated",
    'meshnet_update': "📡 MESHNET Status Updated"
  };

  return titles[eventType] || `🔔 ${eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
}

function formatActivityDescription(activity: EcosystemActivity): string {
  const eventType = activity.event_type;
  const data = activity.data;

  if (eventType === 'growth_update') {
    const health = data.overall_health || 'Unknown';
    return `Overall health: ${health}, Motivation level updated`;
  }

  if (eventType === 'agent_discussion') {
    const agentName = data.agent_name || 'Agent';
    const message = data.message || '';
    const truncated = message.length > 100 ? message.substring(0, 100) + '...' : message;
    return `${agentName}: ${truncated}`;
  }

  if (eventType === 'mining_update') {
    const hashrate = data.total_hashrate || 'Unknown';
    const miners = data.active_miners || 'Unknown';
    return `Hashrate: ${hashrate}, Active miners: ${miners}`;
  }

  if (eventType === 'meshnet_update') {
    const nodes = data.active_nodes || 'Unknown';
    const coverage = data.network_coverage || 'Unknown';
    return `Active nodes: ${nodes}, Coverage: ${coverage}`;
  }

  return `Activity from ${activity.source_system}`;
}
