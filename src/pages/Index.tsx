
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
      
      <main className="container max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
          {/* Blockchain Activity */}
          <div className="h-full">
            <BlockchainActivity />
          </div>
          
          {/* Business Performance */}
          <div className="h-full">
            <BusinessPerformance />
          </div>
        </div>

        {/* Mining & Activity Feed Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Mining Dashboard - Takes 2/3 width on XL screens */}
          <div className="xl:col-span-2">
            <div className="glass-card p-6 h-full">
              <div className="flex items-center gap-2 mb-6">
                <div className="status-indicator bg-primary animate-pulse" />
                <h2 className="text-xl font-semibold">SupportXMR Live Mining</h2>
                <div className="ml-auto text-xs text-muted-foreground">
                  Wallet: 46Ux...C5mg
                </div>
              </div>
              <MiningDashboard />
            </div>
          </div>
          
          {/* Live Activity Feed - Takes 1/3 width on XL screens */}
          <div className="xl:col-span-1">
            <LiveActivityFeed className="h-full" />
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
