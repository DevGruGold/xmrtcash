import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, Send, Minimize2, Maximize2, User, Zap, Loader2 } from "lucide-react";
import { generateElizaResponse } from "@/lib/gemini";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  agent?: string;
}

interface ElizaChatbotProps {
  className?: string;
  agent?: {
    id: string;
    name: string;
    description: string;
    capabilities: string[];
  };
}

const ElizaChatbot: React.FC<ElizaChatbotProps> = ({ className = "", agent }) => {
  const getWelcomeMessage = () => {
    if (!agent) {
      return "🛡️ Welcome to XMRT DAO! I'm Eliza, your AI executive agent for the privacy economy. I can help you with:\n\n📱 Mobile mining at mobilemonero.com\n📊 DAO participation and governance\n🌐 Meshnet technology and resilience\n🔄 XMRT wrapping/unwrapping\n💰 Fiat on/off ramps\n\nPrivacy is a fundamental right - how can I help you reclaim yours?";
    }

    const welcomeMessages = {
      'mining-oracle': "⚡ Welcome! I'm the Mining Oracle, your specialized AI for mining operations. I can help you with:\n\n📊 Real-time mining statistics\n🏊 Pool performance analysis\n💻 Hardware optimization\n📈 Profitability calculations\n🔧 Troubleshooting mining issues\n\nWhat mining question can I help you with today?",
      'dao-governance': "🗳️ Greetings! I'm your DAO Governance specialist. I'm here to help with:\n\n📜 Proposal analysis and voting guidance\n🏛️ Governance mechanisms and rules\n👥 Community decision-making processes\n📊 Voting analytics and insights\n⚖️ Governance best practices\n\nHow can I assist with your governance needs?",
      'privacy-guard': "🛡️ Hello! I'm Privacy Guard, your security and privacy specialist. I focus on:\n\n🔒 Privacy protection strategies\n🔍 Security audits and assessments\n👤 Anonymity best practices\n⚠️ Threat analysis and mitigation\n🔐 Cryptographic implementations\n\nWhat privacy or security concerns can I help address?",
      'defi-strategist': "💰 Welcome! I'm the DeFi Strategist, your financial AI. I specialize in:\n\n📈 Yield farming strategies\n📊 Market analysis and trends\n⚖️ Risk assessment and management\n💼 Portfolio optimization\n💱 Cross-chain opportunities\n\nWhat DeFi strategy can I help you develop?",
      'mesh-coordinator': "🌐 Greetings! I'm the Mesh Coordinator, focused on decentralized infrastructure. I help with:\n\n🕸️ Network topology optimization\n🔄 Resilience planning and strategies\n📡 Node management and coordination\n🔗 Connectivity optimization\n⚡ Performance monitoring\n\nHow can I assist with your mesh networking needs?",
      'eliza-core': "🛡️ Welcome to XMRT DAO! I'm Eliza Core, your primary AI assistant. I can help you with:\n\n📱 General ecosystem support\n🧭 Navigation and guidance\n❓ FAQ and documentation\n🔗 Connecting you with specialized agents\n📞 Community support coordination\n\nHow can I assist you today?"
    };

    return welcomeMessages[agent.id as keyof typeof welcomeMessages] || welcomeMessages['eliza-core'];
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date(),
      agent: agent?.name || "Eliza Core"
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const agentContext = agent ? `${agent.name} - ${agent.description}. Capabilities: ${agent.capabilities.join(', ')}` : "XMRT Ecosystem Chat";
      const response = await generateElizaResponse(currentInput, agentContext);
      
      const elizaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        agent: agent?.name || "Eliza Core"
      };

      setMessages(prev => [...prev, elizaMessage]);
    } catch (error) {
      console.error('Error getting Eliza response:', error);
      toast({
        title: "Connection Error",
        description: "Unable to reach Eliza. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <Card className={`glass-card w-full max-w-xs sm:max-w-sm h-14 sm:h-16 ${className}`}>
        <CardContent className="p-3 sm:p-4 flex items-center justify-between h-full">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
              <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 min-w-0">
              <span className="gradient-text font-medium text-sm sm:text-base truncate">
                {agent?.name || "Eliza AI"}
              </span>
              <Zap className="w-2 h-2 sm:w-3 sm:h-3 text-primary animate-pulse flex-shrink-0" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card w-full max-w-md sm:max-w-lg lg:max-w-2xl h-[500px] sm:h-[600px] flex flex-col ${className}`}>
      <CardHeader className="flex-shrink-0 pb-3 px-3 sm:px-6">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
              <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
              <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2 min-w-0">
              <span className="gradient-text text-sm sm:text-base font-medium truncate">
                {agent?.name || "Eliza AI Agent"}
              </span>
              <Badge variant="outline" className="text-xs flex-shrink-0">
                <Zap className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-3 sm:p-4 pt-0 min-h-0">
        <ScrollArea className="flex-1 w-full pr-2 sm:pr-4">
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                  {message.isUser ? (
                    <>
                      <AvatarFallback><User className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
                      <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className={`flex-1 min-w-0 ${message.isUser ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block p-2 sm:p-3 rounded-lg text-xs sm:text-sm max-w-full overflow-hidden ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted/50 text-foreground border border-border/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words word-wrap overflow-wrap-anywhere">{message.text}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                    {!message.isUser && message.agent && (
                      <Badge variant="outline" className="text-xs px-1 py-0 flex-shrink-0">
                        {message.agent}
                      </Badge>
                    )}
                    <span className="flex-shrink-0">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                  <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
                  <AvatarFallback><Bot className="w-3 h-3 sm:w-4 sm:h-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 p-2 sm:p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-primary flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">Eliza is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={agent ? `Ask ${agent.name}...` : "Ask about XMRT DAO..."}
            disabled={isLoading}
            className="flex-1 text-xs sm:text-sm min-w-0"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
            className="neon-button flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElizaChatbot;