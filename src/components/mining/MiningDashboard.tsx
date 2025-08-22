import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Users, 
  TrendingUp, 
  Wallet, 
  RefreshCw,
  Pickaxe,
  DollarSign,
  Hash
} from 'lucide-react';
import { getXMRTWalletMining, getSupportXMRPoolStats } from '@/lib/real-data-api';
import { useToast } from '@/hooks/use-toast';

interface MiningDashboardProps {
  walletAddress?: string;
}

export default function MiningDashboard({ 
  walletAddress = "46UxNfuGM2E3UwmZWWJicaRpCRwqwW4byQkaTHKX8yPCVlhp91qAfvEFjpWUGJJUyTXqzSqxzDQtNLfZbsp2DX2qCGCSmq" 
}: MiningDashboardProps) {
  const [miningData, setMiningData] = useState<any>(null);
  const [poolData, setPoolData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMiningData = async () => {
    try {
      setIsLoading(true);
      const [walletMining, poolStats] = await Promise.all([
        getXMRTWalletMining(walletAddress),
        getSupportXMRPoolStats()
      ]);
      
      setMiningData(walletMining);
      setPoolData(poolStats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch mining data:', err);
      setError('Failed to load mining data');
      toast({
        title: "Mining Data Error",
        description: "Failed to fetch real-time mining statistics",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMiningData();
    const interval = setInterval(fetchMiningData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-1"></div>
              <div className="h-3 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchMiningData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const formatHashrate = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(1)} MH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(1)} KH/s`;
    return `${hashrate.toFixed(1)} H/s`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Hashrate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatHashrate(miningData?.currentHashrate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {miningData?.currentHashrate > 0 ? 'Active Mining' : 'Inactive'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pool Contribution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {miningData?.poolContribution?.toFixed(4) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Of pool hashrate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(miningData?.amountDue / 1000000000000 || 0).toFixed(6)} XMR
            </div>
            <p className="text-xs text-muted-foreground">
              ≈ ${((miningData?.amountDue / 1000000000000 || 0) * miningData?.xmrPrice || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(miningData?.amountPaid / 1000000000000 || 0).toFixed(6)} XMR
            </div>
            <p className="text-xs text-muted-foreground">
              {miningData?.minerStats?.txnCount || 0} payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="mining" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mining">Mining Stats</TabsTrigger>
          <TabsTrigger value="pool">Pool Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="mining" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Miner Statistics
                </CardTitle>
                <CardDescription>Real-time mining performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Hashes</span>
                    <span className="font-mono">{formatNumber(miningData?.totalHashes || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Valid Shares</span>
                    <span className="font-mono">{formatNumber(miningData?.minerStats?.validShares || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Invalid Shares</span>
                    <span className="font-mono">{formatNumber(miningData?.minerStats?.invalidShares || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Share Efficiency</span>
                    <span className="font-mono">
                      {miningData?.minerStats?.validShares > 0 
                        ? ((miningData.minerStats.validShares / (miningData.minerStats.validShares + miningData.minerStats.invalidShares)) * 100).toFixed(2)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pickaxe className="h-5 w-5" />
                  Mining Status
                </CardTitle>
                <CardDescription>Current mining activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <Badge variant={miningData?.currentHashrate > 0 ? "default" : "secondary"}>
                    {miningData?.currentHashrate > 0 ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pool Hashrate</span>
                    <span className="font-mono">{formatHashrate(poolData?.hashRate || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pool Miners</span>
                    <span className="font-mono">{formatNumber(poolData?.miners || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Network Contribution</span>
                    <span className="font-mono">
                      {miningData?.poolContribution ? `${miningData.poolContribution.toFixed(6)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pool" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>SupportXMR Pool Stats</CardTitle>
                <CardDescription>Real-time pool performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Hashrate</span>
                    <span className="font-mono">{formatHashrate(poolData?.hashRate || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Miners</span>
                    <span className="font-mono">{formatNumber(poolData?.miners || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Blocks Found</span>
                    <span className="font-mono">{formatNumber(poolData?.totalBlocksFound || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Payments</span>
                    <span className="font-mono">{formatNumber(poolData?.totalPayments || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Miners Paid</span>
                    <span className="font-mono">{formatNumber(poolData?.totalMinersPaid || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pool Efficiency</CardTitle>
                <CardDescription>Mining pool performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Round Progress</span>
                      <span>{poolData?.roundHashes ? `${(poolData.roundHashes / poolData.totalHashes * 100).toFixed(2)}%` : '0%'}</span>
                    </div>
                    <Progress value={poolData?.roundHashes ? (poolData.roundHashes / poolData.totalHashes * 100) : 0} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Last Block Found</span>
                    <span>{poolData?.lastBlockFound ? `#${poolData.lastBlockFound}` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Average Block Time</span>
                    <span>~2.5 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchMiningData} variant="outline" className="w-full max-w-xs">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Mining Data
        </Button>
      </div>
    </div>
  );
}