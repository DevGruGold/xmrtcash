import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  Radio, 
  Map, 
  MessageSquare, 
  Battery, 
  Signal,
  Router,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Globe,
  Zap
} from 'lucide-react';
import { meshNetworkManager, MeshNetwork, MeshNode, MeshMessage } from '@/lib/meshnet-integration';

const MeshNetworkDashboard: React.FC = () => {
  const [networks, setNetworks] = useState<MeshNetwork[]>([]);
  const [nodes, setNodes] = useState<MeshNode[]>([]);
  const [recentMessages, setRecentMessages] = useState<MeshMessage[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('xmrt-primary');

  useEffect(() => {
    // Initialize data
    setNetworks(meshNetworkManager.getNetworks());
    setNodes(meshNetworkManager.getNodes());
    setRecentMessages(meshNetworkManager.getRecentMessages());
    setIsSimulating(meshNetworkManager.isSimulationRunning());

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      setNetworks(meshNetworkManager.getNetworks());
      setNodes(meshNetworkManager.getNodes());
      setRecentMessages(meshNetworkManager.getRecentMessages());
      setIsSimulating(meshNetworkManager.isSimulationRunning());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSimulationToggle = () => {
    if (isSimulating) {
      meshNetworkManager.stopSimulation();
    } else {
      meshNetworkManager.startSimulation();
    }
    setIsSimulating(!isSimulating);
  };

  const getNodeIcon = (role: MeshNode['role']) => {
    switch (role) {
      case 'router': return <Router className="h-4 w-4" />;
      case 'repeater': return <Radio className="h-4 w-4" />;
      case 'client': return <Users className="h-4 w-4" />;
    }
  };

  const getSignalStrength = (signalStrength: number): { level: string; color: string; bars: number } => {
    if (signalStrength >= -50) return { level: 'Excellent', color: 'text-green-500', bars: 4 };
    if (signalStrength >= -60) return { level: 'Good', color: 'text-blue-500', bars: 3 };
    if (signalStrength >= -70) return { level: 'Fair', color: 'text-yellow-500', bars: 2 };
    return { level: 'Poor', color: 'text-red-500', bars: 1 };
  };

  const formatMessageType = (type: MeshMessage['messageType']) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getMessageIcon = (messageType: MeshMessage['messageType']) => {
    switch (messageType) {
      case 'text': return <MessageSquare className="h-4 w-4" />;
      case 'position': return <Map className="h-4 w-4" />;
      case 'telemetry': return <Activity className="h-4 w-4" />;
      case 'admin': return <Router className="h-4 w-4" />;
      case 'agent-command': return <Zap className="h-4 w-4" />;
    }
  };

  const currentNetwork = networks.find(n => n.id === selectedNetwork);
  const networkStats = currentNetwork ? meshNetworkManager.getNetworkStats(selectedNetwork) : null;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">MESHNET Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor XMRT-Meshtastic LoRa mesh network operations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isSimulating ? "default" : "secondary"} className="px-3 py-1">
            {isSimulating ? (
              <>
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                Live Simulation
              </>
            ) : (
              <>
                <WifiOff className="h-3 w-3 mr-1" />
                Simulation Paused
              </>
            )}
          </Badge>
          <Button 
            onClick={handleSimulationToggle}
            variant={isSimulating ? "destructive" : "default"}
            size="sm"
          >
            {isSimulating ? (
              <>
                <WifiOff className="h-4 w-4 mr-2" />
                Stop Simulation
              </>
            ) : (
              <>
                <Radio className="h-4 w-4 mr-2" />
                Start Simulation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Network Overview */}
      {networkStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Status</CardTitle>
              {currentNetwork?.status === 'online' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {currentNetwork?.status}
              </div>
              <p className="text-xs text-muted-foreground">
                {networkStats.onlineNodes} of {networkStats.totalNodes} nodes online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage Area</CardTitle>
              <Map className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentNetwork?.coverageArea.toFixed(1)} km²
              </div>
              <p className="text-xs text-muted-foreground">
                mesh network coverage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Message Traffic</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {networkStats.recentMessages}
              </div>
              <p className="text-xs text-muted-foreground">
                messages in last hour
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Signal Quality</CardTitle>
              <Signal className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {networkStats.averageSignalStrength.toFixed(0)} dBm
              </div>
              <p className="text-xs text-muted-foreground">
                average signal strength
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="nodes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nodes">Mesh Nodes</TabsTrigger>
          <TabsTrigger value="messages">Message Traffic</TabsTrigger>
          <TabsTrigger value="topology">Network Topology</TabsTrigger>
        </TabsList>

        <TabsContent value="nodes" className="space-y-4">
          <div className="grid gap-4">
            {nodes.map((node) => {
              const signal = getSignalStrength(node.signalStrength);
              return (
                <Card key={node.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {node.isOnline ? (
                            <Wifi className="h-5 w-5 text-green-500" />
                          ) : (
                            <WifiOff className="h-5 w-5 text-red-500" />
                          )}
                          {getNodeIcon(node.role)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{node.name}</CardTitle>
                          <CardDescription>
                            {node.hardware} • {node.firmwareVersion}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {node.role}
                        </Badge>
                        <Badge variant={node.isOnline ? "default" : "destructive"}>
                          {node.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Signal Strength</p>
                        <div className="flex items-center space-x-2">
                          <Signal className={`h-4 w-4 ${signal.color}`} />
                          <span className="font-medium">{node.signalStrength} dBm</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{signal.level}</p>
                      </div>

                      {node.battery !== undefined && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Battery</p>
                          <div className="flex items-center space-x-2">
                            <Battery className={`h-4 w-4 ${
                              node.battery > 50 ? 'text-green-500' : 
                              node.battery > 20 ? 'text-yellow-500' : 'text-red-500'
                            }`} />
                            <span className="font-medium">{node.battery}%</span>
                          </div>
                          <Progress value={node.battery} className="h-2" />
                        </div>
                      )}

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Channels</p>
                        <div className="flex flex-wrap gap-1">
                          {node.channels.slice(0, 2).map((channel) => (
                            <Badge key={channel} variant="secondary" className="text-xs">
                              {channel.replace('xmrt-', '')}
                            </Badge>
                          ))}
                          {node.channels.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{node.channels.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Last Seen</p>
                        <p className="font-medium text-sm">
                          {new Date(node.lastSeen).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {node.position && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Map className="h-4 w-4" />
                        <span>
                          {node.position.latitude.toFixed(4)}, {node.position.longitude.toFixed(4)}
                          {node.position.altitude && ` • ${node.position.altitude}m`}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Mesh Messages</CardTitle>
              <CardDescription>
                Live message traffic across the XMRT mesh network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {recentMessages.map((message) => {
                    const fromNode = nodes.find(n => n.id === message.from);
                    const toNode = nodes.find(n => n.id === message.to);
                    
                    return (
                      <div key={message.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getMessageIcon(message.messageType)}
                            <div>
                              <h4 className="font-semibold text-sm">
                                {formatMessageType(message.messageType)}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {fromNode?.name || message.from} → {toNode?.name || message.to}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {message.hops} hops
                              </Badge>
                              {message.acknowledged ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>

                        <div className="text-sm">
                          <Badge variant="secondary" className="text-xs mr-2">
                            {message.channel}
                          </Badge>
                          {message.messageType === 'text' && message.payload.text && (
                            <span className="text-muted-foreground">
                              {message.payload.text}
                            </span>
                          )}
                          {message.messageType === 'position' && (
                            <span className="text-muted-foreground">
                              Location: {message.payload.latitude?.toFixed(4)}, {message.payload.longitude?.toFixed(4)}
                            </span>
                          )}
                          {message.messageType === 'telemetry' && (
                            <span className="text-muted-foreground">
                              Battery: {message.payload.battery}%, Temp: {message.payload.temperature}°C
                            </span>
                          )}
                          {message.messageType === 'agent-command' && (
                            <span className="text-muted-foreground">
                              Command: {message.payload.command} for {message.payload.agentId}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Topology</CardTitle>
              <CardDescription>
                Visual representation of mesh network structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Network topology visualization coming soon...</p>
                <p className="text-sm">
                  This will show node connections and routing paths
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeshNetworkDashboard;