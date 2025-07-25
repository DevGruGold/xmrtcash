
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
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
  Sparkles
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'eliza';
  content: string;
  timestamp: Date;
}

export default function CashDappPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'eliza',
      content: "Hello! I'm Eliza, your autonomous AI assistant for the XMRT-Ecosystem DAO. I can help you with governance decisions, treasury management, community queries, and much more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsConnecting(true);

    // Simulate AI response
    setTimeout(() => {
      const elizaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'eliza',
        content: getElizaResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, elizaResponse]);
      setIsConnecting(false);
    }, 1500);
  };

  const getElizaResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('governance') || input.includes('proposal') || input.includes('vote')) {
      return "I can help you with governance operations! Current active proposals: 3. Latest: 'Treasury Diversification Strategy' - 87% approval. Would you like me to analyze the proposals or help you vote?";
    }
    
    if (input.includes('treasury') || input.includes('balance') || input.includes('funds')) {
      return "Treasury Status: $2.4M total value locked. Asset allocation: 45% XMR, 30% ETH, 15% BTC, 10% stablecoins. 24h performance: +3.2%. Current yield farming APY: 12.4%. Need analysis or rebalancing recommendations?";
    }
    
    if (input.includes('security') || input.includes('audit') || input.includes('threat')) {
      return "Security systems operational. Last security scan: 2 hours ago - No threats detected. Smart contract audit score: 98/100. All emergency protocols ready. Recent activity: Normal transaction patterns detected.";
    }
    
    if (input.includes('community') || input.includes('member') || input.includes('dao')) {
      return "DAO Community Analytics: 1,247 active members, 89% participation rate this quarter. Top contributor rewards distributed. Community sentiment: Positive (8.4/10). New member onboarding: 23 this week.";
    }
    
    return "I understand you're interested in DAO operations. I can assist with: Governance analysis, Treasury optimization, Security monitoring, Community management, Proposal creation, and Automated task execution. What specific area would you like to explore?";
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">XMRT-Ecosystem Eliza AI</CardTitle>
                <p className="text-sm text-muted-foreground">Autonomous DAO Management & Intelligence System</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <Activity className="w-3 h-3 mr-1" />
                GPT-4 Powered
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                <Sparkles className="w-3 h-3 mr-1" />
                Autonomous Mode
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                <Shield className="w-3 h-3 mr-1" />
                Multi-Chain
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/eliza-avatar.jpg" alt="Eliza AI" />
                  <AvatarFallback className="bg-primary text-primary-foreground">E</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-sm">Eliza AI</h3>
                  <p className="text-xs text-muted-foreground">Autonomous XMRT-Ecosystem DAO Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <div className={`w-2 h-2 rounded-full mr-1 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  {connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">🔄 Gemini AI Active</Badge>
              <Badge variant="secondary" className="text-xs">🤖 Autonomous Mode</Badge>
              <Badge variant="secondary" className="text-xs">💰 Treasury Monitor</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96 px-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        {message.type === 'eliza' ? (
                          <>
                            <AvatarImage src="/eliza-avatar.jpg" alt="Eliza AI" />
                            <AvatarFallback className="bg-primary text-primary-foreground">E</AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback className="bg-muted">U</AvatarFallback>
                        )}
                      </Avatar>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : 'bg-accent/20 text-foreground'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isConnecting && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/eliza-avatar.jpg" alt="Eliza AI" />
                        <AvatarFallback className="bg-primary text-primary-foreground">E</AvatarFallback>
                      </Avatar>
                      <div className="bg-accent/20 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-muted-foreground">Eliza is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <div className="p-4 border-t border-border/50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Eliza about governance, treasury, analytics, or any DAO operations..."
                  className="flex-1"
                  disabled={isConnecting}
                />
                <Button type="submit" disabled={isConnecting || !inputMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                🤖 Powered by Google Gemini AI | Autonomous ElizaOS
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Panel */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                <TrendingUp className="w-4 h-4" />
                Autonomous Governance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-700 mb-3">
                AI-powered proposal analysis, voting recommendations, and autonomous execution with 94% accuracy.
              </p>
              <Button variant="outline" size="sm" className="w-full border-green-300 text-green-700 hover:bg-green-100">
                View Analytics <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-yellow-800">
                <Zap className="w-4 h-4" />
                Treasury Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-yellow-700 mb-3">
                Cross-chain asset optimization, yield farming strategies, and real-time portfolio rebalancing.
              </p>
              <Button variant="outline" size="sm" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                Manage Treasury <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-purple-800">
                <Shield className="w-4 h-4" />
                Security Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-purple-700 mb-3">
                24/7 threat detection, emergency response protocols, and smart contract security analysis.
              </p>
              <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100">
                Security Dashboard <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>🤖 Powered by XMRT-Ecosystem Autonomous ElizaOS</span>
              <span>|</span>
              <a 
                href="https://github.com/DevGruGold/XMRT-Ecosystem" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View on GitHub
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span>Ready for GPT-5 Integration</span>
              <span>|</span>
              <span>Multi-Agent Architecture</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
