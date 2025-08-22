import { ethers } from 'ethers';

// XMRT Token Contract on Sepolia
export const XMRT_CONTRACT_ADDRESS = '0x77307DFbc436224d5e6f2048d2b6bDfA66998a15';

// Basic ERC20 ABI for XMRT token
export const XMRT_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Faucet-specific functions (if contract has them)
  'function mint(address to, uint256 amount) returns (bool)',
  'function faucet() returns (bool)',
  'function faucetAmount() view returns (uint256)',
  'function lastFaucetTime(address user) view returns (uint256)',
  'function faucetCooldown() view returns (uint256)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

export interface XMRTBalance {
  balance: string;
  formatted: string;
  decimals: number;
}

export interface FaucetInfo {
  amount: string;
  cooldown: number;
  lastClaim: number;
  canClaim: boolean;
  nextClaimTime: number;
}

export class XMRTContract {
  private contract: ethers.Contract;
  private provider: ethers.Provider;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    this.provider = provider;
    this.contract = new ethers.Contract(
      XMRT_CONTRACT_ADDRESS, 
      XMRT_ABI, 
      signer || provider
    );
  }

  async getBalance(address: string): Promise<XMRTBalance> {
    try {
      const balance = await this.contract.balanceOf(address);
      const decimals = await this.contract.decimals();
      const formatted = ethers.formatUnits(balance, decimals);
      
      return {
        balance: balance.toString(),
        formatted,
        decimals: Number(decimals),
      };
    } catch (error) {
      console.error('Error getting XMRT balance:', error);
      return {
        balance: '0',
        formatted: '0.0',
        decimals: 18,
      };
    }
  }

  async getTokenInfo() {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals(),
        this.contract.totalSupply(),
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, decimals),
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return {
        name: 'XMRT Token',
        symbol: 'XMRT',
        decimals: 18,
        totalSupply: '0',
      };
    }
  }

  async getFaucetInfo(userAddress: string): Promise<FaucetInfo> {
    try {
      const [faucetAmount, cooldown, lastClaim] = await Promise.all([
        this.contract.faucetAmount().catch(() => ethers.parseEther('100')), // Default 100 XMRT
        this.contract.faucetCooldown().catch(() => 86400), // Default 24 hours
        this.contract.lastFaucetTime(userAddress).catch(() => 0),
      ]);

      const now = Math.floor(Date.now() / 1000);
      const nextClaimTime = Number(lastClaim) + Number(cooldown);
      const canClaim = now >= nextClaimTime;

      return {
        amount: ethers.formatEther(faucetAmount),
        cooldown: Number(cooldown),
        lastClaim: Number(lastClaim),
        canClaim,
        nextClaimTime,
      };
    } catch (error) {
      console.error('Error getting faucet info:', error);
      return {
        amount: '100.0',
        cooldown: 86400,
        lastClaim: 0,
        canClaim: true,
        nextClaimTime: 0,
      };
    }
  }

  async claimFromFaucet(): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract.runner) {
        throw new Error('No signer available for transaction');
      }

      const tx = await this.contract.faucet();
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      console.error('Error claiming from faucet:', error);
      return {
        success: false,
        error: error.message || 'Failed to claim from faucet',
      };
    }
  }

  async transfer(to: string, amount: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract.runner) {
        throw new Error('No signer available for transaction');
      }

      const decimals = await this.contract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);
      
      const tx = await this.contract.transfer(to, amountWei);
      await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
      };
    } catch (error: any) {
      console.error('Error transferring XMRT:', error);
      return {
        success: false,
        error: error.message || 'Failed to transfer XMRT',
      };
    }
  }
}

// Utility function to create contract instance
export function createXMRTContract(provider: ethers.Provider, signer?: ethers.Signer): XMRTContract {
  return new XMRTContract(provider, signer);
}