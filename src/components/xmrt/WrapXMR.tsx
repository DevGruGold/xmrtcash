import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Shield, Info } from "lucide-react";

export default function WrapXMR() {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWrap = async (e: React.FormEvent) => {
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
        title: "Wrap Successful!", 
        description: `Successfully wrapped ${amount} XMR into XMRT tokens.` 
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
            <ArrowRight className="w-5 h-5 text-primary" />
            Wrap XMR to XMRT
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Convert your Monero (XMR) into wrapped XMRT tokens
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleWrap} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground font-medium">
                Amount (XMR)
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
                  <span>Network Fee:</span>
                  <span>~0.001 XMR</span>
                </div>
                <div className="flex justify-between">
                  <span>You'll receive:</span>
                  <span>{amount ? `${amount} XMRT` : '0 XMRT'}</span>
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
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Wrap XMR
                </>
              )}
            </Button>
          </form>
          
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Security Notice</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Your XMR will be securely held in a multi-signature smart contract. 
              This process is fully reversible through the unwrap function.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}