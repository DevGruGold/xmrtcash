import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Medal, 
  Award, 
  Smartphone, 
  Moon, 
  Sun, 
  Activity,
  Search,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { getMobileMiningStats } from '@/lib/real-data-api';
import { useToast } from '@/hooks/use-toast';

export default function DAOLeaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      const data = await getMobileMiningStats();
      setLeaderboardData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch leaderboard data:', err);
      setError('Failed to load leaderboard data');
      toast({
        title: "Leaderboard Error",
        description: "Failed to fetch mobile mining leaderboard",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const filteredData = leaderboardData.filter(miner => 
    miner.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getStatusColor = (lastSeen: number) => {
    const minutesAgo = (Date.now() - lastSeen) / (1000 * 60);
    if (minutesAgo < 5) return 'bg-green-500';
    if (minutesAgo < 15) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatLastSeen = (lastSeen: number) => {
    const minutesAgo = Math.floor((Date.now() - lastSeen) / (1000 * 60));
    if (minutesAgo < 1) return 'Just now';
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `${hoursAgo}h ago`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `${daysAgo}d ago`;
  };

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

      {/* Statistics Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Miners</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaderboardData.length}</div>
            <p className="text-xs text-muted-foreground">
              Contributing to DAO treasury
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Daily Hashrate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboardData.reduce((sum, miner) => sum + miner.dailyHashrate, 0).toFixed(1)} H/s
            </div>
            <p className="text-xs text-muted-foreground">
              Across all mobile miners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Night Mode Miners</CardTitle>
            <Moon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboardData.filter(miner => miner.isNightMode).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Energy-efficient mining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {filteredData.length === 0 ? (
          <Card className="p-6">
            <div className="text-center text-muted-foreground">
              {searchTerm ? 'No miners found matching your search.' : 'No active miners found.'}
            </div>
          </Card>
        ) : (
          filteredData.map((miner, index) => (
            <Card key={miner.identifier} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12">
                      {getRankIcon(miner.rank)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {miner.identifier.slice(-2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{miner.identifier}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(miner.lastSeen)}`}></div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{miner.dailyHashrate.toFixed(1)} H/s</span>
                        <span>•</span>
                        <span>{miner.totalContribution.toFixed(1)} XMR contributed</span>
                        <span>•</span>
                        <span>{formatLastSeen(miner.lastSeen)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {miner.isNightMode && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Moon className="h-3 w-3" />
                        Night Mode
                      </Badge>
                    )}
                    <Badge variant={miner.rank <= 3 ? "default" : "secondary"}>
                      Rank #{miner.rank}
                    </Badge>
                  </div>
                </div>
                
                {/* Additional Stats Row */}
                <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-primary">{miner.dailyHashrate.toFixed(2)}</div>
                    <div className="text-muted-foreground">H/s Today</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-primary">{miner.totalContribution.toFixed(1)}</div>
                    <div className="text-muted-foreground">Total XMR</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-primary">
                      {((miner.dailyHashrate / leaderboardData.reduce((sum, m) => sum + m.dailyHashrate, 0)) * 100).toFixed(1)}%
                    </div>
                    <div className="text-muted-foreground">Pool Share</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            <h4 className="font-semibold mb-2">How to join the leaderboard:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Install MobileMonero mining app on your device</li>
              <li>Run the XMRT DAO setup script to get your unique identifier</li>
              <li>Start mining and contribute to the DAO treasury</li>
              <li>Your stats will appear here automatically</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}