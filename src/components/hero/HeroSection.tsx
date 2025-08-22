import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  MessageCircle, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Globe
} from 'lucide-react';
import ElizaChatbot from '@/components/ElizaChatbot';

export default function HeroSection() {
  return (
    <section className="relative py-12 lg:py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12 items-start">
          
          {/* Left Side - Hero Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Main Hero Text */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="neon-border animate-pulse">
                  <Zap className="w-3 h-3 mr-1" />
                  Live on Testnet
                </Badge>
                <Badge variant="secondary">
                  <Globe className="w-3 h-3 mr-1" />
                  Decentralized
                </Badge>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="gradient-text">XMRT DAO</span>
                <br />
                <span className="text-foreground">Privacy-First</span>
                <br />
                <span className="text-muted-foreground text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
                  Mining Collective
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Join the world's first privacy-focused mining DAO. Powered by Monero, governed by the community, 
                secured by autonomous agents, and connected through MESHNET infrastructure.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="neon-button group">
                  Connect Wallet
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/30">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="glass-card text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">4,828</div>
                  <div className="text-xs text-muted-foreground">Active Miners</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">1.1 GH/s</div>
                  <div className="text-xs text-muted-foreground">Pool Hashrate</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">463K</div>
                  <div className="text-xs text-muted-foreground">Blocks Found</div>
                </CardContent>
              </Card>
              
              <Card className="glass-card text-center">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">98.5%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </CardContent>
              </Card>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Privacy-First</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Built on Monero's privacy technology. Your mining activity and rewards remain completely private.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">DAO Governed</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Community-driven decisions through transparent governance. Every miner has a voice in the future.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">MESHNET Ready</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Integrated mesh networking for decentralized communication and resilient mining operations.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Integrated Chatbot */}
          <div className="xl:col-span-1">
            <Card className="glass-card h-[600px] lg:h-[700px]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Eliza AI Assistant</CardTitle>
                      <CardDescription className="text-sm">
                        Ask about mining, DAO governance, or technical questions
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <span className="w-2 h-2 bg-primary rounded-full mr-1 animate-pulse" />
                    Online
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-120px)]">
                <div className="h-full border-t border-border/50">
                  <ElizaChatbot className="h-full border-0 bg-transparent" />
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </section>
  );
}