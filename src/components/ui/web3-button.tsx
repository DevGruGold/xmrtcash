import React from 'react';
import { Button } from '@/components/ui/button';
import { useWeb3 } from '@/contexts/Web3Context';
import { Wallet, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { sepolia } from 'wagmi/chains';

export function Web3Button() {
  const { address, isConnected, connect, disconnect, chainId } = useWeb3();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const isWrongNetwork = chainId && chainId !== sepolia.id;

  if (!isConnected) {
    return (
      <Button onClick={connect} className="neon-button">
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isWrongNetwork && (
        <Badge variant="destructive" className="text-xs">
          Wrong Network
        </Badge>
      )}
      <Button
        variant="outline"
        onClick={disconnect}
        className="flex items-center gap-2"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        {address && formatAddress(address)}
        <ChevronDown className="h-3 w-3" />
      </Button>
    </div>
  );
}