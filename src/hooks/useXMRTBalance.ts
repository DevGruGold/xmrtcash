import { useState, useEffect } from 'react';

export interface WalletBalance {
  xmr: {
    balance: number;
    usd: number;
  };
  xmrt: {
    balance: number;
    usd: number;
  };
  btc: {
    balance: number;
    usd: number;
  };
  totalUsd: number;
  lastUpdated: Date;
}

export interface MiningStats {
  dailyXMRT: number;
  totalMined: number;
  hashrate: number;
  isActive: boolean;
  meshnetStatus: 'connected' | 'disconnected' | 'syncing';
  nightModeActive: boolean;
}

export function useXMRTBalance() {
  const [balance, setBalance] = useState<WalletBalance>({
    xmr: { balance: 0.00000000, usd: 0.00 },
    xmrt: { balance: 847.32, usd: 423.66 },
    btc: { balance: 0.00000000, usd: 0.00 },
    totalUsd: 423.66,
    lastUpdated: new Date()
  });

  const [miningStats, setMiningStats] = useState<MiningStats>({
    dailyXMRT: 12.45,
    totalMined: 2847.32,
    hashrate: 847.32,
    isActive: true,
    meshnetStatus: 'connected',
    nightModeActive: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time balance updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (miningStats.isActive) {
        setBalance(prev => ({
          ...prev,
          xmrt: {
            ...prev.xmrt,
            balance: prev.xmrt.balance + Math.random() * 0.01
          },
          lastUpdated: new Date()
        }));

        setMiningStats(prev => ({
          ...prev,
          dailyXMRT: prev.dailyXMRT + Math.random() * 0.001,
          totalMined: prev.totalMined + Math.random() * 0.001,
          hashrate: prev.hashrate + (Math.random() - 0.5) * 50
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [miningStats.isActive]);

  const refreshBalance = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call to fetch balance
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock balance update
      setBalance(prev => ({
        ...prev,
        xmrt: {
          balance: prev.xmrt.balance + Math.random() * 10,
          usd: (prev.xmrt.balance + Math.random() * 10) * 0.5
        },
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
      hashrate: prev.nightModeActive ? prev.hashrate * 1.5 : prev.hashrate * 0.7
    }));
  };

  const sendXMRT = async (amount: number, address: string) => {
    setIsLoading(true);
    setError(null);

    try {
      if (amount > balance.xmrt.balance) {
        throw new Error('Insufficient balance');
      }

      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      setBalance(prev => ({
        ...prev,
        xmrt: {
          ...prev.xmrt,
          balance: prev.xmrt.balance - amount
        },
        lastUpdated: new Date()
      }));

      return {
        txid: '0x' + Math.random().toString(16).substr(2, 64),
        amount,
        address,
        timestamp: new Date()
      };

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
      const fromBalance = direction === 'xmr-to-xmrt' ? balance.xmr.balance : balance.xmrt.balance;
      if (amount > fromBalance) {
        throw new Error('Insufficient balance');
      }

      // Simulate bridge transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      if (direction === 'xmr-to-xmrt') {
        setBalance(prev => ({
          ...prev,
          xmr: { ...prev.xmr, balance: prev.xmr.balance - amount },
          xmrt: { ...prev.xmrt, balance: prev.xmrt.balance + amount * 0.999 }, // 0.1% fee
          lastUpdated: new Date()
        }));
      } else {
        setBalance(prev => ({
          ...prev,
          xmrt: { ...prev.xmrt, balance: prev.xmrt.balance - amount },
          xmr: { ...prev.xmr, balance: prev.xmr.balance + amount * 0.999 },
          lastUpdated: new Date()
        }));
      }

      return {
        txid: '0x' + Math.random().toString(16).substr(2, 64),
        amount,
        direction,
        timestamp: new Date()
      };

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