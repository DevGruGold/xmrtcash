import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { createXMRTContract, XMRTBalance, FaucetInfo } from '@/lib/contracts/xmrt';
import { ethers } from 'ethers';

export function useXMRTContract() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  
  const [balance, setBalance] = useState<XMRTBalance>({
    balance: '0',
    formatted: '0.0',
    decimals: 18,
  });
  const [faucetInfo, setFaucetInfo] = useState<FaucetInfo>({
    amount: '100.0',
    cooldown: 86400,
    lastClaim: 0,
    canClaim: true,
    nextClaimTime: 0,
  });
  const [tokenInfo, setTokenInfo] = useState({
    name: 'XMRT Token',
    symbol: 'XMRT',
    decimals: 18,
    totalSupply: '0',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContract = useCallback(() => {
    if (!publicClient) return null;
    
    const provider = new ethers.BrowserProvider(publicClient as any);
    let signer;
    
    if (walletClient) {
      signer = new ethers.BrowserProvider(walletClient as any).getSigner();
    }
    
    return createXMRTContract(provider, signer as any);
  }, [publicClient, walletClient]);

  const fetchBalance = useCallback(async () => {
    if (!address || !isConnected) {
      setBalance({ balance: '0', formatted: '0.0', decimals: 18 });
      return;
    }

    const contract = getContract();
    if (!contract) return;

    try {
      const balanceData = await contract.getBalance(address);
      setBalance(balanceData);
    } catch (err) {
      console.error('Error fetching XMRT balance:', err);
      setError('Failed to fetch balance');
    }
  }, [address, isConnected, getContract]);

  const fetchFaucetInfo = useCallback(async () => {
    if (!address || !isConnected) return;

    const contract = getContract();
    if (!contract) return;

    try {
      const info = await contract.getFaucetInfo(address);
      setFaucetInfo(info);
    } catch (err) {
      console.error('Error fetching faucet info:', err);
    }
  }, [address, isConnected, getContract]);

  const fetchTokenInfo = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;

    try {
      const info = await contract.getTokenInfo();
      setTokenInfo(info);
    } catch (err) {
      console.error('Error fetching token info:', err);
    }
  }, [getContract]);

  const claimFromFaucet = useCallback(async () => {
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contract.claimFromFaucet();
      if (result.success) {
        // Refresh balance and faucet info after successful claim
        await fetchBalance();
        await fetchFaucetInfo();
      }
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to claim from faucet');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getContract, fetchBalance, fetchFaucetInfo]);

  const transferXMRT = useCallback(async (to: string, amount: string) => {
    const contract = getContract();
    if (!contract) {
      throw new Error('Contract not available');
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contract.transfer(to, amount);
      if (result.success) {
        // Refresh balance after successful transfer
        await fetchBalance();
      }
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to transfer XMRT');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getContract, fetchBalance]);

  // Fetch initial data
  useEffect(() => {
    fetchTokenInfo();
  }, [fetchTokenInfo]);

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance();
      fetchFaucetInfo();
    }
  }, [isConnected, address, fetchBalance, fetchFaucetInfo]);

  // Set up polling for balance updates
  useEffect(() => {
    if (!isConnected || !address) return;

    const interval = setInterval(() => {
      fetchBalance();
      fetchFaucetInfo();
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [isConnected, address, fetchBalance, fetchFaucetInfo]);

  return {
    balance,
    faucetInfo,
    tokenInfo,
    isLoading,
    error,
    claimFromFaucet,
    transferXMRT,
    refreshData: () => {
      fetchBalance();
      fetchFaucetInfo();
      fetchTokenInfo();
    },
  };
}