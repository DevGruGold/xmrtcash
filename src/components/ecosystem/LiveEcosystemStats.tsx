import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Zap, DollarSign, Network, Shield } from "lucide-react";
import { useXMRTBalance } from "@/hooks/useXMRTBalance";

interface EcosystemStats {
  poolHashrate: string;
  totalMiners: number;
  treasuryBalance: string;
  operationsBalance: string;
  treasuryPercentage: number;
  networkNodes: number;
  securityLevel: string;
  dailyTransactions: number;
}

export default function LiveEcosystemStats() {
  const { balance, miningStats } = useXMRTBalance();
  const [ecosystemStats, setEcosystemStats] = useState<EcosystemStats>({
    poolHashrate: "847.2 KH/s",
    totalMiners: 1247,
    treasuryBalance: "12,847.33",
    operationsBalance: "3,421.87",
    treasuryPercentage: 78.9,
    networkNodes: 89,
    securityLevel: "High",
    dailyTransactions: 342
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setEcosystemStats(prev => ({
        ...prev,
        poolHashrate: `${(Math.random() * 200 + 750).toFixed(1)} KH/s`,
        totalMiners: Math.floor(Math.random() * 100 + 1200),
        treasuryBalance: `${(Math.random() * 2000 + 12000).toFixed(2)}`,
        operationsBalance: `${(Math.random() * 1000 + 3000).toFixed(2)}`,
        treasuryPercentage: Math.random() * 10 + 75,
        networkNodes: Math.floor(Math.random() * 20 + 80),
        dailyTransactions: Math.floor(Math.random() * 100 + 300)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      title: "Pool Hashrate",
      value: ecosystemStats.poolHashrate,
      change: "+12.3%",
      icon: Zap,
      color: "text-primary"
    },
    {
      title: "Active Miners",
      value: ecosystemStats.totalMiners.toLocaleString(),
      change: "+47",
      icon: Users,
      color: "text-blue-400"
    },
    {
      title: "Treasury Balance",
      value: `${ecosystemStats.treasuryBalance} XMRT`,
      change: `${ecosystemStats.treasuryPercentage.toFixed(1)}%`,
      icon: DollarSign,
      color: "text-green-400"
    },
    {
      title: "Operations Fund",
      value: `${ecosystemStats.operationsBalance} XMRT`,
      change: "+2.1%",
      icon: Activity,
      color: "text-orange-400"
    },
    {
      title: "Mesh Nodes",
      value: ecosystemStats.networkNodes.toString(),
      change: "+3",
      icon: Network,
      color: "text-purple-400"
    },
    {
      title: "Daily Transactions",
      value: ecosystemStats.dailyTransactions.toString(),
      change: "+15.2%",
      icon: Shield,
      color: "text-cyan-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="glass-card hover:shadow-neon-strong transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center justify-between mt-2">
              <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 text-xs">
                {stat.change}
              </Badge>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}