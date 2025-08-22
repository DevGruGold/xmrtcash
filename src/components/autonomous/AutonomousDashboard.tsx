import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Activity, 
  Brain, 
  Zap, 
  Network, 
  GitCommit,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { autonomousCycleManager, AutonomousAgent, CycleReport } from '@/lib/autonomous-cycles';
import { meshNetworkManager } from '@/lib/meshnet-integration';

const AutonomousDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AutonomousAgent[]>([]);
  const [recentReports, setRecentReports] = useState<CycleReport[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  useEffect(() => {
    // Initialize data
    setAgents(autonomousCycleManager.getAllAgents());
    setRecentReports(autonomousCycleManager.getRecentReports());
    setIsRunning(autonomousCycleManager.isSystemRunning());

    // Set up polling for real-time updates
    const interval = setInterval(() => {
      setAgents(autonomousCycleManager.getAllAgents());
      setRecentReports(autonomousCycleManager.getRecentReports());
      setIsRunning(autonomousCycleManager.isSystemRunning());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleStartStop = () => {
    if (isRunning) {
      autonomousCycleManager.stopAutonomousCycles();
      meshNetworkManager.stopSimulation();
    } else {
      autonomousCycleManager.startAutonomousCycles();
      meshNetworkManager.startSimulation();
    }
    setIsRunning(!isRunning);
  };

  const getStatusColor = (status: AutonomousAgent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'cycling': return 'bg-blue-500';
      case 'analyzing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: AutonomousAgent['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'cycling': return <Activity className="h-4 w-4 animate-spin" />;
      case 'analyzing': return <Brain className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getCycleTypeIcon = (type: CycleReport['type']) => {
    switch (type) {
      case 'tool-discovery': return <Network className="h-4 w-4" />;
      case 'self-analysis': return <Brain className="h-4 w-4" />;
      case 'state-save': return <GitCommit className="h-4 w-4" />;
      case 'self-improvement': return <TrendingUp className="h-4 w-4" />;
    }
  };

  const formatCycleType = (type: CycleReport['type']) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Autonomous Agent Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and control the XMRT autonomous agent ecosystem
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isRunning ? "default" : "secondary"} className="px-3 py-1">
            {isRunning ? (
              <>
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Active
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Paused
              </>
            )}
          </Badge>
          <Button 
            onClick={handleStartStop}
            variant={isRunning ? "destructive" : "default"}
            size="sm"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Cycles
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Cycles
              </>
            )}
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter(a => a.status === 'active' || a.status === 'cycling').length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {agents.length} total agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cycles</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.reduce((sum, agent) => sum + agent.cycleStats.totalCycles, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              across all agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.length > 0 ? Math.round(
                (agents.reduce((sum, agent) => sum + agent.cycleStats.successfulCycles, 0) /
                 agents.reduce((sum, agent) => sum + agent.cycleStats.totalCycles, 0)) * 100
              ) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              cycle completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Reports</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentReports.length}</div>
            <p className="text-xs text-muted-foreground">
              cycle reports generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="cycles">Cycle Reports</TabsTrigger>
          <TabsTrigger value="control">Agent Control</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(agent.status)}`} />
                      <div>
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription>{agent.role}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <Badge variant="outline">
                        Cycle {agent.currentCycle}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Cycles</p>
                      <p className="font-medium">{agent.cycleStats.totalCycles}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Successful</p>
                      <p className="font-medium">{agent.cycleStats.successfulCycles}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Success Rate</p>
                      <p className="font-medium">
                        {agent.cycleStats.totalCycles > 0 
                          ? Math.round((agent.cycleStats.successfulCycles / agent.cycleStats.totalCycles) * 100)
                          : 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Activity</p>
                      <p className="font-medium">
                        {new Date(agent.lastActivity).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cycle Progress</span>
                      <span>{agent.status}</span>
                    </div>
                    <Progress 
                      value={agent.status === 'cycling' ? 65 : agent.status === 'active' ? 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  {agent.deploymentUrl && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Network className="h-4 w-4" />
                      <span>Deployed at: {agent.deploymentUrl}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cycles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Cycle Reports</CardTitle>
              <CardDescription>
                Latest autonomous agent cycle activities and findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getCycleTypeIcon(report.type)}
                          <div>
                            <h4 className="font-semibold">
                              {formatCycleType(report.type)} - Cycle {report.cycleNumber}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Agent: {agents.find(a => a.id === report.agentId)?.name || report.agentId}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={report.status === 'completed' ? 'default' : 
                                   report.status === 'failed' ? 'destructive' : 'secondary'}
                          >
                            {report.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(report.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {report.findings.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Findings:</h5>
                          <ul className="text-sm space-y-1">
                            {report.findings.map((finding, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-muted-foreground">•</span>
                                <span>{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {report.improvements.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium mb-2">Improvements:</h5>
                          <ul className="text-sm space-y-1">
                            {report.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-green-500">✓</span>
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Control Panel</CardTitle>
              <CardDescription>
                Direct and coordinate autonomous agent activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Agent control interface coming soon...</p>
                <p className="text-sm">
                  This will allow direct agent task assignment and coordination
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutonomousDashboard;