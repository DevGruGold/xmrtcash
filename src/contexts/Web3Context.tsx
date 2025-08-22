import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config';
import { WagmiProvider, useAccount, useDisconnect, useBalance } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// WalletConnect project ID
const projectId = 'b59c16c98b22d36a30ec986c5e6f2048d2b6bDfA66998a15';

// Wagmi config
const metadata = {
  name: 'XMRT DAO',
  description: 'XMRT DAO - The Future of Decentralized Privacy',
  url: 'https://xmrt.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

const chains = [sepolia] as const;
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true,
  enableOnramp: true,
});

interface Web3ContextType {
  address: string | undefined;
  isConnected: boolean;
  balance: string | undefined;
  connect: () => void;
  disconnect: () => void;
  chainId: number | undefined;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

const queryClient = new QueryClient();

interface Web3ProviderInnerProps {
  children: ReactNode;
}

function Web3ProviderInner({ children }: Web3ProviderInnerProps) {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balanceData } = useBalance({
    address,
    chainId: sepolia.id,
  });

  const connect = () => {
    const modal = document.querySelector('w3m-button');
    if (modal) {
      (modal as any).click();
    }
  };

  const balance = balanceData ? 
    `${parseFloat(balanceData.formatted).toFixed(4)} ${balanceData.symbol}` : 
    undefined;

  const contextValue: Web3ContextType = {
    address,
    isConnected,
    balance,
    connect,
    disconnect,
    chainId,
  };

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
}

interface Web3ProviderProps {
  children: ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Web3ProviderInner>{children}</Web3ProviderInner>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}