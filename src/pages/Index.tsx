
import ModernHeader from "@/components/ModernHeader";
import BlockchainActivity from "@/components/dashboard/BlockchainActivity";
import BusinessPerformance from "@/components/dashboard/BusinessPerformance";
import ActiveProposals from "@/components/dashboard/ActiveProposals";
import FloatingChatWidget from "@/components/FloatingChatWidget";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      
      <main className="container max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Dashboard Grid */}
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

        {/* Active Proposals - Full Width */}
        <div className="w-full">
          <ActiveProposals />
        </div>
      </main>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
}
