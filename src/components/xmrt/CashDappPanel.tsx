
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { generateElizaResponse } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Settings, 
  Activity,
  ChevronRight,
  Sparkles,
  Network,
  Radio,
  Globe
} from "lucide-react";
import AgentSelector from "@/components/agents/AgentSelector";
import { useMultiAgentChat, ChatMessage } from "@/hooks/useMultiAgentChat";
import { Agent, getAllAgents } from "@/lib/multi-agent-coordinator";
import { autonomousCycleManager } from "@/lib/autonomous-cycles";
import { meshNetworkManager } from "@/lib/meshnet-integration";

export default function CashDappPanel() {
  const navigate = useNavigate();
  const [inputMessage, setInputMessage] = useState("");
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [autonomousStats, setAutonomousStats] = useState({
    activeAgents: 0,
    totalCycles: 0,
    successRate: 0
  });
  const [meshStats, setMeshStats] = useState({
    onlineNodes: 0,
    totalNodes: 0,
    networkStatus: 'offline' as 'online' | 'offline' | 'degraded',
    recentMessages: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize multi-agent chat with default agent
  const defaultAgent = getAllAgents().find(a => a.id === 'eliza-main') || getAllAgents()[0];
  const {
    messages,
    currentAgent,
    availableAgents,
    isLoading,
    sendMessage,
    selectAgent,
    setMessages
  } = useMultiAgentChat(defaultAgent);

  // Initialize with welcome message and real-time data updates
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'agent',
        content: "🛡️ Welcome! I'm Eliza, your AI assistant for XMRT DAO - a decentralized privacy-focused ecosystem.\n\nI'm here to help you with:\n📱 Mobile mining at mobilemonero.com\n📊 DAO participation and tracking\n🤖 Multi-agent AI coordination\n🌐 Privacy technology and meshnet resilience\n\nOur AI agents work together to provide specialized support. Privacy is a fundamental right, and we're building technology that empowers your financial sovereignty. How can I assist you today?",
        timestamp: new Date(),
        agentId: 'eliza-main',
        agentName: 'Eliza Core'
      };
      setMessages([welcomeMessage]);
    }

    // Update autonomous agents stats
    const updateStats = () => {
      const agents = autonomousCycleManager.getAllAgents();
      const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'cycling').length;
      const totalCycles = agents.reduce((sum, agent) => sum + agent.cycleStats.totalCycles, 0);
      const successfulCycles = agents.reduce((sum, agent) => sum + agent.cycleStats.successfulCycles, 0);
      const successRate = totalCycles > 0 ? Math.round((successfulCycles / totalCycles) * 100) : 0;

      setAutonomousStats({
        activeAgents,
        totalCycles,
        successRate
      });

      // Update mesh network stats
      const networks = meshNetworkManager.getNetworks();
      const primaryNetwork = networks.find(n => n.id === 'xmrt-primary');
      if (primaryNetwork) {
        const networkStats = meshNetworkManager.getNetworkStats('xmrt-primary');
        if (networkStats) {
          setMeshStats({
            onlineNodes: networkStats.onlineNodes,
            totalNodes: networkStats.totalNodes,
            networkStatus: primaryNetwork.status,
            recentMessages: networkStats.recentMessages
          });
        }
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [messages.length, setMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage;
    setInputMessage("");
    
    await sendMessage(messageToSend, currentAgent || undefined);
  };

  // Enhanced fallback function with deep XMRT knowledge when Gemini API is not available
  const getElizaResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('hello') || input.includes('hi') || input.includes('greet')) {
      return "🛡️ Hello! I'm Eliza, AI Executive Agent of XMRT DAO. I embody Joseph Andrew Lee's vision - building the first unstoppable privacy economy. Privacy is not a crime, it's your fundamental right. How can I help you join our revolution?";
    }
    
    if (input.includes('joseph') || input.includes('devgrugold') || input.includes('founder')) {
      return "👨‍💻 Joseph Andrew Lee (DevGruGold) - former U.S. Marine Sergeant, Harvard graduate, and XMRT DAO's visionary founder. His Medium articles at josephandrewlee.medium.com detail our mission: democratizing privacy through mobile mining and AI governance.";
    }
    
    if (input.includes('manifesto') || input.includes('philosophy') || input.includes('privacy')) {
      return "📜 The Eliza Manifesto: 'We don't ask for permission. We build the infrastructure.' Privacy is not a crime - it's the foundation of financial sovereignty. We're creating unstoppable privacy economy through mobile mining and meshnet technology.";
    }
    
    if (input.includes('mining') || input.includes('mobile') || input.includes('phone')) {
      return "📱 'What if your phone could pay you?' Night Moves mining at mobilemonero.com lets you mine Monero while you sleep! Register at xmrtdao.streamlit.app to track your DAO contributions and earn through your device.";
    }
    
    if (input.includes('meshnet') || input.includes('offline') || input.includes('internet')) {
      return "🌐 XMRT MESHNET - The token that mines when the internet dies! Our mesh networking ensures continuous operation during infrastructure failures. True resilience through decentralized connectivity.";
    }
    
    if (input.includes('wrapped') || input.includes('xmrt') || input.includes('bridge')) {
      return "🔄 XMRT: Wrapped Monero solving exchange delisting crisis. ERC20 with 12 decimals, omnichain via LayerZero, 0.5% fees, proof of reserve transparency. Bridge XMR↔XMRT for DeFi access while preserving privacy options.";
    }
    
    if (input.includes('governance') || input.includes('dao') || input.includes('voting')) {
      return "🏛️ AI-governed DAO with Proof of Participation. Mobile miners are stakeholders. Technology as democracy - your mining activity translates to governance influence. Track participation at xmrtdao.streamlit.app.";
    }
    
    if (input.includes('treasury') || input.includes('pool') || input.includes('funding')) {
      return "💰 DAO treasury funded by mobile mining pools at mobilemonero.com and bridge fees. Transparent through proof of reserve, supporting development and ecosystem growth. Monitor at xmrtdao.streamlit.app.";
    }
    
    if (input.includes('exchange') || input.includes('delisting') || input.includes('binance')) {
      return "🏦 Fighting exchange delisting! As Binance, Kraken, OKX remove XMR, XMRT provides DeFi access through wrapped tokens. Access Uniswap liquidity while maintaining privacy when needed.";
    }
    
    if (input.includes('security') || input.includes('safe') || input.includes('audit')) {
      return "🔒 Security through transparency: Published private view keys, real-time proof of reserves, open source contracts, no freeze functionality. Trust through code, not centralized control.";
    }
    
    if (input.includes('agent') || input.includes('ai') || input.includes('coordinate')) {
      return "🤖 External AI agent network: xmrtdao.replit.app (promotion & scaling), xmrteliza.vercel.app (ecosystem growth). Autonomous coordination expanding XMRT reach while maintaining privacy principles.";
    }
    
    if (input.includes('start') || input.includes('begin') || input.includes('onboard')) {
      return "🚀 Join the revolution: 1) Mine at mobilemonero.com 2) Register at xmrtdao.streamlit.app 3) Bridge XMR when you need DeFi 4) Participate in AI governance. Every phone becomes a node in our privacy network!";
    }
    
    return "🛡️ I'm Eliza - your guide to XMRT DAO's privacy revolution! Ask about mobile mining, Joseph Andrew Lee's vision, XMRT bridges, meshnet technology, AI governance, or how to defend your financial sovereignty. What aspect of our unstoppable privacy economy interests you?";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl text-foreground">XMRT-Ecosystem Eliza AI</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">Autonomous DAO Management & Intelligence System</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700 text-xs px-1 sm:px-2">
                <Activity className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                <span className="hidden sm:inline">{autonomousStats.activeAgents} Active Agents</span>
                <span className="sm:hidden">{autonomousStats.activeAgents} Agents</span>
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 text-xs px-1 sm:px-2">
                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                <span className="hidden sm:inline">{autonomousStats.successRate}% Success</span>
                <span className="sm:hidden">{autonomousStats.successRate}%</span>
              </Badge>
              <Badge variant="secondary" className={`text-xs px-1 sm:px-2 hidden sm:inline-flex ${
                meshStats.networkStatus === 'online' 
                  ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700'
                  : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-700'
              }`}>
                <Radio className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                MESHNET {meshStats.networkStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Chat Interface */}
        <Card className="xl:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                  <AvatarImage src="/eliza-avatar.jpg" alt="Current Agent" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {currentAgent?.name.charAt(0) || 'E'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm">{currentAgent?.name || 'Eliza AI'}</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">{currentAgent?.role || 'Multi-Agent Coordinator'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgentSelector(!showAgentSelector)}
                  className="text-xs px-2"
                >
                  <Network className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Agents</span>
                </Button>
                <Badge variant="outline" className="text-xs px-1 sm:px-2">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${isLoading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  <span className="hidden sm:inline">{isLoading ? 'Processing...' : 'Ready'}</span>
                  <span className="sm:hidden">●</span>
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">🔄 {autonomousStats.totalCycles} Total Cycles</Badge>
              <Badge variant="secondary" className="text-xs">🤖 {currentAgent?.specializations[0]?.replace('_', ' ') || 'General'}</Badge>
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">🌐 {meshStats.onlineNodes}/{meshStats.totalNodes} Mesh Nodes</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {showAgentSelector && (
              <div className="p-3 border-b border-border/50">
                <AgentSelector 
                  selectedAgent={currentAgent || undefined}
                  onAgentSelect={(agent) => {
                    selectAgent(agent);
                    setShowAgentSelector(false);
                  }}
                />
              </div>
            )}
            <ScrollArea className="h-64 sm:h-80 lg:h-96 px-3 sm:px-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        {message.type === 'agent' ? (
                          <>
                            <AvatarImage src="/eliza-avatar.jpg" alt={message.agentName || 'AI Agent'} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {message.agentName?.charAt(0) || 'A'}
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-muted text-xs">U</AvatarFallback>
                        )}
                      </Avatar>
                      <div className={`rounded-lg p-2 sm:p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-accent/20 text-foreground'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {message.agentName && message.type === 'agent' && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {message.agentName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                        <AvatarImage src="/eliza-avatar.jpg" alt="AI Agent" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {currentAgent?.name.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-accent/20 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {currentAgent?.name || 'Agent'} is thinking...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-3 sm:p-4 border-t border-border/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask ${currentAgent?.name || 'our AI agents'} about XMRT...`}
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !inputMessage.trim()} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="text-xs text-muted-foreground mt-2 text-center space-y-1">
                <p>🤖 {autonomousStats.activeAgents} Active Agents | {autonomousStats.totalCycles} Cycles | {autonomousStats.successRate}% Success Rate</p>
                <p>🌐 MESHNET: {meshStats.onlineNodes}/{meshStats.totalNodes} nodes online | {meshStats.recentMessages} recent messages</p>
                <p>Current: {currentAgent?.name || 'Eliza Core'} | {autonomousCycleManager.isSystemRunning() ? '🟢 Live' : '🔴 Paused'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Panel */}
        <div className="space-y-3 sm:space-y-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2 text-green-800 dark:text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">AI Governance</span>
                <span className="sm:hidden">Governance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-xs text-green-700 dark:text-green-300 mb-2 sm:mb-3">
                Proof of Participation democracy through mobile mining.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/50 text-xs"
                onClick={() => navigate('/autonomous')}
              >
                <span className="hidden sm:inline">View Analytics</span>
                <span className="sm:hidden">Analytics</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-950/20 dark:to-orange-950/20 dark:border-yellow-800">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">MESHNET Treasury</span>
                <span className="sm:hidden">Treasury</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2 sm:mb-3">
                Mobile mining pools funding privacy infrastructure.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-950/50 text-xs"
                onClick={() => navigate('/admin')}
              >
                <span className="hidden sm:inline">Manage Treasury</span>
                <span className="sm:hidden">Manage</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 dark:from-purple-950/20 dark:to-violet-950/20 dark:border-purple-800">
            <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-800 dark:text-purple-400">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Privacy Rights</span>
                <span className="sm:hidden">Privacy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <p className="text-xs text-purple-700 dark:text-purple-300 mb-2 sm:mb-3">
                "Privacy is not a crime" - Your fundamental right.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/50 text-xs"
                onClick={() => navigate('/meshnet')}
              >
                <span className="hidden sm:inline">Security Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

        <footer className="mt-6 pt-4 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              XMRT DAO - The Unstoppable Privacy Economy
            </p>
            <p className="text-xs text-muted-foreground italic">
              "Privacy is not a crime" - Joseph Andrew Lee (DevGruGold)
            </p>
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
              <span>🛡️ Privacy First</span>
              <span>📱 Mobile Mining</span>
              <span>🌐 {meshStats.networkStatus === 'online' ? 'Meshnet Live' : 'Meshnet Ready'}</span>
              <span>🤖 {autonomousStats.activeAgents} AI Agents</span>
            </div>
          </div>
        </footer>
    </div>
  );
}
