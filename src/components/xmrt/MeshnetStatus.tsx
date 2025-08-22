import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Wifi, 
  WifiOff, 
  Radio, 
  Users, 
  Globe,
  Smartphone,
  Headphones,
  Router,
  Activity,
  Signal,
  Battery,
  MapPin
} from "lucide-react";

export default function MeshnetStatus() {
  const [meshnetStatus, setMeshnetStatus] = useState("connected");
  const [nodeCount, setNodeCount] = useState(247);
  const [signalStrength, setSignalStrength] = useState(85);
  const [isOffline, setIsOffline] = useState(false);

  // Mock mesh network data
  const [meshData, setMeshData] = useState({
    connectedPeers: 12,
    nearbyNodes: 8,
    meshRange: "2.4 km",
    dataTransmitted: "1.2 GB",
    uptimeHours: 142,
    batteryOptimized: true,
    location: "San José, Costa Rica"
  });

  // Simulate real-time mesh network updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNodeCount(prev => prev + Math.floor(Math.random() * 3) - 1);
      setSignalStrength(prev => Math.max(20, Math.min(100, prev + Math.floor(Math.random() * 10) - 5)));
      
      setMeshData(prev => ({
        ...prev,
        connectedPeers: Math.max(5, Math.min(25, prev.connectedPeers + Math.floor(Math.random() * 3) - 1)),
        nearbyNodes: Math.max(3, Math.min(15, prev.nearbyNodes + Math.floor(Math.random() * 2) - 1)),
        uptimeHours: prev.uptimeHours + (1/60) // Increment uptime
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleMeshnet = () => {
    setMeshnetStatus(meshnetStatus === "connected" ? "disconnected" : "connected");
  };

  const toggleOfflineMode = () => {
    setIsOffline(!isOffline);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-float">
                <Radio className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="gradient-text">XMRT MESHNET</CardTitle>
                <CardDescription>Mining when the internet dies</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`${meshnetStatus === 'connected' ? 'neon-border bg-primary/10 text-primary' : 'border-red-500/20 text-red-500'}`}
              >
                {meshnetStatus === 'connected' ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
                {meshnetStatus.toUpperCase()}
              </Badge>
              <Badge variant="outline" className={`${isOffline ? 'text-orange-500 border-orange-500/20' : 'text-green-500 border-green-500/20'}`}>
                {isOffline ? <WifiOff className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                {isOffline ? "OFFLINE" : "ONLINE"}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Global Nodes</div>
                <div className="text-2xl font-bold gradient-text">{nodeCount}</div>
              </div>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Connected Peers</div>
                <div className="text-2xl font-bold text-primary">{meshData.connectedPeers}</div>
              </div>
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Signal Strength</div>
                <div className="text-2xl font-bold text-green-500">{signalStrength}%</div>
              </div>
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <Signal className="w-4 h-4 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Mesh Range</div>
                <div className="text-2xl font-bold text-blue-500">{meshData.meshRange}</div>
              </div>
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Mesh Network Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={toggleMeshnet}
              variant={meshnetStatus === "connected" ? "destructive" : "default"}
              className={meshnetStatus === "connected" ? "" : "bg-primary hover:bg-primary/90 shadow-neon"}
            >
              {meshnetStatus === "connected" ? "Disconnect" : "Connect"} Meshnet
            </Button>

            <Button
              onClick={toggleOfflineMode}
              variant="outline"
              className="border-primary/20 hover:bg-primary/5"
            >
              {isOffline ? "Go Online" : "Offline Mode"}
            </Button>

            <Button
              variant="outline"
              className="border-primary/20 hover:bg-primary/5"
            >
              <Activity className="w-4 h-4 mr-2" />
              Network Scan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Device Network
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-sm">Primary Node (Phone)</span>
                </div>
                <Badge variant="outline" className="neon-border bg-primary/10 text-primary text-xs">
                  ACTIVE
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Earpiece Validator</span>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500/20 text-xs">
                  VALIDATING
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Router className="w-4 h-4 text-orange-500" />
                  <span className="text-sm">Gateway Router</span>
                </div>
                <Badge variant="outline" className="text-muted-foreground border-muted text-xs">
                  STANDBY
                </Badge>
              </div>
            </div>

            <Separator className="bg-primary/20" />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Battery Optimization</span>
                <span className={meshData.batteryOptimized ? "text-green-500" : "text-red-500"}>
                  {meshData.batteryOptimized ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span>{Math.floor(meshData.uptimeHours)}h {Math.floor((meshData.uptimeHours % 1) * 60)}m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Network Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nearby Nodes</span>
                <span className="font-mono">{meshData.nearbyNodes}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Data Transmitted</span>
                <span className="font-mono">{meshData.dataTransmitted}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Location</span>
                <span className="font-mono text-xs">{meshData.location}</span>
              </div>
            </div>

            <Separator className="bg-primary/20" />

            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-2">Network Health</div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-500">EXCELLENT</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Panel */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="gradient-text">About XMRT MESHNET</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Revolutionary mesh network</strong> that enables continuous Monero mining even without internet connectivity. 
              Your phone becomes a miner, your earpiece becomes a validator, and you earn XMRT tokens regardless of network availability.
            </p>
            <p>
              <strong>Key Features:</strong> Offline mining • Radio mesh networking • Decentralized proof-of-work • 24/7 earning potential • Mobile-first design
            </p>
            <p className="gradient-text font-medium">
              "When the cloud disappears, XMRT still mines." - Building the network that doesn't go down.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}