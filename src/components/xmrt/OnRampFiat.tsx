import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, CreditCard, Shield, Info } from "lucide-react";

export default function OnRampFiat() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOnRamp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ 
        title: "Invalid amount", 
        description: "Please enter a valid amount.",
        variant: "destructive"
      });
      return;
    }
    
    if (!paymentMethod) {
      toast({ 
        title: "Payment method required", 
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      toast({ 
        title: "Purchase Successful!", 
        description: `Successfully purchased ${(Number(amount) * 0.995).toFixed(2)} ${currency} worth of XMRT.` 
      });
      setAmount("");
      setPaymentMethod("");
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
            <LogIn className="w-5 h-5 text-primary" />
            Buy Crypto (Fiat OnRamp)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Purchase XMRT tokens with fiat currency
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleOnRamp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground font-medium">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  step="any"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="100"
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
              <Label className="text-foreground font-medium">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="bg-card border-border text-foreground">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="apple">Apple Pay</SelectItem>
                  <SelectItem value="google">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {amount && (
              <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-foreground font-medium">Purchase Summary</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{amount} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee (0.5%):</span>
                    <span>{fee.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>You'll receive:</span>
                    <span>{youReceive.toFixed(2)} {currency} worth of XMRT</span>
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
                <>Processing Payment...</>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Purchase XMRT
                </>
              )}
            </Button>
          </form>
          
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">Secure Payment</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              All payments are processed securely through our verified payment partners. 
              Your financial information is protected with bank-level encryption.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}