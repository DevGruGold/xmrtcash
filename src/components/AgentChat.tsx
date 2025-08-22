import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import ElizaChatbot from "@/components/ElizaChatbot";

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

interface AgentChatProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
}

export default function AgentChat({ agent, isOpen, onClose }: AgentChatProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[80vh] max-h-[700px] p-0 bg-transparent border-none shadow-none">
        <div className="h-full glass-card rounded-lg">
          <DialogHeader className="p-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-background rounded-full flex items-center justify-center ${agent.color}`}>
                  <agent.icon className="w-4 h-4" />
                </div>
                <div>
                  <DialogTitle className="text-lg gradient-text">{agent.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 p-4 h-[calc(100%-80px)]">
            <ElizaChatbot 
              className="h-full border-0 bg-transparent" 
              agent={agent}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}