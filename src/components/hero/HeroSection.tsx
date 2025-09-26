import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Users, 
  MessageCircle, 
  ArrowRight,
  Globe,
  Zap
} from 'lucide-react';
import EnhancedElizaChatbot from '@/components/multimodal/EnhancedElizaChatbot';
import LiveMiningStats from '@/components/hero/LiveMiningStats';

export default function HeroSection() {
  return (
    <section className="relative py-8 sm:py-12 lg:py-20 overflow-hidden">
      {/* Background Effects - Adjusted positioning to avoid chat interference */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-5 left-5 sm:top-10 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-5 left-5 sm:bottom-10 sm:left-10 w-64 h-64 sm:w-96 sm:h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-20">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 items-start">
          
          {/* Hero Content - Always First on Mobile */}
          <div className="w-full lg:col-span-2 space-y-6 sm:space-y-8 relative order-1">
            {/* Main Hero Text */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <Badge variant="outline" className="text-xs border-primary/50 bg-primary/10 text-primary">
                  <Zap className="w-3 h-3 mr-1" />
                  Live on Testnet
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Decentralized
                </Badge>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                <span className="gradient-text">XMRT DAO</span>
                <br />
                <span className="text-foreground">Privacy-First</span>
                <br />
                <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                  Mining Collective
                </span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Join the world's first privacy-focused mining DAO. Powered by Monero, governed by the community, 
                secured by autonomous agents, and connected through MESHNET infrastructure.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="neon-button group w-full sm:w-auto">
                  Connect Wallet
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary/30 w-full sm:w-auto"
                  onClick={() => window.open('https://xmrt.vercel.app', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Learn More
                </Button>
              </div>
            </div>

            {/* Live Mining Stats - Real-time SupportXMR Data */}
            <LiveMiningStats />

            {/* Key Features - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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

          {/* Chatbot - Second on Mobile */}
          <div className="w-full lg:col-span-1 relative z-30 order-2">
            <Card className="glass-card h-[500px] sm:h-[600px] lg:h-[700px] shadow-lg">
              <CardHeader className="pb-3 relative z-40">
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
              <CardContent className="p-0 h-[calc(100%-120px)] relative z-40">
                <div className="h-full border-t border-border/50">
                  <EnhancedElizaChatbot className="h-full border-0 bg-transparent" />
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </section>
  );
}