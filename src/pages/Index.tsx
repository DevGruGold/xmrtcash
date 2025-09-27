
import ModernHeader from "@/components/ModernHeader";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import BusinessPerformance from "@/components/dashboard/BusinessPerformance";
import MiningDashboard from "@/components/mining/MiningDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import EnhancedElizaChatbot from '@/components/multimodal/EnhancedElizaChatbot';

import HeroSection from "@/components/hero/HeroSection";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      
      {/* Hero Section with Integrated Chatbot */}
      <HeroSection />
      
      <main className="container max-w-screen-2xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        {/* Main Dashboard Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Blockchain Activity - Mobile optimized height */}
          <div className="min-h-[400px] lg:h-[500px]">
            <BlockchainActivity />
          </div>
          
          {/* Business Performance - Mobile optimized height */}
          <div className="min-h-[400px] lg:h-[500px]">
            <BusinessPerformance />
          </div>
        </div>

        {/* AI Assistant Chat - Bottom of page */}
        <div className="mt-8">
          <Card className="glass-card h-[600px] shadow-lg">
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
            <CardContent className="p-0 flex-1 min-h-0">
              <div className="h-full border-t border-border/50">
                <EnhancedElizaChatbot className="h-full border-0 bg-transparent" hideHeader={true} />
              </div>
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}
