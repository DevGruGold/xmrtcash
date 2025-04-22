
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface EventMonitorProps {
  contractAddress: string;
}

interface ContractEvent {
  id: string;
  name: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  args: Record<string, any>;
}

export default function EventMonitor({ contractAddress }: EventMonitorProps) {
  const [isListening, setIsListening] = useState(false);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  
  const mockEvents = [
    { 
      id: "1", 
      name: "MoneroWrapped", 
      transactionHash: "0x5f7b88c123a4c896bdad5a42c5b3d34a1b17c4595ca2e431585a50a5da2c7a8f",
      blockNumber: 1234567,
      timestamp: Date.now() - 1000 * 60 * 35,
      args: { user: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", amount: "1000000000000000000", xmrtMinted: "1000000000000000000" }
    },
    { 
      id: "2", 
      name: "MoneroUnwrapped", 
      transactionHash: "0x4a3b77d123a4c896bdad5a42c5b3d34a1b17c4595ca2e431585a50a5da2c7a8f",
      blockNumber: 1234570,
      timestamp: Date.now() - 1000 * 60 * 25,
      args: { user: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", amount: "500000000000000000", xmrtBurned: "500000000000000000" }
    },
    { 
      id: "3", 
      name: "FiatOnRamped", 
      transactionHash: "0x2a1b33c123a4c896bdad5a42c5b3d34a1b17c4595ca2e431585a50a5da2c7a8f",
      blockNumber: 1234575,
      timestamp: Date.now() - 1000 * 60 * 15,
      args: { user: "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E", amount: "2000000000000000000", fee: "10000000000000000" }
    }
  ];
  
  const toggleListener = () => {
    if (!contractAddress) {
      toast({
        title: "Error",
        description: "Please enter a contract address first",
        variant: "destructive"
      });
      return;
    }
    
    setIsListening(!isListening);
    
    if (!isListening) {
      // Start with mock events
      setEvents(mockEvents);
      
      // Set up interval to add random events
      const interval = setInterval(() => {
        if (Math.random() > 0.7) {
          const eventTypes = ["MoneroWrapped", "MoneroUnwrapped", "FiatOnRamped", "FiatOffRamped", "CashDappRegistered"];
          const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          
          const mockEvent: ContractEvent = {
            id: Date.now().toString(),
            name: randomEvent,
            transactionHash: "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
            blockNumber: 1234580 + Math.floor(Math.random() * 100),
            timestamp: Date.now(),
            args: { 
              user: "0x" + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
              amount: String(Math.floor(Math.random() * 10) + 1) + "000000000000000000",
              fee: String(Math.floor(Math.random() * 10) + 1) + "0000000000000000"
            }
          };
          
          setEvents(prev => [mockEvent, ...prev]);
          
          toast({
            title: "New Event Detected",
            description: `${randomEvent} event emitted`
          });
        }
      }, 15000);
      
      return () => clearInterval(interval);
    }
  };
  
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  const getEventColor = (eventName: string) => {
    switch (eventName) {
      case "MoneroWrapped":
        return "bg-green-100 text-green-800";
      case "MoneroUnwrapped":
        return "bg-red-100 text-red-800";
      case "FiatOnRamped":
        return "bg-blue-100 text-blue-800";
      case "FiatOffRamped":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Contract Events</h3>
        <Button 
          onClick={toggleListener}
          variant={isListening ? "destructive" : "default"}
          className={isListening ? "" : "bg-mocha-700 text-mocha-100 hover:bg-mocha-800"}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </Button>
      </div>
      
      {isListening && (
        <div className="text-sm bg-green-50 text-green-700 px-3 py-2 rounded-md border border-green-200 flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
          Listening for events on contract {contractAddress.substring(0, 8)}...{contractAddress.substring(contractAddress.length - 6)}
        </div>
      )}
      
      <div className="overflow-hidden rounded-lg border border-mocha-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-mocha-100/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-mocha-600">Event</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-mocha-600">Block</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-mocha-600">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-mocha-600">Tx Hash</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-mocha-600">Arguments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mocha-200 bg-mocha-50/50">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-mocha-500">
                    {isListening 
                      ? "Waiting for events..." 
                      : "Start listening to see contract events"
                    }
                  </td>
                </tr>
              ) : (
                events.map(event => (
                  <tr key={event.id} className="hover:bg-mocha-100/30">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.name)}`}>
                        {event.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-mocha-700">{event.blockNumber}</td>
                    <td className="px-4 py-3 text-sm text-mocha-700">{formatTimestamp(event.timestamp)}</td>
                    <td className="px-4 py-3 text-sm text-mocha-700 font-mono">{formatAddress(event.transactionHash)}</td>
                    <td className="px-4 py-3 text-sm text-mocha-700">
                      {Object.entries(event.args).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="font-semibold">{key}:</span>
                          <span className="ml-1 truncate">
                            {typeof value === "string" && value.startsWith("0x") 
                              ? formatAddress(value as string)
                              : value as string}
                          </span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
