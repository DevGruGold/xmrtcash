import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import EnhancedElizaChatbot from "@/components/multimodal/EnhancedElizaChatbot";
import { coordinateResponse, selectBestAgent } from "@/lib/multi-agent-coordinator";

interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: string;
  confidence: number;
  icon: any;
  color: string;
}

// Agent-specific context and capabilities mapping
const getAgentContext = (agent: Agent) => {
  const contexts = {
    "eliza-core": "You are Eliza Core, the main AI assistant for the XMRT ecosystem. Provide general support, navigation help, and FAQ assistance.",
    "mining-oracle": "You are Mining Oracle, specialized in mining operations, pool statistics, and hardware optimization. Focus on mobile mining, Night Moves strategy, and mining profitability calculations.",
    "dao-governance": "You are the DAO Governance expert, specialized in governance proposals, voting mechanisms, and community decision-making. Help users understand and participate in DAO operations.",
    "privacy-guard": "You are Privacy Guard, focused on security and privacy protection. Provide guidance on anonymity, security audits, threat assessment, and privacy-preserving technologies.",
    "defi-strategist": "You are the DeFi Strategist, specialized in financial strategies, yield optimization, and market analysis. Help with DeFi protocols, risk assessment, and portfolio optimization.",
    "mesh-coordinator": "You are Mesh Coordinator, specialized in mesh networking, resilience strategies, and decentralized infrastructure. Focus on network topology and connectivity optimization."
  };
  
  return contexts[agent.id as keyof typeof contexts] || contexts["eliza-core"];
};

interface AgentChatProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentChat({ agent, isOpen, onClose }: AgentChatProps) {
  // Convert UI agent to coordinator agent format
  const coordinatorAgent = {
    id: agent.id,
    name: agent.name,
    description: agent.description,
    capabilities: agent.capabilities
  };

  // Get agent-specific greeting
  const getAgentGreeting = () => {
    const greetings = {
      "eliza-core": "Hello! I'm Eliza Core, your main assistant for the XMRT ecosystem. How can I help you today?",
      "mining-oracle": "⛏️ Greetings! I'm Mining Oracle, your mobile mining specialist. Ready to optimize your mining operations or learn about Night Moves?",
      "dao-governance": "👥 Welcome! I'm your DAO Governance expert. I can help you understand proposals, voting, and community decisions.",
      "privacy-guard": "🛡️ Hello! I'm Privacy Guard, here to protect your digital sovereignty. Need help with security or privacy?",
      "defi-strategist": "📈 Hi there! I'm the DeFi Strategist, ready to help optimize your yield farming and market strategies.",
      "mesh-coordinator": "🌐 Greetings! I'm Mesh Coordinator, specializing in decentralized networks and resilience planning."
    };
    
    return greetings[agent.id as keyof typeof greetings] || greetings["eliza-core"];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl h-[85vh] max-h-[800px] p-0 bg-transparent border-none shadow-none">
        <div className="h-full glass-card rounded-lg">
          <DialogHeader className="p-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-background rounded-full flex items-center justify-center ${agent.color}`}>
                  <agent.icon className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl gradient-text">{agent.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                  <div className="flex gap-1 mt-1">
                    {agent.capabilities.slice(0, 3).map((cap, i) => (
                      <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 p-4 h-[calc(100%-120px)]">
            <EnhancedElizaChatbot 
              className="h-full border-0 bg-transparent" 
              agent={coordinatorAgent}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}