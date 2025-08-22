
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import EcosystemCapabilities from "@/components/ecosystem/EcosystemCapabilities";
import MiningDashboard from "@/components/mining/MiningDashboard";
import WorkerLeaderboard from "@/components/mining/WorkerLeaderboard";
import DAOLeaderboard from "@/components/dao/DAOLeaderboard";
import ElizaChatbot from "@/components/ElizaChatbot";
import { Globe } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col lg:flex-row">
        <MochaSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <MochaHeader />
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 space-y-6 pb-20 overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-8 w-full">
              {/* Hero Section with Eliza */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4 min-w-0">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-float flex-shrink-0">
                      <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold gradient-text text-center lg:text-left">
                      XMRT Ecosystem
                    </h1>
                  </div>
                  <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl text-center lg:text-left">
                    Decentralized mobile mining, mesh networking, and privacy-first DeFi platform with real-time data powered by Gemini AI
                  </p>
                </div>
                
                <div className="lg:col-span-1 w-full min-w-0">
                  <div className="w-full max-w-md mx-auto lg:max-w-none">
                    <ElizaChatbot className="w-full" />
                  </div>
                </div>
              </div>

              {/* Mining Dashboard Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Real Mining Data</h2>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                    Live statistics from SupportXMR pool and P2Pool networks
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Mining Dashboard */}
                  <div className="lg:col-span-2 min-w-0">
                    <MiningDashboard />
                  </div>
                  
                  {/* Worker Leaderboard */}
                  <div className="lg:col-span-1 min-w-0">
                    <WorkerLeaderboard />
                  </div>
                </div>
              </div>
              
              {/* DAO Leaderboard Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Mobile Mining Leaderboard</h2>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                    XMRT DAO contributors and mobile mining champions
                  </p>
                </div>
                <div className="min-w-0">
                  <DAOLeaderboard />
                </div>
              </div>

              {/* Capabilities */}
              <div className="min-w-0">
                <EcosystemCapabilities />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
