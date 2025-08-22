import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Smartphone, 
  Wifi, 
  Shield, 
  Coins, 
  Users, 
  BarChart3,
  ArrowUpDown,
  Send,
  Zap,
  Network
} from "lucide-react";

export default function EcosystemCapabilities() {
  const navigate = useNavigate();

  const capabilities = [
    {
      title: "Mobile Mining",
      description: "Efficient mobile Monero mining with optimized battery usage and thermal management",
      icon: Smartphone,
      status: "Active",
      color: "text-primary",
      action: () => navigate('/'),
      features: ["Battery Optimized", "Thermal Protection", "Background Mining"]
    },
    {
      title: "Mesh Network",
      description: "Off-grid communication through Meshtastic LoRa integration for true decentralization",
      icon: Network,
      status: "Connected",
      color: "text-blue-400",
      action: () => navigate('/meshnet'),
      features: ["LoRa Communication", "Off-Grid Ready", "89 Active Nodes"]
    },
    {
      title: "Privacy Bridge",
      description: "Seamless XMR ⟷ XMRT wrapping with full privacy preservation and atomic swaps",
      icon: Shield,
      status: "Operational",
      color: "text-green-400",
      action: () => navigate('/wrap-xmr'),
      features: ["Atomic Swaps", "Zero Knowledge", "Instant Settlement"]
    },
    {
      title: "DeFi Integration",
      description: "Complete fiat on/off-ramps with traditional payment methods integration",
      icon: Coins,
      status: "Live",
      color: "text-orange-400",
      action: () => navigate('/onramp-fiat'),
      features: ["Bank Integration", "Card Support", "Global Access"]
    },
    {
      title: "DAO Governance",
      description: "Decentralized autonomous organization with treasury management and voting",
      icon: Users,
      status: "Active",
      color: "text-purple-400",
      action: () => navigate('/simulation'),
      features: ["Proposal System", "Treasury Voting", "Transparent Allocation"]
    },
    {
      title: "Autonomous Agents",
      description: "AI-powered autonomous agents managing ecosystem operations and optimization",
      icon: Zap,
      status: "Learning",
      color: "text-cyan-400",
      action: () => navigate('/autonomous'),
      features: ["Self-Optimization", "24/7 Operations", "Smart Contracts"]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-4">XMRT Ecosystem Capabilities</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A comprehensive decentralized ecosystem combining mobile mining, mesh networking, 
          privacy-first transactions, and autonomous governance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capabilities.map((capability, index) => (
          <Card key={index} className="glass-card hover:shadow-neon-strong transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <capability.icon className={`h-8 w-8 ${capability.color} group-hover:scale-110 transition-transform duration-300`} />
                <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400">
                  {capability.status}
                </Badge>
              </div>
              <CardTitle className="text-foreground">{capability.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {capability.description}
              </p>
              
              <div className="space-y-2">
                {capability.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-xs text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={capability.action}
                className="w-full neon-button group-hover:shadow-neon-strong"
              >
                Explore {capability.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}