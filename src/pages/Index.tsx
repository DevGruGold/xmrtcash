
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import LiveEcosystemStats from "@/components/ecosystem/LiveEcosystemStats";
import EcosystemCapabilities from "@/components/ecosystem/EcosystemCapabilities";
import MiningDashboard from "@/components/mining/MiningDashboard";
import DAOLeaderboard from "@/components/dao/DAOLeaderboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, Globe, Bot } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex">
        <MochaSidebar />
        
        <div className="flex-1 lg:ml-0">
          <MochaHeader />
          
          <main className="p-3 sm:p-4 lg:p-6 space-y-6 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Hero Section with Eliza */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-float">
                    <Globe className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold gradient-text">XMRT Ecosystem</h1>
                </div>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Decentralized mobile mining, mesh networking, and privacy-first DeFi platform with real-time data
                </p>
              </div>

              {/* Live Stats */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Live Ecosystem Statistics</h2>
                <LiveEcosystemStats />
              </div>

              {/* Mining Dashboard Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight">Real Mining Data</h2>
                  <p className="text-muted-foreground mt-2">
                    Live statistics from SupportXMR pool and P2Pool networks
                  </p>
                </div>
                <MiningDashboard />
              </div>
              
              {/* DAO Leaderboard Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight">Mobile Mining Leaderboard</h2>
                  <p className="text-muted-foreground mt-2">
                    XMRT DAO contributors and mobile mining champions
                  </p>
                </div>
                <DAOLeaderboard />
              </div>

              {/* Capabilities */}
              <EcosystemCapabilities />

              {/* Network Health */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="w-5 h-5 text-primary" />
                    Network Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">99.8%</div>
                      <div className="text-sm text-muted-foreground">Network Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">847.2 KH/s</div>
                      <div className="text-sm text-muted-foreground">Total Hashrate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">89</div>
                      <div className="text-sm text-muted-foreground">Mesh Nodes Online</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
