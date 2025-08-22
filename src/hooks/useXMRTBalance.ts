import { useState, useEffect } from 'react';

export interface WalletBalance {
  xmr: number;
  xmrt: number;
  btc: number;
  xmrUsd: number;
  xmrtUsd: number;
  btcUsd: number;
  totalUsd: number;
  lastUpdated: Date;
}

export interface MiningStats {
  dailyXMRT: number;
  totalXMRT: number;
  hashrate: string;
  isActive: boolean;
  meshnetConnected: boolean;
  nightModeActive: boolean;
}

export function useXMRTBalance() {
  const [balance, setBalance] = useState<WalletBalance>({
    xmr: 2.45,
    xmrt: 147.8,
    btc: 0.023,
    xmrUsd: 367.5,
    xmrtUsd: 2217.0,
    btcUsd: 1456.7,
    totalUsd: 4041.2,
    lastUpdated: new Date()
  });

  const [miningStats, setMiningStats] = useState<MiningStats>({
    dailyXMRT: 12.4,
    totalXMRT: 1247.8,
    hashrate: "847.2 KH/s",
    isActive: true,
    meshnetConnected: true,
    nightModeActive: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBalance(prev => ({
        ...prev,
        xmrt: prev.xmrt + (Math.random() * 0.1 - 0.05),
        xmrtUsd: prev.xmrtUsd + (Math.random() * 5 - 2.5),
        totalUsd: prev.totalUsd + (Math.random() * 10 - 5),
        lastUpdated: new Date()
      }));

      setMiningStats(prev => ({
        ...prev,
        dailyXMRT: prev.dailyXMRT + (Math.random() * 0.02 - 0.01),
        totalXMRT: prev.totalXMRT + (Math.random() * 0.05),
        hashrate: `${(Math.random() * 100 + 800).toFixed(1)} KH/s`
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const refreshBalance = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBalance(prev => ({
        ...prev,
        xmr: Math.random() * 5 + 1,
        xmrt: Math.random() * 200 + 100,
        btc: Math.random() * 0.1 + 0.01,
        lastUpdated: new Date()
      }));
    } catch (err) {
      setError('Failed to refresh balance');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMining = () => {
    setMiningStats(prev => ({
      ...prev,
      isActive: !prev.isActive
    }));
  };

  const toggleNightMode = () => {
    setMiningStats(prev => ({
      ...prev,
      nightModeActive: !prev.nightModeActive,
      hashrate: prev.nightModeActive 
        ? `${(Math.random() * 100 + 800).toFixed(1)} KH/s`
        : `${(Math.random() * 50 + 400).toFixed(1)} KH/s`
    }));
  };

  const sendXMRT = async (amount: number, address: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (amount > balance.xmrt) {
        throw new Error('Insufficient balance');
      }
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBalance(prev => ({
        ...prev,
        xmrt: prev.xmrt - amount,
        xmrtUsd: prev.xmrtUsd - (amount * 15),
        totalUsd: prev.totalUsd - (amount * 15),
        lastUpdated: new Date()
      }));
      
      return { success: true, txHash: `0x${Math.random().toString(16).slice(2)}` };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const bridgeXMR = async (amount: number, direction: 'xmr-to-xmrt' | 'xmrt-to-xmr') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fee = amount * 0.001; // 0.1% fee
      
      if (direction === 'xmr-to-xmrt' && amount > balance.xmr) {
        throw new Error('Insufficient XMR balance');
      }
      if (direction === 'xmrt-to-xmr' && amount > balance.xmrt) {
        throw new Error('Insufficient XMRT balance');
      }
      
      // Simulate bridge transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      if (direction === 'xmr-to-xmrt') {
        setBalance(prev => ({
          ...prev,
          xmr: prev.xmr - amount,
          xmrt: prev.xmrt + (amount - fee),
          lastUpdated: new Date()
        }));
      } else {
        setBalance(prev => ({
          ...prev,
          xmrt: prev.xmrt - amount,
          xmr: prev.xmr + (amount - fee),
          lastUpdated: new Date()
        }));
      }
      
      return { success: true, txHash: `0x${Math.random().toString(16).slice(2)}`, fee };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bridge transaction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance,
    miningStats,
    isLoading,
    error,
    refreshBalance,
    toggleMining,
    toggleNightMode,
    sendXMRT,
    bridgeXMR
  };
}