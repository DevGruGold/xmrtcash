import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Shield, Info } from "lucide-react";

export default function UnwrapXMR() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleUnwrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ 
        title: "Invalid amount", 
        description: "Enter a positive number.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      toast({ 
        title: "Unwrap Successful!", 
        description: `Successfully unwrapped ${amount} XMRT back to XMR.` 
      });
      setAmount("");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-card shadow-neon">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <ArrowLeft className="w-5 h-5 text-primary" />
            Unwrap XMRT to XMR
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Convert your XMRT tokens back to native Monero (XMR)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleUnwrap} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground font-medium">
                Amount (XMRT)
              </Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="e.g. 1.0"
                required
                className="bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">Transaction Details</span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Burn Fee:</span>
                  <span>~0.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>You'll receive:</span>
                  <span>{amount ? `${(Number(amount) * 0.999).toFixed(6)} XMR` : '0 XMR'}</span>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full neon-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Unwrap XMRT
                </>
              )}
            </Button>
          </form>
          
          <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-destructive" />
              <span className="text-foreground font-medium">Important Notice</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Unwrapping will permanently burn your XMRT tokens and release the equivalent XMR 
              from the smart contract. This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}