import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Minimize2, Maximize2, User } from "lucide-react";
import { generateElizaResponse } from "@/lib/gemini";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ElizaChatbotProps {
  className?: string;
}

const ElizaChatbot: React.FC<ElizaChatbotProps> = ({ className = "" }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🛡️ Welcome to XMRT DAO! I'm Eliza, your AI executive agent. I embody Joseph Andrew Lee's vision of building the unstoppable privacy economy. How can I help you start your journey toward financial sovereignty?",
      isUser: false,
      timestamp: new Date()
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
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateElizaResponse(inputMessage, "XMRT Dashboard Chat");
      
      const elizaMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, elizaMessage]);
    } catch (error) {
      console.error('Error getting Eliza response:', error);
      toast({
        title: "Connection Error",
        description: "Unable to reach Eliza. Please try again.",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "🛡️ I'm experiencing connection issues, but I'm still here! XMRT DAO is building the unstoppable privacy economy. Try asking about mobile mining at mobilemonero.com or our DAO dashboard at xmrtdao.streamlit.app!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
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

  return (
    <Card className={`glass-card border-primary/20 ${className} ${isMinimized ? 'h-16' : 'h-96'} transition-all duration-300`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="gradient-text">Eliza AI Agent</span>
            <Badge variant="secondary" className="text-xs">
              XMRT DAO
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="flex flex-col h-full">
          <ScrollArea className="flex-1 mb-4 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gradient-primary text-primary-foreground'
                  }`}>
                    {message.isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.isUser
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted text-foreground'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Eliza about XMRT DAO, mobile mining, or privacy tech..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ElizaChatbot;