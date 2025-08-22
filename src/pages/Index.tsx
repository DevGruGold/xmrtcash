
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
      <div className="lg:flex">
        <MochaSidebar />
        
        <div className="flex-1 lg:ml-0">
          <MochaHeader />
          
          <main className="p-3 sm:p-4 lg:p-6 space-y-6 pb-20">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Hero Section with Eliza */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-float">
                      <Globe className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold gradient-text">XMRT Ecosystem</h1>
                  </div>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
                    Decentralized mobile mining, mesh networking, and privacy-first DeFi platform with real-time data powered by Gemini AI
                  </p>
                </div>
                
                <div className="lg:col-span-1">
                  <ElizaChatbot className="w-full" />
                </div>
              </div>

              {/* Mining Dashboard Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight">Real Mining Data</h2>
                  <p className="text-muted-foreground mt-2">
                    Live statistics from SupportXMR pool and P2Pool networks
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Mining Dashboard */}
                  <div className="lg:col-span-2">
                    <MiningDashboard />
                  </div>
                  
                  {/* Worker Leaderboard */}
                  <div className="lg:col-span-1">
                    <WorkerLeaderboard />
                  </div>
                </div>
              </div>
              
              {/* DAO Leaderboard Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight">Mobile Mining Leaderboard</h2>
                  <p className="text-muted-foreground mt-2">
                    XMRT DAO contributors and mobile mining champions
                  </p>
                </div>
                <DAOLeaderboard />
              </div>

              {/* Capabilities */}
              <EcosystemCapabilities />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
