import { useState } from "react";
import ModernHeader from "@/components/ModernHeader";
import AgentChat from "@/components/AgentChat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Brain, Shield, Zap, Users, Settings, MessageCircle, TrendingUp } from "lucide-react";

const agents = [
  {
    id: "eliza-core",
    name: "Eliza Core",
    description: "Main AI agent for general ecosystem support and user assistance",
    capabilities: ["General Support", "Navigation Help", "FAQ Assistance"],
    status: "online",
    confidence: 95,
    icon: Bot,
    color: "text-blue-500"
  },
  {
    id: "mining-oracle",
    name: "Mining Oracle",
    description: "Specialized agent for mining operations, pool statistics, and hardware optimization",
    capabilities: ["Mining Analytics", "Pool Stats", "Hardware Optimization", "Profitability Calc"],
    status: "online", 
    confidence: 88,
    icon: Zap,
    color: "text-yellow-500"
  },
  {
    id: "dao-governance",
    name: "DAO Governance",
    description: "Expert in governance proposals, voting mechanisms, and community decision-making",
    capabilities: ["Proposal Analysis", "Voting Guidance", "Governance Rules", "Community Insights"],
    status: "online",
    confidence: 92,
    icon: Users,
    color: "text-purple-500"
  },
  {
    id: "privacy-guard",
    name: "Privacy Guard",
    description: "Security-focused agent for privacy protection and anonymity guidance",
    capabilities: ["Privacy Analysis", "Security Audits", "Anonymity Tips", "Threat Assessment"],
    status: "online",
    confidence: 97,
    icon: Shield,
    color: "text-green-500"
  },
  {
    id: "defi-strategist",
    name: "DeFi Strategist", 
    description: "Financial agent for DeFi strategies, yield optimization, and market analysis",
    capabilities: ["Yield Farming", "Market Analysis", "Risk Assessment", "Portfolio Optimization"],
    status: "training",
    confidence: 76,
    icon: TrendingUp,
    color: "text-orange-500"
  },
  {
    id: "mesh-coordinator",
    name: "Mesh Coordinator",
    description: "Specialized in mesh networking, resilience strategies, and decentralized infrastructure",
    capabilities: ["Network Topology", "Resilience Planning", "Node Management", "Connectivity Optimization"],
    status: "beta",
    confidence: 83,
    icon: Brain,
    color: "text-indigo-500"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "online":
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
          Online
        </Badge>
      );
    case "training":
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mr-1.5 animate-pulse"></div>
          Training
        </Badge>
      );
    case "beta":
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse"></div>
          Beta
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatClick = (agent: typeof agents[0]) => {
    if (agent.status === 'online') {
      setSelectedAgent(agent);
      setIsChatOpen(true);
    }
  };

  const handleChatClose = () => {
    setIsChatOpen(false);
    setSelectedAgent(null);
  };
  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      
      <main className="container max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">AI Agent Network</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Specialized AI agents powered by advanced models, each designed for specific aspects of the XMRT ecosystem
          </p>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <Card key={agent.id} className="glass-card hover:scale-[1.02] transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-background rounded-full flex items-center justify-center ${agent.color}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusBadge(agent.status)}
                          <span className="text-xs text-muted-foreground">
                            {agent.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="text-sm leading-relaxed">
                    {agent.description}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Capabilities:</h4>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.map((capability, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1" 
                      disabled={agent.status !== 'online'}
                      onClick={() => handleChatClick(agent)}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Agent Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{agents.filter(a => a.status === 'online').length}</div>
              <p className="text-sm text-muted-foreground">of {agents.length} total agents</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Avg Confidence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(agents.reduce((acc, agent) => acc + agent.confidence, 0) / agents.length)}%
              </div>
              <p className="text-sm text-muted-foreground">across all agents</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Total Interactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.4K</div>
              <p className="text-sm text-muted-foreground">this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Chat Dialog */}
        {selectedAgent && (
          <AgentChat
            agent={selectedAgent}
            isOpen={isChatOpen}
            onClose={handleChatClose}
          />
        )}
      </main>
    </div>
  );
}