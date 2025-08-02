import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, CreditCard, Shield, Info } from "lucide-react";

export default function OffRampFiat() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [withdrawMethod, setWithdrawMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOffRamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ 
        title: "Invalid amount", 
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }
    
    if (!withdrawMethod) {
      toast({ 
        title: "Withdrawal method required", 
        description: "Please select a withdrawal method.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      toast({ 
        title: "Withdrawal Successful!", 
        description: `Successfully sold ${amount} XMRT for ${(Number(amount) * 0.995).toFixed(2)} ${currency}.` 
      });
      setAmount("");
      setWithdrawMethod("");
      setIsLoading(false);
    }, 3000);
  };

  const fee = Number(amount) * 0.005; // 0.5% fee
  const youReceive = Number(amount) - fee;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="glass-card shadow-neon">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5 text-primary" />
            Sell Crypto (Fiat OffRamp)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Convert your XMRT tokens to fiat currency
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleOffRamp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground font-medium">
                  Amount (XMRT)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="50"
                  required
                  className="bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Withdrawal Method</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Select withdrawal method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="crypto">Other Crypto</SelectItem>
                  <SelectItem value="card">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {amount && (
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">Withdrawal Summary</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>XMRT Amount:</span>
                    <span>{amount} XMRT</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (0.5%):</span>
                    <span>{fee.toFixed(6)} XMRT</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You'll receive:</span>
                    <span>{youReceive.toFixed(2)} {currency}</span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full neon-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Processing Withdrawal...</>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Sell XMRT
                </>
              )}
            </Button>
          </form>
          
          <div className="bg-warning/10 rounded-lg p-3 border border-warning/20">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-warning" />
              <span className="text-foreground font-medium">Processing Time</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Bank transfers typically take 1-3 business days. PayPal and card withdrawals 
              are usually processed within 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}