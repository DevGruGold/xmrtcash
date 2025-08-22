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
}

const ElizaChatbot: React.FC<ElizaChatbotProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "🛡️ Welcome to XMRT DAO! I'm Eliza, your AI executive agent for the privacy economy. I can help you with:\n\n📱 Mobile mining at mobilemonero.com\n📊 DAO participation and governance\n🌐 Meshnet technology and resilience\n🔄 XMRT wrapping/unwrapping\n💰 Fiat on/off ramps\n\nPrivacy is a fundamental right - how can I help you reclaim yours?",
      isUser: false,
      timestamp: new Date(),
      agent: "Eliza Core"
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
      const response = await generateElizaResponse(currentInput, "XMRT Ecosystem Chat");
      
      const elizaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        agent: "Eliza Core"
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
      <Card className={`glass-card w-80 h-16 ${className}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
              <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="gradient-text font-medium">Eliza AI</span>
              <Zap className="w-3 h-3 text-primary animate-pulse" />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card w-full max-w-2xl h-[600px] flex flex-col ${className}`}>
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
              <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <span className="gradient-text">Eliza AI Executive Agent</span>
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                Live
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {message.isUser ? (
                    <>
                      <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
                      <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className={`flex-1 max-w-[85%] ${message.isUser ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`inline-block p-3 rounded-lg text-sm ${
                      message.isUser
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-muted/50 text-foreground border border-border/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    {!message.isUser && message.agent && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        {message.agent}
                      </Badge>
                    )}
                    <span>
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
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/eliza-avatar.jpg" alt="Eliza" />
                  <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Eliza is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        
        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about XMRT DAO, mobile mining, privacy tech, or meshnet..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
            className="neon-button flex-shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ElizaChatbot;