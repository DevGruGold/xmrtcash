
import { useState } from "react";
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FunctionTester from "@/components/testing/FunctionTester";
import TestRunner from "@/components/testing/TestRunner";
import EventMonitor from "@/components/testing/EventMonitor";

export default function TestingPage() {
  const [contractAddress, setContractAddress] = useState("");
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mocha-900 via-mocha-700 to-mocha-500">
      <MochaSidebar />
      <main className="flex-1 flex flex-col">
        <MochaHeader />
        <section className="flex-1 p-4">
          <div className="w-full max-w-7xl mx-auto bg-mocha-100/40 rounded-xl shadow-xl p-6 backdrop-blur-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-mocha text-mocha-800">Contract Testing</h2>
              <div className="mt-2 md:mt-0">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-mocha-600">Contract Address:</span>
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="Enter contract address"
                    className="px-3 py-1 border border-mocha-300 rounded bg-mocha-100/80 text-sm"
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
        </section>
      </main>
    </div>
  );
}
