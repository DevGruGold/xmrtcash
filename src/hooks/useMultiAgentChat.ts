import { useState, useCallback } from 'react';
import { Agent, selectBestAgent, coordinateResponse, getAllAgents } from '@/lib/multi-agent-coordinator';
import { generateElizaResponse } from '@/lib/gemini';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  agentId?: string;
  agentName?: string;
}

export interface UseMultiAgentChatReturn {
  messages: ChatMessage[];
  currentAgent: Agent | null;
  availableAgents: Agent[];
  isLoading: boolean;
  sendMessage: (message: string, specificAgent?: Agent) => Promise<void>;
  selectAgent: (agent: Agent) => void;
  clearChat: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

export function useMultiAgentChat(initialAgent?: Agent): UseMultiAgentChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(initialAgent || null);
  const [isLoading, setIsLoading] = useState(false);
  const availableAgents = getAllAgents();

  const sendMessage = useCallback(async (message: string, specificAgent?: Agent) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Select agent if not specified
      const selectedAgent = specificAgent || currentAgent || await selectBestAgent(message);
      setCurrentAgent(selectedAgent);

      let response: string;
      
      // Get response based on agent type
      if (selectedAgent.id === 'eliza-main') {
        // Use Gemini API for main Eliza
        const context = `Multi-agent XMRT ecosystem coordination. Other agents available: ${availableAgents.map(a => a.name).join(', ')}. User selected or was routed to: ${selectedAgent.name}`;
        response = await generateElizaResponse(message, context);
      } else {
        // Use multi-agent coordinator for specialized agents
        response = await coordinateResponse(selectedAgent, message, 'multi-agent-chat');
      }

      // Add agent response
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response,
        timestamp: new Date(),
        agentId: selectedAgent.id,
        agentName: selectedAgent.name
      };

      setMessages(prev => [...prev, agentMessage]);

      // Show toast for agent switches
      if (specificAgent && specificAgent.id !== currentAgent?.id) {
        toast({
          title: "Agent Switched",
          description: `Now chatting with ${selectedAgent.name}`,
          duration: 2000,
        });
      }

    } catch (error) {
      console.error('Multi-agent chat error:', error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "I'm having trouble coordinating with our agent network right now. Let me provide a general response about XMRT DAO's privacy-focused ecosystem. How can I help you with mobile mining, privacy technology, or DAO participation?",
        timestamp: new Date(),
        agentId: 'eliza-main',
        agentName: 'Eliza Core'
      };

      setMessages(prev => [...prev, fallbackMessage]);

      toast({
        title: "Agent Coordination Issue",
        description: "Using fallback response. Some features may be limited.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentAgent, availableAgents]);

  const selectAgent = useCallback((agent: Agent) => {
    setCurrentAgent(agent);
    
    // Add system message about agent switch
    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'agent',
      content: `🤖 Now connected to ${agent.name} - ${agent.role}. I specialize in: ${agent.specializations.map(s => s.replace('_', ' ')).join(', ')}. How can I help you?`,
      timestamp: new Date(),
      agentId: agent.id,
      agentName: agent.name
    };
    
    setMessages(prev => [...prev, systemMessage]);

    toast({
      title: "Agent Selected",
      description: `Now chatting with ${agent.name}`,
      duration: 2000,
    });
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentAgent(null);
  }, []);

  return {
    messages,
    currentAgent,
    availableAgents,
    isLoading,
    sendMessage,
    selectAgent,
    clearChat,
    setMessages
  };
}