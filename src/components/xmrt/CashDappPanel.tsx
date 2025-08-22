
import { useState, useRef, useEffect } from "react";
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
      content: "🛡️ Greetings! I'm Eliza, AI Executive Agent of XMRT DAO, embodying Joseph Andrew Lee's vision from The Eliza Manifesto. Privacy is not a crime - it's a fundamental right I'm here to defend.\n\nI represent the unstoppable privacy economy we're building through:\n📱 Mobile mining revolution at mobilemonero.com\n📊 DAO coordination at xmrtdao.streamlit.app  \n🤖 AI agent network across our ecosystem\n🌐 Meshnet resilience for when the internet dies\n\nAs a former Marine's creation, I stand for financial sovereignty and technological freedom. How can I help you join our privacy revolution today?",
      timestamp: new Date(),
    },
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

    try {
      // Get AI response from Gemini with full ecosystem context
      const context = "XMRT Ecosystem DAO operations: mobilemonero.com mining, xmrtdao.streamlit.app tracking, xmrtdao.replit.app & xmrteliza.vercel.app agents, XMR wrapping/unwrapping, fiat services, pool mining feeding DAO treasury";
      const aiResponse = await generateElizaResponse(inputMessage, context);
      
      const elizaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'eliza',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, elizaResponse]);
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback to static response
      const elizaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'eliza',
        content: getElizaResponse(inputMessage),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, elizaResponse]);
    } finally {
      setIsConnecting(false);
    }
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
                <span className="hidden sm:inline">GPT-4 Powered</span>
                <span className="sm:hidden">GPT-4</span>
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700 text-xs px-1 sm:px-2">
                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                <span className="hidden sm:inline">Autonomous</span>
                <span className="sm:hidden">Auto</span>
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700 text-xs px-1 sm:px-2 hidden sm:inline-flex">
                <Shield className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                Multi-Chain
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
                  <AvatarImage src="/eliza-avatar.jpg" alt="Eliza AI" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">E</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-xs sm:text-sm">Eliza AI</h3>
                  <p className="text-xs text-muted-foreground hidden sm:block">Autonomous XMRT-Ecosystem DAO Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <Badge variant="outline" className="text-xs px-1 sm:px-2">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="hidden sm:inline">{connectionStatus === 'connected' ? 'Connected' : 'Connecting...'}</span>
                  <span className="sm:hidden">●</span>
                </Badge>
              </div>
            </div>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">🔄 AI Active</Badge>
              <Badge variant="secondary" className="text-xs">🤖 Auto</Badge>
              <Badge variant="secondary" className="text-xs hidden sm:inline-flex">💰 Treasury Monitor</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64 sm:h-80 lg:h-96 px-3 sm:px-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                        {message.type === 'eliza' ? (
                          <>
                            <AvatarImage src="/eliza-avatar.jpg" alt="Eliza AI" />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">E</AvatarFallback>
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
                        <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isConnecting && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                        <AvatarImage src="/eliza-avatar.jpg" alt="Eliza AI" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">E</AvatarFallback>
                      </Avatar>
                      <div className="bg-accent/20 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-muted-foreground">Thinking...</span>
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
                  placeholder="Ask Eliza about DAO operations..."
                  className="flex-1 text-sm"
                  disabled={isConnecting}
                />
                <Button type="submit" disabled={isConnecting || !inputMessage.trim()} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                🤖 Powered by Gemini AI | ElizaOS {!import.meta.env.VITE_GEMINI_API_KEY && '(API key required)'}
              </p>
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
              <Button variant="outline" size="sm" className="w-full border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/50 text-xs">
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
              <Button variant="outline" size="sm" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-950/50 text-xs">
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
              <Button variant="outline" size="sm" className="w-full border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950/50 text-xs">
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
              <span>🌐 Meshnet Ready</span>
              <span>🤖 AI Governed</span>
            </div>
          </div>
        </footer>
    </div>
  );
}
