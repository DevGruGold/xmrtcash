
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FunctionTesterProps {
  contractAddress: string;
}

export default function FunctionTester({ contractAddress }: FunctionTesterProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  const handleFunctionCall = (functionName: string, args: any[] = []) => {
    if (!contractAddress) {
      toast({
        title: "Error",
        description: "Please enter a contract address first",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(functionName);
    setResult(null);
    
    // Simulate function call
    setTimeout(() => {
      let mockResult;
      
      switch (functionName) {
        case "wrapMonero":
          mockResult = "Transaction hash: 0x" + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case "unwrapMonero":
          mockResult = "Transaction hash: 0x" + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case "registerCashDapp":
          mockResult = "Transaction hash: 0x" + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case "onRampFiat":
          mockResult = "Transaction hash: 0x" + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case "offRampFiat":
          mockResult = "Transaction hash: 0x" + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)).join('');
          break;
        case "totalSupply":
          mockResult = "21000000000000000000000000"; // 21M with 18 decimals
          break;
        case "totalWrappedMonero":
          mockResult = String(Math.floor(Math.random() * 1000000)) + "000000000000000000"; // Random amount with 18 decimals
          break;
        default:
          mockResult = "Success";
      }
      
      setResult(mockResult);
      setLoading(null);
      
      toast({
        title: "Function called successfully",
        description: `${functionName} executed`
      });
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="wrap-unwrap">
          <AccordionTrigger className="text-lg font-semibold">Wrap/Unwrap Functions</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-6 p-4">
              <div className="bg-mocha-50/80 p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-3">Wrap Monero</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="wrapAmount">Amount</Label>
                    <Input id="wrapAmount" type="number" placeholder="XMR amount" min="0" step="0.01" />
                  </div>
                  <Button 
                    onClick={() => handleFunctionCall("wrapMonero", [100])}
                    className="w-full bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
                    disabled={loading === "wrapMonero"}
                  >
                    {loading === "wrapMonero" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Wrap Monero
                  </Button>
                </div>
              </div>
              
              <div className="bg-mocha-50/80 p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-3">Unwrap Monero</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="unwrapAmount">Amount</Label>
                    <Input id="unwrapAmount" type="number" placeholder="XMRT amount" min="0" step="0.01" />
                  </div>
                  <Button 
                    onClick={() => handleFunctionCall("unwrapMonero", [100])}
                    className="w-full bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
                    disabled={loading === "unwrapMonero"}
                  >
                    {loading === "unwrapMonero" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Unwrap XMRT
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="fiat">
          <AccordionTrigger className="text-lg font-semibold">Fiat On/Off Ramp</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-2 gap-6 p-4">
              <div className="bg-mocha-50/80 p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-3">On-Ramp Fiat</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="onRampAmount">Fiat Amount</Label>
                    <Input id="onRampAmount" type="number" placeholder="USD amount" min="0" step="0.01" />
                  </div>
                  <Button 
                    onClick={() => handleFunctionCall("onRampFiat", [1000])}
                    className="w-full bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
                    disabled={loading === "onRampFiat"}
                  >
                    {loading === "onRampFiat" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    On-Ramp Fiat
                  </Button>
                </div>
              </div>
              
              <div className="bg-mocha-50/80 p-4 rounded-lg shadow-sm">
                <h3 className="font-medium mb-3">Off-Ramp Fiat</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="offRampAmount">XMRT Amount</Label>
                    <Input id="offRampAmount" type="number" placeholder="XMRT amount" min="0" step="0.01" />
                  </div>
                  <Button 
                    onClick={() => handleFunctionCall("offRampFiat", [1000])}
                    className="w-full bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
                    disabled={loading === "offRampFiat"}
                  >
                    {loading === "offRampFiat" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Off-Ramp XMRT
                  </Button>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="read">
          <AccordionTrigger className="text-lg font-semibold">Read Contract State</AccordionTrigger>
          <AccordionContent>
            <div className="grid md:grid-cols-3 gap-4 p-4">
              <Button 
                onClick={() => handleFunctionCall("totalSupply")}
                variant="outline"
                className="bg-mocha-50 border-mocha-200"
                disabled={loading === "totalSupply"}
              >
                {loading === "totalSupply" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Total Supply
              </Button>
              
              <Button 
                onClick={() => handleFunctionCall("totalWrappedMonero")}
                variant="outline"
                className="bg-mocha-50 border-mocha-200"
                disabled={loading === "totalWrappedMonero"}
              >
                {loading === "totalWrappedMonero" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Total Wrapped Monero
              </Button>
              
              <Button 
                onClick={() => handleFunctionCall("quorumPercentage")}
                variant="outline"
                className="bg-mocha-50 border-mocha-200"
                disabled={loading === "quorumPercentage"}
              >
                {loading === "quorumPercentage" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Quorum Percentage
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {result && (
        <div className="mt-6 p-4 bg-mocha-50/80 border border-mocha-200 rounded-md">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-mocha-100/50 p-3 rounded overflow-x-auto text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
}
