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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

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

    // Get ecosystem activities
    if (path === '/ecosystem/activities' && req.method === 'GET') {
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

    // Get ecosystem status
    if (path === '/ecosystem/status' && req.method === 'GET') {
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

    // Activity feed for frontend
    if (path === '/activity/feed' && req.method === 'GET') {
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const recentActivities = receivedActivities.slice(-limit);

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
