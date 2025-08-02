import { useState } from "react";
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FunctionTester from "@/components/testing/FunctionTester";
import TestRunner from "@/components/testing/TestRunner";
import EventMonitor from "@/components/testing/EventMonitor";

export default function TestingPage() {
  const [contractAddress, setContractAddress] = useState("");
  
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex">
        <MochaSidebar />
        
        <div className="flex-1 lg:ml-0">
          <MochaHeader />
          
          <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Contract Testing</h1>
                  <p className="text-muted-foreground mt-2">Test and monitor smart contract functions</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm text-muted-foreground">Contract Address:</Label>
                    <Input
                      type="text"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="Enter contract address"
                      className="w-64 bg-card border-border text-foreground"
                    />
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="functions" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="functions">Contract Functions</TabsTrigger>
                  <TabsTrigger value="tests">Test Suites</TabsTrigger>
                  <TabsTrigger value="events">Event Monitor</TabsTrigger>
                </TabsList>
                
                <TabsContent value="functions">
                  <FunctionTester contractAddress={contractAddress} />
                </TabsContent>
                
                <TabsContent value="tests">
                  <TestRunner contractAddress={contractAddress} />
                </TabsContent>
                
                <TabsContent value="events">
                  <EventMonitor contractAddress={contractAddress} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}