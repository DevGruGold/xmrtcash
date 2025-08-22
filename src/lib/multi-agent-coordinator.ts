// Multi-Agent Coordination System for XMRT Ecosystem
import { toast } from "@/hooks/use-toast";

export interface Agent {
  id: string;
  name: string;
  role: string;
  endpoint: string;
  status: 'active' | 'inactive' | 'error';
  lastSeen?: Date;
  specializations: string[];
}

export interface AgentMessage {
  id: string;
  agentId: string;
  content: string;
  timestamp: Date;
  context?: string;
}

// Define all XMRT ecosystem agents
export const ECOSYSTEM_AGENTS: Agent[] = [
  {
    id: 'eliza-main',
    name: 'Eliza Core',
    role: 'Primary AI Assistant',
    endpoint: 'local',
    status: 'active',
    specializations: ['general_support', 'dao_operations', 'user_onboarding']
  },
  {
    id: 'elizaos-frontend',
    name: 'ElizaOS Frontend',
    role: 'Autonomous DAO Management',
    endpoint: 'https://xmrtnet-eliza.onrender.com',
    status: 'active',
    specializations: ['autonomous_governance', 'treasury_management', 'community_coordination']
  },
  {
    id: 'redis-langgraph',
    name: 'LangGraph Coordinator',
    role: 'AI Memory & Coordination',
    endpoint: 'https://xmrt-ecosystem-redis-langgraph.onrender.com',
    status: 'active',
    specializations: ['memory_persistence', 'multi_agent_coordination', 'decision_making']
  },
  {
    id: 'xmrt-web',
    name: 'XMRT Web Interface',
    role: 'Public Web Portal',
    endpoint: 'https://xmrt-ecosystem-0k8i.onrender.com',
    status: 'active',
    specializations: ['public_interface', 'user_onboarding', 'information_hub']
  },
  {
    id: 'mining-specialist',
    name: 'Mining Advisor',
    role: 'Mobile Mining Expert',
    endpoint: 'local',
    status: 'active',
    specializations: ['mobile_mining', 'hardware_optimization', 'night_moves']
  },
  {
    id: 'privacy-advocate',
    name: 'Privacy Specialist',
    role: 'Privacy Technology Expert',
    endpoint: 'local',
    status: 'active',
    specializations: ['privacy_tech', 'wrapping_unwrapping', 'security_guidance']
  },
  {
    id: 'community-manager',
    name: 'Community Coordinator',
    role: 'Community Support',
    endpoint: 'local',
    status: 'active',
    specializations: ['community_support', 'dao_participation', 'user_education']
  }
];

class MultiAgentCoordinator {
  private agents: Map<string, Agent> = new Map();
  private messageHistory: AgentMessage[] = [];
  private activeCoordinationTasks: Map<string, Promise<any>> = new Map();

  constructor() {
    // Initialize with ecosystem agents
    ECOSYSTEM_AGENTS.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  // Get the most appropriate agent for a user query
  public async selectBestAgent(userMessage: string, context?: string): Promise<Agent> {
    const message = userMessage.toLowerCase();
    
    // Mining-related queries
    if (message.includes('mining') || message.includes('mobile') || message.includes('phone') || message.includes('night moves')) {
      return this.agents.get('mining-specialist') || this.agents.get('eliza-main')!;
    }
    
    // Privacy and wrapping queries
    if (message.includes('privacy') || message.includes('wrap') || message.includes('unwrap') || message.includes('bridge')) {
      return this.agents.get('privacy-advocate') || this.agents.get('eliza-main')!;
    }
    
    // DAO and governance queries
    if (message.includes('dao') || message.includes('governance') || message.includes('voting') || message.includes('treasury')) {
      return this.agents.get('elizaos-frontend') || this.agents.get('eliza-main')!;
    }
    
    // Community and support queries
    if (message.includes('community') || message.includes('help') || message.includes('support') || message.includes('onboard')) {
      return this.agents.get('community-manager') || this.agents.get('eliza-main')!;
    }
    
    // Default to main Eliza
    return this.agents.get('eliza-main')!;
  }

  // Coordinate response with external agents
  public async coordinateResponse(agent: Agent, userMessage: string, context?: string): Promise<string> {
    try {
      // For external agents, make API calls
      if (agent.endpoint !== 'local') {
        return await this.callExternalAgent(agent, userMessage, context);
      }
      
      // For local agents, generate specialized responses
      return this.generateSpecializedResponse(agent, userMessage, context);
    } catch (error) {
      console.error(`Error coordinating with agent ${agent.name}:`, error);
      return this.getFallbackResponse(userMessage);
    }
  }

  // Call external agent APIs
  private async callExternalAgent(agent: Agent, userMessage: string, context?: string): Promise<string> {
    try {
      const response = await fetch(`${agent.endpoint}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          source: 'lovable-cashdapp'
        })
      });

      if (!response.ok) {
        throw new Error(`Agent ${agent.name} API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response || data.message || this.getFallbackResponse(userMessage);
    } catch (error) {
      console.error(`External agent ${agent.name} call failed:`, error);
      return this.getFallbackResponse(userMessage);
    }
  }

  // Generate specialized responses for local agents
  private generateSpecializedResponse(agent: Agent, userMessage: string, context?: string): string {
    const message = userMessage.toLowerCase();
    
    switch (agent.id) {
      case 'mining-specialist':
        return this.getMiningSpecialistResponse(message);
      case 'privacy-advocate':
        return this.getPrivacyAdvocateResponse(message);
      case 'community-manager':
        return this.getCommunityManagerResponse(message);
      default:
        return this.getFallbackResponse(userMessage);
    }
  }

  // Specialized response generators
  private getMiningSpecialistResponse(message: string): string {
    if (message.includes('night moves') || message.includes('sleep')) {
      return "📱 Night Moves is our signature mobile mining approach! Set up mining on your phone before bed at mobilemonero.com - your device mines Monero while you sleep, contributing to the XMRT DAO treasury. It's designed to use minimal battery and data, making privacy mining accessible to everyone.";
    }
    
    if (message.includes('mobile') || message.includes('phone')) {
      return "📲 Mobile mining democratizes cryptocurrency! Your smartphone becomes a node in our privacy network. Register at xmrtdao.streamlit.app to track your contributions. The mining pools feed directly into our DAO treasury, giving you participation rights in governance.";
    }
    
    return "⛏️ I specialize in mobile mining optimization! Whether you want to start mining, optimize your setup, or understand how mobile mining supports the XMRT ecosystem, I'm here to help. What specific aspect of mobile mining interests you?";
  }

  private getPrivacyAdvocateResponse(message: string): string {
    if (message.includes('wrap') || message.includes('bridge')) {
      return "🔄 XMRT wrapping allows you to access DeFi while preserving privacy options! Send XMR to our bridge with a payment ID, receive XMRT on your chosen EVM chain. The process uses proof of reserve transparency with 0.5% fees. You can always unwrap back to XMR for full privacy.";
    }
    
    if (message.includes('privacy')) {
      return "🛡️ Privacy is a fundamental right, not a privilege! XMRT provides privacy-preserving alternatives to traditional finance. Our wrapped Monero solution lets you access DeFi liquidity while maintaining the option to return to full Monero privacy when needed.";
    }
    
    return "🔒 I focus on privacy technology and financial sovereignty! I can help you understand XMRT wrapping/unwrapping, privacy best practices, or how our technology preserves your financial rights. What privacy topic would you like to explore?";
  }

  private getCommunityManagerResponse(message: string): string {
    if (message.includes('community') || message.includes('dao')) {
      return "👥 Welcome to the XMRT DAO community! We're a decentralized network of privacy advocates and mobile miners. Track community activities at xmrtdao.streamlit.app, participate in AI-governed decisions, and connect with others building the privacy economy.";
    }
    
    if (message.includes('help') || message.includes('start')) {
      return "🚀 Getting started is easy! 1) Begin mobile mining at mobilemonero.com 2) Register at xmrtdao.streamlit.app to track contributions 3) Join our community discussions 4) Participate in DAO governance. Each step helps build our decentralized privacy infrastructure!";
    }
    
    return "🌟 I help users navigate the XMRT ecosystem and connect with our community! Whether you need onboarding support, want to understand DAO participation, or have questions about our privacy mission, I'm here to help. How can I assist you today?";
  }

  private getFallbackResponse(userMessage: string): string {
    return "🤖 I'm coordinating with our multi-agent network to provide the best response. Our XMRT ecosystem includes mobile mining, privacy technology, and decentralized governance. Would you like to know more about any specific aspect of our privacy-focused infrastructure?";
  }

  // Check agent status across the ecosystem
  public async checkAgentStatus(): Promise<Map<string, Agent>> {
    const statusChecks = Array.from(this.agents.values()).map(async (agent) => {
      if (agent.endpoint === 'local') {
        agent.status = 'active';
        agent.lastSeen = new Date();
        return agent;
      }

      try {
        const response = await fetch(`${agent.endpoint}/health`, {
          method: 'HEAD',
          timeout: 5000
        } as any);
        
        agent.status = response.ok ? 'active' : 'error';
        agent.lastSeen = new Date();
      } catch (error) {
        agent.status = 'error';
      }
      
      return agent;
    });

    const updatedAgents = await Promise.all(statusChecks);
    updatedAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });

    return this.agents;
  }

  // Get all agents with their current status
  public getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  // Add message to coordination history
  public addMessage(agentId: string, content: string, context?: string): void {
    const message: AgentMessage = {
      id: Date.now().toString(),
      agentId,
      content,
      timestamp: new Date(),
      context
    };
    
    this.messageHistory.push(message);
    
    // Keep only last 100 messages
    if (this.messageHistory.length > 100) {
      this.messageHistory = this.messageHistory.slice(-100);
    }
  }

  // Get conversation history
  public getMessageHistory(limit: number = 20): AgentMessage[] {
    return this.messageHistory.slice(-limit);
  }
}

// Export singleton instance
export const multiAgentCoordinator = new MultiAgentCoordinator();

// Export utility functions
export const selectBestAgent = (userMessage: string, context?: string) => 
  multiAgentCoordinator.selectBestAgent(userMessage, context);

export const coordinateResponse = (agent: Agent, userMessage: string, context?: string) => 
  multiAgentCoordinator.coordinateResponse(agent, userMessage, context);

export const checkAgentStatus = () => 
  multiAgentCoordinator.checkAgentStatus();

export const getAllAgents = () => 
  multiAgentCoordinator.getAllAgents();
