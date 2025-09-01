import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, Vote, FileText, TrendingUp } from "lucide-react";
import { getSupportXMRPoolStats, getXMRTWalletMining } from '@/lib/real-data-api';

export default function BlockchainActivity() {
  const [activityData, setActivityData] = useState([
    {
      id: 1,
      type: "Loading...",
      address: "Fetching real data...",
      amount: "",
      time: "",
      icon: Activity,
      color: "text-muted-foreground"
    }
  ]);

  useEffect(() => {
    const generateRealActivity = async () => {
      try {
        const [poolStats, walletStats] = await Promise.all([
          getSupportXMRPoolStats(),
          getXMRTWalletMining()
        ]);
        
        const now = new Date();
        const formatTime = (offset: number) => {
          const time = new Date(now.getTime() - offset * 60000);
          return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        const realActivity = [
          {
            id: 1,
            type: "Pool Mining",
            address: "46Ux...C5mg",
            amount: `${(poolStats.hashRate / 1000000).toFixed(1)} MH/s`,
            time: formatTime(1),
            icon: Activity,
            color: walletStats.currentHashrate > 0 ? "text-green-500" : "text-yellow-500"
          },
          {
            id: 2,
            type: "Block Found",
            address: `#${poolStats.lastBlockFound}`,
            amount: `Block ${poolStats.lastBlockFound}`,
            time: formatTime(Math.floor((Date.now() - poolStats.lastBlockFoundTime * 1000) / 60000)),
            icon: TrendingUp,
            color: "text-blue-500"
          },
          {
            id: 3,
            type: "Pool Stats",
            address: "SupportXMR",
            amount: `${poolStats.miners} miners`,
            time: formatTime(2),
            icon: FileText,
            color: "text-orange-500"
          },
          {
            id: 4,
            type: "Wallet Balance",
            address: "46Ux...C5mg",
            amount: `${(walletStats.amountDue / 1000000000000).toFixed(6)} XMR`,
            time: formatTime(3),
            icon: DollarSign,
            color: "text-purple-500"
          },
          {
            id: 5,
            type: "Total Payments",
            address: "Pool History",
            amount: `${poolStats.totalPayments} payments`,
            time: formatTime(5),
            icon: Vote,
            color: "text-indigo-500"
          }
        ];

        setActivityData(realActivity);
      } catch (error) {
        console.error('Failed to generate real activity:', error);
      }
    };

    generateRealActivity();
    const interval = setInterval(generateRealActivity, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          Blockchain Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityData.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-background ${activity.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{activity.type}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {activity.address}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{activity.amount}</div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}