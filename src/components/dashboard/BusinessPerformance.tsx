import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Brain, Wallet, Users, Vote } from "lucide-react";
import { getTreasuryStats, getSupportXMRPoolStats } from '@/lib/real-data-api';

export default function BusinessPerformance() {
  const [performanceData, setPerformanceData] = useState({
    revenue: 0,
    aiEfficiency: 0,
    treasuryBalance: 0,
    activeProposals: 3,
    participation: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const [treasury, poolStats] = await Promise.all([
          getTreasuryStats(),
          getSupportXMRPoolStats()
        ]);
        
        setPerformanceData({
          revenue: treasury.treasuryBalance,
          aiEfficiency: poolStats.miners > 0 ? Math.min(99, (poolStats.miners / 5000) * 100) : 0,
          treasuryBalance: treasury.treasuryBalance,
          activeProposals: 3, // This would come from governance API
          participation: poolStats.miners > 0 ? Math.min(99, (poolStats.miners / 5000) * 100) : 0
        });
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const performanceMetrics = [
    {
      label: "Treasury Value",
      value: loading ? "Loading..." : `$${(performanceData.revenue / 1000).toFixed(1)}K`,
      change: "+5.2%",
      positive: true,
      icon: DollarSign
    },
    {
      label: "Pool Efficiency", 
      value: loading ? "Loading..." : `${performanceData.aiEfficiency.toFixed(1)}%`,
      change: "+2.1%",
      positive: true,
      icon: Brain
    }
  ];

  const additionalStats = [
    {
      label: "Treasury Balance",
      value: loading ? "Loading..." : `$${(performanceData.treasuryBalance / 1000).toFixed(1)}K`,
      icon: Wallet
    },
    {
      label: "Active Proposals", 
      value: performanceData.activeProposals.toString(),
      icon: Vote
    },
    {
      label: "Network Participation",
      value: loading ? "Loading..." : `${performanceData.participation.toFixed(0)}%`,
      icon: Users
    }
  ];
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Business Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {performanceMetrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <Badge 
                    variant={metric.positive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Stats */}
        <div className="space-y-3 pt-4 border-t border-border/40">
          {additionalStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className="font-medium">{stat.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}