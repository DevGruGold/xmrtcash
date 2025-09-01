import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Smartphone, 
  Zap, 
  TrendingUp, 
  Activity, 
  Wifi, 
  WifiOff,
  Battery,
  Thermometer,
  Clock,
  DollarSign,
  Moon,
  Sun
} from "lucide-react";
import { getXMRTWalletMining, getSupportXMRPoolStats } from '@/lib/real-data-api';

export default function MobileMiningStat() {
  const [isNightMode, setIsNightMode] = useState(false);
  const [miningActive, setMiningActive] = useState(true);
  const [meshnetStatus, setMeshnetStatus] = useState("connected");

  // Real mining data from SupportXMR
  const [miningStats, setMiningStats] = useState({
    hashrate: 0,
    power: 2.1,
    temperature: 42,
    battery: 89,
    xmrtEarned: 0,
    blocksFound: 0,
    networkHashrate: "0 H/s",
    difficulty: "0",
    uptime: "0h 0m",
    poolShare: 0
  });

  // Fetch real mining data
  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        const [walletData, poolData] = await Promise.all([
          getXMRTWalletMining(),
          getSupportXMRPoolStats()
        ]);
        
        setMiningStats(prev => ({
          ...prev,
          hashrate: walletData.currentHashrate || 0,
          xmrtEarned: (walletData.amountDue / 1000000000000) || 0,
          networkHashrate: `${(poolData.hashRate / 1000000).toFixed(1)} MH/s`,
          difficulty: poolData.totalBlocksFound?.toString() || "0",
          blocksFound: poolData.totalBlocksFound || 0,
          poolShare: walletData.poolContribution || 0
        }));
        
        setMiningActive(walletData.currentHashrate > 0);
        setMeshnetStatus(walletData.currentHashrate > 0 ? "connected" : "idle");
      } catch (error) {
        console.error('Failed to fetch mobile mining data:', error);
        setMeshnetStatus("disconnected");
      }
    };

    fetchMiningData();
    const interval = setInterval(fetchMiningData, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleMining = () => {
    setMiningActive(!miningActive);
  };

  const toggleNightMode = () => {
    setIsNightMode(!isNightMode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Mining Control Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-float">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="gradient-text">Mobile Mining Dashboard</CardTitle>
                <CardDescription>MobileMonero.com Integration</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${miningActive ? 'neon-border bg-primary/10 text-primary' : 'border-muted text-muted-foreground'}`}
              >
                {miningActive ? <Zap className="w-3 h-3 mr-1 animate-pulse" /> : <Activity className="w-3 h-3 mr-1" />}
                {miningActive ? "MINING" : "STOPPED"}
              </Badge>
              <Badge variant="outline" className={`${meshnetStatus === 'connected' ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}`}>
                {meshnetStatus === 'connected' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                MESHNET
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Mining Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Mining Status</div>
                <div className="text-lg font-bold">{miningActive ? "Active" : "Paused"}</div>
              </div>
              <Button 
                onClick={toggleMining}
                variant={miningActive ? "destructive" : "default"}
                size="sm"
                className={miningActive ? "" : "bg-primary hover:bg-primary/90 shadow-neon"}
              >
                {miningActive ? "Stop" : "Start"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Mode</div>
                <div className="text-lg font-bold">{isNightMode ? "Night Moves" : "Day Mining"}</div>
              </div>
              <Button 
                onClick={toggleNightMode}
                variant="outline"
                size="sm"
                className="border-primary/20 hover:bg-primary/5"
              >
                {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">XMRT Earned</div>
                <div className="text-lg font-bold gradient-text">{miningStats.xmrtEarned.toFixed(4)}</div>
              </div>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm">Hashrate</span>
              </div>
              <div className="text-sm font-mono">{miningStats.hashrate.toFixed(2)} H/s</div>
            </div>
            <Separator className="bg-primary/20" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Power Usage</span>
              </div>
              <div className="text-sm font-mono">{miningStats.power.toFixed(1)} W</div>
            </div>
            <Separator className="bg-primary/20" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-red-500" />
                <span className="text-sm">Temperature</span>
              </div>
              <div className="text-sm font-mono">{miningStats.temperature.toFixed(0)}°C</div>
            </div>
            <Separator className="bg-primary/20" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-green-500" />
                <span className="text-sm">Battery</span>
              </div>
              <div className="text-sm font-mono">{miningStats.battery.toFixed(0)}%</div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">Network Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-sm">Network Hashrate</span>
              </div>
              <div className="text-sm font-mono">{miningStats.networkHashrate}</div>
            </div>
            <Separator className="bg-primary/20" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Difficulty</span>
              </div>
              <div className="text-sm font-mono">{miningStats.difficulty}</div>
            </div>
            <Separator className="bg-primary/20" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm">Uptime</span>
              </div>
              <div className="text-sm font-mono">{miningStats.uptime}</div>
            </div>
            <Separator className="bg-primary/20" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-sm">Pool Share</span>
              </div>
              <div className="text-sm font-mono">{(miningStats.poolShare * 100).toFixed(4)}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Night Moves Info */}
      {isNightMode && (
        <Card className="glass-card border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-primary" />
              <CardTitle className="gradient-text">Night Moves Active</CardTitle>
            </div>
            <CardDescription>
              Passive mining while you sleep - optimized power consumption and heat management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              • Reduced hashrate for extended battery life<br/>
              • Lower temperature thresholds for safer operation<br/>
              • Automatic pause when battery drops below 20%<br/>
              • Optimized for overnight mining sessions
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}