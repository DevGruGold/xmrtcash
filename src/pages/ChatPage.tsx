import ModernHeader from "@/components/ModernHeader";
import ElizaChatbot from "@/components/ElizaChatbot";
import { MessageCircle, Bot, Zap, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const chatFeatures = [
  {
    icon: Bot,
    title: "AI Agent Network",
    description: "Multiple specialized AI agents for different ecosystem functions"
  },
  {
    icon: Zap,
    title: "Real-time Data",
    description: "Live mining statistics, market data, and governance updates"
  },
  {
    icon: Users,
    title: "Community Support", 
    description: "Get help from the XMRT DAO community and core team"
  }
];

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      
      <main className="container max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Chat Interface */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">AI Chat Hub</h1>
                  <p className="text-muted-foreground">Interactive AI assistance for the XMRT ecosystem</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <ElizaChatbot className="h-full max-w-none" />
            </div>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  Chat Features
                </CardTitle>
                <CardDescription>
                  Powered by advanced AI agents specialized for privacy, mining, and DeFi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chatFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Agent Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Eliza Core</span>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mining Oracle</span>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">DAO Governance</span>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}