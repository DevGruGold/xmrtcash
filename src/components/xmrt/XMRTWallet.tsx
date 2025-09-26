import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Wallet, 
  Eye, 
  EyeOff, 
  QrCode, 
  Copy, 
  Send, 
  Download,
  Smartphone,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getXMRTWalletMining } from '@/lib/real-data-api';

export default function XMRTWallet() {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [walletData, setWalletData] = useState({
    xmr: { balance: 0.00000000, usd: 0.00 },
    xmrt: { balance: 0, usd: 0 },
    btc: { balance: 0.00000000, usd: 0.00 },
    miningRewards: 0,
    meshnetStatus: "connecting",
    totalMined: 0
  });
  const { toast } = useToast();

  // Fetch real mining data
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const miningData = await getXMRTWalletMining();
        setWalletData(prev => ({
          ...prev,
          xmrt: { 
            balance: (miningData.minerStats?.amtDue / 1000000000000) || 0, 
            usd: ((miningData.minerStats?.amtDue / 1000000000000) * miningData.xmrPrice) || 0 
          },
          miningRewards: (miningData.minerStats?.amtDue / 1000000000000) || 0,
          meshnetStatus: miningData.minerStats?.hash > 0 ? "online" : "idle",
          totalMined: (miningData.minerStats?.amtPaid / 1000000000000) || 0
        }));
      } catch (error) {
        console.error('Failed to fetch wallet data:', error);
        setWalletData(prev => ({
          ...prev,
          meshnetStatus: "error"
        }));
      }
    };

    fetchWalletData();
    const interval = setInterval(fetchWalletData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const copyAddress = () => {
    navigator.clipboard.writeText("4BrL51JCc9NGQ71kWhnYJLlT5JBDxJb4AJjhDpAg1TXvPmNKLBmkD3mG6VoMW1oGCCXNLZNrJ2S3KJL1KfJyKW8Q2Jn5K8X");
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="gradient-text">XMRT Wallet</CardTitle>
                <CardDescription>Mobile Mining & Banking</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="neon-border bg-primary/10 text-primary">
              <Smartphone className="w-3 h-3 mr-1" />
              MobileMonero
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">XMR Balance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="h-6 w-6 p-0"
              >
                {balanceVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {balanceVisible ? `${walletData.xmr.balance.toFixed(8)} XMR` : "••••••••"}
              </div>
              <div className="text-sm text-muted-foreground">
                ${balanceVisible ? walletData.xmr.usd.toFixed(2) : "••••"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300 neon-border bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-primary">XMRT Balance</CardTitle>
              <Zap className="w-4 h-4 text-primary animate-pulse" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold gradient-text">
                {balanceVisible ? `${walletData.xmrt.balance.toFixed(2)} XMRT` : "••••••••"}
              </div>
              <div className="text-sm text-muted-foreground">
                ${balanceVisible ? walletData.xmrt.usd.toFixed(2) : "••••"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/20 hover:shadow-glow transition-all duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">BTC Balance</CardTitle>
              <Shield className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {balanceVisible ? `${walletData.btc.balance.toFixed(8)} BTC` : "••••••••"}
              </div>
              <div className="text-sm text-muted-foreground">
                ${balanceVisible ? walletData.btc.usd.toFixed(2) : "••••"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mining Stats */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Mobile Mining Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{walletData.miningRewards}</div>
              <div className="text-sm text-muted-foreground">XMRT Earned Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{walletData.totalMined}</div>
              <div className="text-sm text-muted-foreground">Total XMRT Mined</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="text-sm font-medium text-green-500">
                  {walletData.meshnetStatus.toUpperCase()}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">MESHNET Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button className="h-16 flex flex-col gap-2 bg-primary hover:bg-primary/90 shadow-neon">
          <Send className="w-5 h-5" />
          <span className="text-sm">Send</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2 border-primary/20 hover:bg-primary/5">
          <Download className="w-5 h-5" />
          <span className="text-sm">Receive</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2 border-primary/20 hover:bg-primary/5" onClick={copyAddress}>
          <QrCode className="w-5 h-5" />
          <span className="text-sm">QR Code</span>
        </Button>
        <Button variant="outline" className="h-16 flex flex-col gap-2 border-primary/20 hover:bg-primary/5" onClick={copyAddress}>
          <Copy className="w-5 h-5" />
          <span className="text-sm">Copy Address</span>
        </Button>
      </div>

      {/* Wallet Address */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm">Primary Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg font-mono text-sm break-all">
            <span className="flex-1">4BrL51JCc9NGQ71kWhnYJLlT5JBDxJb4AJjhD...Q2Jn5K8X</span>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="flex-shrink-0">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}