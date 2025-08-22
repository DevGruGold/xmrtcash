import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useXMRTContract } from '@/hooks/useXMRTContract';
import { useWeb3 } from '@/contexts/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Clock, CheckCircle, ExternalLink, Wallet, Copy } from 'lucide-react';
import { sepolia } from 'wagmi/chains';

export function XMRTFaucet() {
  const { isConnected, address, chainId, connect } = useWeb3();
  const { balance, faucetInfo, tokenInfo, isLoading, claimFromFaucet } = useXMRTContract();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);

  const handleClaim = async () => {
    if (!isConnected) {
      connect();
      return;
    }

    setClaiming(true);
    try {
      const result = await claimFromFaucet();
      if (result.success) {
        toast({
          title: "Faucet Claim Successful!",
          description: `${faucetInfo.amount} XMRT tokens have been sent to your wallet.`,
        });
      } else {
        toast({
          title: "Claim Failed",
          description: result.error || "Failed to claim tokens from faucet",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Claim Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return "Available now";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const timeUntilNextClaim = faucetInfo.nextClaimTime - Math.floor(Date.now() / 1000);
  const isWrongNetwork = chainId && chainId !== sepolia.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="gradient-text mb-4">XMRT Token Faucet</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get free XMRT tokens on Sepolia testnet to explore the XMRT ecosystem. 
          Claim {faucetInfo.amount} XMRT every 24 hours.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Faucet Card */}
        <Card className="glass-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10 neon-border">
                <Droplets className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>Claim XMRT Tokens</CardTitle>
            <CardDescription>
              Free testnet tokens for development and testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Connect your wallet to claim tokens</p>
                <Button onClick={connect} className="neon-button w-full">
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              </div>
            ) : isWrongNetwork ? (
              <Alert>
                <AlertDescription>
                  Please switch to Sepolia testnet to use the faucet.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Faucet Amount</span>
                  <Badge variant="secondary">{faucetInfo.amount} XMRT</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <span className="text-sm text-muted-foreground">Cooldown</span>
                  <Badge variant="outline">24 hours</Badge>
                </div>

                {faucetInfo.canClaim ? (
                  <Button 
                    onClick={handleClaim} 
                    disabled={claiming || isLoading}
                    className="neon-button w-full"
                  >
                    {claiming ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Claim {faucetInfo.amount} XMRT
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center space-y-2">
                    <Button disabled className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      Cooldown Active
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeRemaining(timeUntilNextClaim)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance & Info Card */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your XMRT Balance</CardTitle>
            <CardDescription>
              Current balance and token information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isConnected ? (
              <div className="space-y-4">
                <div className="text-center p-6 rounded-lg bg-gradient-card border border-primary/20">
                  <div className="text-3xl font-bold gradient-text mb-2">
                    {balance.formatted}
                  </div>
                  <div className="text-sm text-muted-foreground">XMRT</div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Wallet Address</span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-secondary/50 px-2 py-1 rounded">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={copyAddress}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Token Symbol</span>
                    <Badge variant="outline">{tokenInfo.symbol}</Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Network</span>
                    <Badge variant="outline">Sepolia</Badge>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`https://sepolia.etherscan.io/token/0x77307DFbc436224d5e6f2048d2b6bDfA66998a15`, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Etherscan
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Connect wallet to view balance</p>
                <Button onClick={connect} variant="outline">
                  Connect Wallet
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="glass-card mt-8">
        <CardHeader>
          <CardTitle>How to Use the Faucet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mx-auto">
                1
              </div>
              <h4 className="font-medium">Connect Wallet</h4>
              <p className="text-sm text-muted-foreground">
                Connect your Web3 wallet and switch to Sepolia testnet
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mx-auto">
                2
              </div>
              <h4 className="font-medium">Claim Tokens</h4>
              <p className="text-sm text-muted-foreground">
                Click the claim button to receive {faucetInfo.amount} XMRT tokens
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mx-auto">
                3
              </div>
              <h4 className="font-medium">Start Testing</h4>
              <p className="text-sm text-muted-foreground">
                Use your XMRT tokens to test features in the ecosystem
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}