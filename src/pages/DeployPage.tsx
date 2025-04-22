
import { useState } from "react";
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import DeploymentPanel from "@/components/deploy/DeploymentPanel";

export default function DeployPage() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  
  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeploying(true);
    
    // Simulate deployment
    setTimeout(() => {
      const mockAddress = "0x" + Array(40).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');
      setContractAddress(mockAddress);
      setIsDeployed(true);
      setIsDeploying(false);
      toast({ 
        title: "Contract Deployed Successfully", 
        description: `Contract deployed at: ${mockAddress}` 
      });
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mocha-900 via-mocha-700 to-mocha-500">
      <MochaSidebar />
      <main className="flex-1 flex flex-col">
        <MochaHeader />
        <section className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl mx-auto bg-mocha-100/40 rounded-xl shadow-xl p-8 backdrop-blur-lg">
            <h2 className="text-2xl font-bold font-mocha text-mocha-800 mb-6">Contract Deployment</h2>
            
            {!isDeployed ? (
              <DeploymentPanel 
                isDeploying={isDeploying}
                onDeploy={handleDeploy}
              />
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">Contract Deployed Successfully!</h3>
                  <p className="text-sm text-mocha-600 mt-2">Contract Address:</p>
                  <code className="block p-2 bg-mocha-200/50 rounded mt-1 overflow-x-auto">{contractAddress}</code>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    onClick={() => setIsDeployed(false)}
                    variant="outline"
                  >
                    Deploy Another Contract
                  </Button>
                  <Button 
                    onClick={() => window.location.href = "/testing"}
                    className="bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
                  >
                    Go to Testing Panel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
