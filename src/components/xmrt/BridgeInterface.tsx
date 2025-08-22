import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowUpDown, 
  ArrowRight, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Zap,
  Layers,
  DollarSign,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BridgeInterface() {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("XMR");
  const [toToken, setToToken] = useState("XMRT");
  const [bridgeStatus, setBridgeStatus] = useState("ready");
  const { toast } = useToast();

  // Mock exchange rate
  const exchangeRate = 1.0; // 1 XMR = 1 XMRT
  const bridgeFee = 0.001; // 0.1% fee

  const handleSwap = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const calculateToAmount = (amount: string) => {
    if (!amount || isNaN(Number(amount))) return "0";
    const numAmount = Number(amount);
    const afterFee = numAmount * (1 - bridgeFee);
    return (afterFee * exchangeRate).toFixed(6);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    setToAmount(calculateToAmount(value));
  };

  const executeBridge = () => {
    if (!fromAmount || Number(fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to bridge",
        variant: "destructive"
      });
      return;
    }

    setBridgeStatus("processing");
    
    // Simulate bridge transaction
    setTimeout(() => {
      setBridgeStatus("success");
      toast({
        title: "Bridge Transaction Initiated",
        description: `Bridging ${fromAmount} ${fromToken} to ${toAmount} ${toToken}`,
      });
      
      setTimeout(() => {
        setBridgeStatus("ready");
        setFromAmount("");
        setToAmount("");
      }, 3000);
    }, 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon">
              <Layers className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="gradient-text">XMRT Bridge</CardTitle>
              <CardDescription>Cross-chain bridging powered by LayerZero</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Bridge Interface */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Bridge Assets</CardTitle>
            <Badge variant="outline" className="neon-border bg-primary/10 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              LayerZero Secured
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* From Token */}
          <div className="space-y-2">
            <Label htmlFor="from-amount">From</Label>
            <div className="flex items-center gap-2">
              <Card className="flex-1 p-4 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">X</span>
                    </div>
                    <span className="font-medium">{fromToken}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Balance: 0.00000000</span>
                </div>
                <Input
                  id="from-amount"
                  type="number"
                  placeholder="0.000000"
                  value={fromAmount}
                  onChange={(e) => handleFromAmountChange(e.target.value)}
                  className="border-0 bg-transparent text-lg font-mono p-0 h-8"
                />
              </Card>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSwap}
              className="border-primary/20 hover:bg-primary/5 rounded-full w-10 h-10 p-0"
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* To Token */}
          <div className="space-y-2">
            <Label htmlFor="to-amount">To</Label>
            <div className="flex items-center gap-2">
              <Card className="flex-1 p-4 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="font-medium">{toToken}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Balance: 847.32</span>
                </div>
                <Input
                  id="to-amount"
                  type="number"
                  placeholder="0.000000"
                  value={toAmount}
                  readOnly
                  className="border-0 bg-transparent text-lg font-mono p-0 h-8"
                />
              </Card>
            </div>
          </div>

          <Separator className="bg-primary/20" />

          {/* Transaction Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span>1 {fromToken} = {exchangeRate} {toToken}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bridge Fee</span>
              <span>{(bridgeFee * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Time</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>~2-5 minutes</span>
              </div>
            </div>
          </div>

          {/* Bridge Button */}
          <Button 
            onClick={executeBridge}
            disabled={bridgeStatus === "processing" || !fromAmount || Number(fromAmount) <= 0}
            className="w-full h-12 bg-primary hover:bg-primary/90 shadow-neon"
          >
            {bridgeStatus === "processing" ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Processing Bridge...
              </div>
            ) : bridgeStatus === "success" ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Bridge Initiated
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Bridge {fromToken} → {toToken}
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Recent Bridge Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">5.0 XMR → 4.995 XMRT</div>
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm font-medium">2.5 XMRT → 2.4975 XMR</div>
                  <div className="text-xs text-muted-foreground">Pending confirmation</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Lightning Fast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Cross-chain bridges complete in 2-5 minutes using LayerZero's omnichain protocol.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Ultra Secure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your assets are secured by LayerZero's battle-tested cross-chain infrastructure.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}