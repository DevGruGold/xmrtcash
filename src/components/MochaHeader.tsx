
import { User, Code } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function MochaHeader() {
  const [network, setNetwork] = useState("Localhost");
  const [account, setAccount] = useState("Guest");
  
  const connectWallet = () => {
    const randomAddress = "0x" + Array(40).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)).join('');
    setAccount(randomAddress.substring(0, 6) + "..." + randomAddress.substring(38));
    toast({ 
      title: "Wallet Connected", 
      description: "Connected to MetaMask wallet" 
    });
  };
  
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-mocha-800/60 shadow rounded-xl mb-8 mx-2">
      <h1 className="font-mocha text-3xl text-mocha-100 tracking-wide">XMRT Portal</h1>
      <div className="flex items-center gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 py-1 px-3 rounded-md bg-mocha-700/40 hover:bg-mocha-700/60 text-mocha-200 text-sm border border-mocha-600/40">
              <Code className="w-4 h-4" />
              <span>{network}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end">
            <div className="py-1 bg-mocha-100">
              {["Localhost", "Goerli Testnet", "Sepolia Testnet", "Mainnet"].map((net) => (
                <button
                  key={net}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-mocha-200/50 ${net === network ? "font-semibold bg-mocha-200/30" : ""}`}
                  onClick={() => {
                    setNetwork(net);
                    toast({ title: "Network Changed", description: `Connected to ${net}` });
                  }}
                >
                  {net}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        {account === "Guest" ? (
          <button
            onClick={connectWallet}
            className="flex items-center gap-2 py-1 px-3 rounded-md bg-mocha-600 hover:bg-mocha-700 text-mocha-100 text-sm"
          >
            <User className="w-4 h-4" />
            Connect Wallet
          </button>
        ) : (
          <span className="flex items-center gap-1 text-mocha-200 text-base">
            <User className="w-5 h-5" />
            <span>{account}</span>
          </span>
        )}
      </div>
    </header>
  );
}
