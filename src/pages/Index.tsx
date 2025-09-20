
import ModernHeader from "@/components/ModernHeader";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import BusinessPerformance from "@/components/dashboard/BusinessPerformance";
import ActiveProposals from "@/components/dashboard/ActiveProposals";
import MiningDashboard from "@/components/mining/MiningDashboard";
import LiveActivityFeed from "@/components/ecosystem/LiveActivityFeed";
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

        {/* Mining & Activity Feed Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Live Mining Dashboard - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 order-1">
            <div className="glass-card p-3 sm:p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="flex items-center gap-2">
                  <div className="status-indicator bg-primary animate-pulse" />
                  <h2 className="text-lg sm:text-xl font-semibold">SupportXMR Live Mining</h2>
                </div>
                <div className="text-xs text-muted-foreground sm:ml-auto font-mono">
                  46Ux...C5mg
                </div>
              </div>
              <MiningDashboard />
            </div>
          </div>
          
          {/* Live Activity Feed - Full width on mobile, 1/3 on desktop */}
          <div className="lg:col-span-1 order-2 lg:order-3">
            <LiveActivityFeed className="min-h-[400px] lg:h-full" />
          </div>
        </div>

        {/* Active Proposals - Full Width */}
        <div className="w-full">
          <ActiveProposals />
        </div>
      </main>
    </div>
  );
}
