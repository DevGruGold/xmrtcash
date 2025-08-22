import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Search, RefreshCw, Smartphone, Database, BarChart3 } from "lucide-react";
import { getMobileMiningStats, MobileMiningStats } from "@/lib/real-data-api";

const DAOLeaderboard: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<MobileMiningStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getMobileMiningStats();
      setLeaderboardData(data);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Leaderboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    
    // Refresh every minute
    const interval = setInterval(fetchLeaderboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = leaderboardData.filter(miner =>
    miner.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
          </CardHeader>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-32"></div>
                  <div className="h-3 bg-muted rounded w-48"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchLeaderboardData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-6 w-6" />
            XMRT DAO Mobile Mining Leaderboard
          </CardTitle>
          <CardDescription>
            Real-time mobile mining contributions and DAO participation rankings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by identifier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchLeaderboardData} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real Data Integration Notice */}
      <Card className="border-dashed border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <Database className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Real Data Integration In Progress</h3>
              <p className="text-muted-foreground mt-2">
                Mobile mining leaderboard data will be sourced from xmrtdao.streamlit.app and live mining pools. 
                No simulated data is displayed - only real mining contributions will appear here.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild className="gap-2">
                <a href="https://mobilemonero.com" target="_blank" rel="noopener noreferrer">
                  <Smartphone className="w-4 h-4" />
                  Start Mobile Mining
                </a>
              </Button>
              <Button variant="outline" asChild className="gap-2">
                <a href="https://xmrtdao.streamlit.app" target="_blank" rel="noopener noreferrer">
                  <BarChart3 className="w-4 h-4" />
                  View DAO Dashboard
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Miners</p>
                <p className="text-2xl font-bold">Pending Integration</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Daily Hashrate</p>
                <p className="text-2xl font-bold">Awaiting Data</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Database className="w-4 h-4 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Data Source</p>
                <p className="text-2xl font-bold">Live API</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            How to Join the Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center p-0 text-xs">1</Badge>
              <span>Download the mobile mining app from <a href="https://mobilemonero.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mobilemonero.com</a></span>
            </li>
            <li className="flex items-start gap-3">
              <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center p-0 text-xs">2</Badge>
              <span>Register your mining identity at <a href="https://xmrtdao.streamlit.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">xmrtdao.streamlit.app</a></span>
            </li>
            <li className="flex items-start gap-3">
              <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center p-0 text-xs">3</Badge>
              <span>Start "Night Moves" mining while you sleep</span>
            </li>
            <li className="flex items-start gap-3">
              <Badge variant="outline" className="min-w-6 h-6 flex items-center justify-center p-0 text-xs">4</Badge>
              <span>Your real contributions will appear here once data integration is complete</span>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default DAOLeaderboard;