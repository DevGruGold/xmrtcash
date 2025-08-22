import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Brain, 
  Shield, 
  Users, 
  Pickaxe, 
  Activity,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { Agent, getAllAgents, checkAgentStatus } from "@/lib/multi-agent-coordinator";

interface AgentSelectorProps {
  selectedAgent?: Agent;
  onAgentSelect: (agent: Agent) => void;
  className?: string;
}

const getAgentIcon = (agentId: string) => {
  switch (agentId) {
    case 'eliza-main': return Bot;
    case 'elizaos-frontend': return Brain;
    case 'redis-langgraph': return Activity;
    case 'xmrt-web': return Users;
    case 'mining-specialist': return Pickaxe;
    case 'privacy-advocate': return Shield;
    case 'community-manager': return Users;
    default: return Bot;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'text-success border-success/30 bg-success/10';
    case 'inactive': return 'text-warning border-warning/30 bg-warning/10';
    case 'error': return 'text-destructive border-destructive/30 bg-destructive/10';
    default: return 'text-muted-foreground border-border bg-muted/10';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return CheckCircle;
    case 'inactive': return AlertCircle;
    case 'error': return XCircle;
    default: return Activity;
  }
};

export default function AgentSelector({ selectedAgent, onAgentSelect, className = "" }: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>(getAllAgents());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'dropdown'>('grid');

  useEffect(() => {
    refreshAgentStatus();
  }, []);

  const refreshAgentStatus = async () => {
    setIsRefreshing(true);
    try {
      const updatedAgents = await checkAgentStatus();
      setAgents(Array.from(updatedAgents.values()));
    } catch (error) {
      console.error('Failed to refresh agent status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAgentSelect = (agent: Agent) => {
    onAgentSelect(agent);
  };

  if (viewMode === 'dropdown') {
    return (
      <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Select AI Agent
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshAgentStatus}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedAgent?.id} 
            onValueChange={(value) => {
              const agent = agents.find(a => a.id === value);
              if (agent) handleAgentSelect(agent);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose an AI agent..." />
            </SelectTrigger>
            <SelectContent>
              {agents.map((agent) => {
                const Icon = getAgentIcon(agent.id);
                const StatusIcon = getStatusIcon(agent.status);
                return (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{agent.name}</span>
                      <StatusIcon className={`w-3 h-3 ${getStatusColor(agent.status)}`} />
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card/50 backdrop-blur-sm border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Multi-Agent Network
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('dropdown')}
            >
              Compact
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshAgentStatus}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {agents.map((agent) => {
            const Icon = getAgentIcon(agent.id);
            const StatusIcon = getStatusIcon(agent.status);
            const isSelected = selectedAgent?.id === agent.id;
            
            return (
              <Card
                key={agent.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-primary bg-primary/5 border-primary/30' 
                    : 'hover:border-primary/30'
                }`}
                onClick={() => handleAgentSelect(agent)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className={`${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <Icon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <h4 className="text-xs font-medium truncate">{agent.name}</h4>
                        <StatusIcon className={`w-3 h-3 flex-shrink-0 ${getStatusColor(agent.status)}`} />
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{agent.role}</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.specializations.slice(0, 2).map((spec) => (
                          <Badge 
                            key={spec} 
                            variant="secondary" 
                            className="text-xs px-1 py-0"
                          >
                            {spec.replace('_', ' ')}
                          </Badge>
                        ))}
                        {agent.specializations.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            +{agent.specializations.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {selectedAgent && (
          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {React.createElement(getAgentIcon(selectedAgent.id), { className: "w-3 h-3" })}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{selectedAgent.name} Selected</span>
              <Badge className={`text-xs ${getStatusColor(selectedAgent.status)}`}>
                {selectedAgent.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{selectedAgent.role}</p>
            <div className="flex flex-wrap gap-1">
              {selectedAgent.specializations.map((spec) => (
                <Badge key={spec} variant="outline" className="text-xs">
                  {spec.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}