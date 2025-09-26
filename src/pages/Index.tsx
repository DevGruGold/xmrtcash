
import ModernHeader from "@/components/ModernHeader";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import BusinessPerformance from "@/components/dashboard/BusinessPerformance";
import MiningDashboard from "@/components/mining/MiningDashboard";

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

      </main>
    </div>
  );
}
