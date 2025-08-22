import { getGeminiModel } from './gemini';
import { supabase } from '@/integrations/supabase/client';

// Get API key from environment
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export interface MoneroNetworkStats {
  hashrate: number;
  difficulty: number;
  height: number;
  networkHashrate: number;
  totalMiners: number;
  lastBlockTime: number;
}

export interface SupportXMRPoolStats {
  hashRate: number;
  miners: number;
  totalHashes: number;
  lastBlockFoundTime: number;
  lastBlockFound: number;
  totalBlocksFound: number;
  totalMinersPaid: number;
  totalPayments: number;
  roundHashes: number;
}

export interface SupportXMRMinerStats {
  hash: number;
  identifier: string;
  lastHash: number;
  totalHashes: number;
  validShares: number;
  invalidShares: number;
  expiry: number;
  amtPaid: number;
  amtDue: number;
  txnCount: number;
}

export interface MobileMiningStats {
  identifier: string;
  dailyHashrate: number;
  totalContribution: number;
  rank: number;
  isNightMode: boolean;
  lastSeen: number;
}

export interface MoneroPriceData {
  xmr: {
    usd: number;
    btc: number;
    eur: number;
    change24h: number;
  };
}

export interface P2PoolStats {
  poolHashrate: number;
  miners: number;
  blocks24h: number;
  totalHashes: number;
  effort: number;
  networkHashrate: number;
}

export interface TreasuryStats {
  treasuryBalance: number;
  operationsBalance: number;
  treasuryPercentage: number;
  dailyFees: number;
}

// SupportXMR Pool API integration via Supabase Edge Function proxy
export async function getSupportXMRPoolStats(): Promise<SupportXMRPoolStats> {
  try {
    const { data, error } = await supabase.functions.invoke('supportxmr-proxy', {
      body: { path: '/pool/stats' }
    });
    
    if (error) throw error;
    
    console.log('SupportXMR API Response:', JSON.stringify(data, null, 2));
    
    // SupportXMR API structure - based on actual API response
    return {
      hashRate: data.pool?.hashrate || data.hashrate || 0,
      miners: data.pool?.miners || data.miners || 0,
      totalHashes: data.pool?.totalHashes || data.totalHashes || 0,
      lastBlockFoundTime: data.pool?.lastBlockFoundTime || data.lastBlockFoundTime || Date.now(),
      lastBlockFound: data.pool?.lastBlockFound || data.lastBlockFound || 0,
      totalBlocksFound: data.pool?.totalBlocksFound || data.totalBlocksFound || 0,
      totalMinersPaid: data.pool?.totalMinersPaid || data.totalMinersPaid || 0,
      totalPayments: data.pool?.totalPayments || data.totalPayments || 0,
      roundHashes: data.pool?.roundHashes || data.roundHashes || 0
    };
  } catch (error) {
    console.error('Failed to fetch SupportXMR pool stats via proxy:', error);
    // Return fallback data when API is unavailable
    return {
      hashRate: 0,
      miners: 0,
      totalHashes: 0,
      lastBlockFoundTime: Date.now(),
      lastBlockFound: 0,
      totalBlocksFound: 0,
      totalMinersPaid: 0,
      totalPayments: 0,
      roundHashes: 0
    };
  }
}

// SupportXMR Miner API integration via Supabase Edge Function proxy
export async function getSupportXMRMinerStats(address: string): Promise<SupportXMRMinerStats> {
  try {
    const { data, error } = await supabase.functions.invoke('supportxmr-proxy', {
      body: { path: `/miner/${address}/stats` }
    });
    
    if (error) throw error;
    
    return {
      hash: data.hash || 0,
      identifier: data.identifier || address,
      lastHash: data.lastHash || 0,
      totalHashes: data.totalHashes || 0,
      validShares: data.validShares || 0,
      invalidShares: data.invalidShares || 0,
      expiry: data.expiry || Date.now(),
      amtPaid: data.amtPaid || 0,
      amtDue: data.amtDue || 0,
      txnCount: data.txnCount || 0
    };
  } catch (error) {
    console.error('Failed to fetch SupportXMR miner stats via proxy:', error);
    // Return fallback data when API is unavailable
    return {
      hash: 0,
      identifier: address,
      lastHash: 0,
      totalHashes: 0,
      validShares: 0,
      invalidShares: 0,
      expiry: Date.now(),
      amtPaid: 0,
      amtDue: 0,
      txnCount: 0
    };
  }
}

// P2Pool Observer API integration
export async function getP2PoolStats(): Promise<P2PoolStats> {
  try {
    const response = await fetch('https://p2pool.observer/api/pool_info');
    const data = await response.json();
    
    return {
      poolHashrate: data.sidechain?.hashrate || 0,
      miners: data.sidechain?.miners || 0,
      blocks24h: data.mainchain?.blocks_found_24h || 0,
      totalHashes: data.sidechain?.total_hashes || 0,
      effort: data.sidechain?.effort || 100,
      networkHashrate: data.mainchain?.difficulty / 120 || 0 // Approximate from difficulty
    };
  } catch (error) {
    console.error('Failed to fetch P2Pool stats:', error);
    throw error;
  }
}

// Gemini AI integration for real-time data
export async function getMoneroPrice(): Promise<MoneroPriceData> {
  try {
    if (!apiKey) {
      // Fallback price data when Gemini is not available
      return {
        xmr: {
          usd: 150,
          btc: 0.0025,
          eur: 135,
          change24h: 0
        }
      };
    }

    const model = getGeminiModel();
    const prompt = `You are a cryptocurrency data assistant. Provide ONLY a JSON response with current Monero (XMR) price data in this exact format:
    {
      "xmr": {
        "usd": [current USD price as number],
        "btc": [current BTC price as number],
        "eur": [current EUR price as number],
        "change24h": [24h percentage change as number]
      }
    }
    
    Use your knowledge of current crypto market data. Respond with only the JSON, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse JSON response
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('Failed to fetch Monero price via Gemini:', error);
    // Return fallback price data when API is unavailable
    return {
      xmr: {
        usd: 150,
        btc: 0.0025,
        eur: 135,
        change24h: 0
      }
    };
  }
}

// Monero network stats from multiple sources
export async function getMoneroNetworkStats(): Promise<MoneroNetworkStats> {
  try {
    // Use P2Pool observer for network data
    const p2poolResponse = await fetch('https://p2pool.observer/api/network/stats');
    const p2poolData = await p2poolResponse.json();
    
    return {
      hashrate: p2poolData.hashrate || 0,
      difficulty: p2poolData.difficulty || 0,
      height: p2poolData.height || 0,
      networkHashrate: p2poolData.hashrate || 0,
      totalMiners: p2poolData.miners || 0,
      lastBlockTime: p2poolData.last_block_timestamp || Date.now()
    };
  } catch (error) {
    console.error('Failed to fetch Monero network stats:', error);
    throw error;
  }
}

// Treasury and operations balance - using Gemini for price data
export async function getTreasuryStats(): Promise<TreasuryStats> {
  try {
    // Get XMR price via Gemini instead of CoinGecko
    const priceData = await getMoneroPrice();
    const xmrPrice = priceData.xmr.usd;
    
    // Calculate based on real XMR price - these would be actual on-chain balances
    const treasuryXMR = 1247.8; // This would come from actual treasury wallet
    const operationsXMR = 523.2; // This would come from actual operations wallet
    
    return {
      treasuryBalance: treasuryXMR * xmrPrice,
      operationsBalance: operationsXMR * xmrPrice,
      treasuryPercentage: (treasuryXMR / (treasuryXMR + operationsXMR)) * 100,
      dailyFees: 12.4 * xmrPrice // This would come from daily fee collection data
    };
  } catch (error) {
    console.error('Failed to fetch treasury stats:', error);
    // Return fallback data when API is unavailable
    return {
      treasuryBalance: 187170, // 1247.8 * 150
      operationsBalance: 78480, // 523.2 * 150
      treasuryPercentage: 70.4,
      dailyFees: 1860 // 12.4 * 150
    };
  }
}

// Real mining pool data aggregator
export async function getPoolAggregateStats() {
  try {
    const [supportXMRStats, p2poolStats, priceData, networkStats] = await Promise.all([
      getSupportXMRPoolStats(),
      getP2PoolStats(),
      getMoneroPrice(),
      getMoneroNetworkStats()
    ]);
    
    return {
      totalPoolHashrate: supportXMRStats.hashRate + p2poolStats.poolHashrate,
      totalMiners: supportXMRStats.miners + p2poolStats.miners,
      networkHashrate: networkStats.networkHashrate,
      xmrPrice: priceData.xmr.usd,
      priceChange24h: priceData.xmr.change24h,
      difficulty: networkStats.difficulty,
      blockHeight: networkStats.height,
      blocksFound24h: p2poolStats.blocks24h,
      supportXMRHashrate: supportXMRStats.hashRate,
      supportXMRMiners: supportXMRStats.miners,
      supportXMRTotalBlocks: supportXMRStats.totalBlocksFound,
      supportXMRTotalPayments: supportXMRStats.totalPayments
    };
  } catch (error) {
    console.error('Failed to fetch aggregate stats:', error);
    throw error;
  }
}

// XMRT DAO Mobile Mining Integration - Real data integration pending
export async function getMobileMiningStats(identifier?: string): Promise<MobileMiningStats[]> {
  try {
    // This would connect to the actual XMRT DAO backend for real mobile mining data
    // For now, return empty array to indicate no real data is available yet
    console.log('Mobile mining stats: Awaiting real data integration with xmrtdao.streamlit.app');
    
    // Return empty array instead of simulated data
    return [];
  } catch (error) {
    console.error('Failed to fetch mobile mining stats:', error);
    return [];
  }
}

// Get real XMRT wallet mining data - CORRECTED WALLET ADDRESS
export async function getXMRTWalletMining(address: string = "46UxNFuGM2E3UwmZWWJicaRPoRwqwW4byQkaTHkX8yPcVihp91qAVtSFipWUGJJUyTXgzSqxzDQtNLf2bsp2DX2qCCgC5mg") {
  try {
    const [supportXMRMiner, supportXMRPool, priceData] = await Promise.all([
      getSupportXMRMinerStats(address),
      getSupportXMRPoolStats(),
      getMoneroPrice()
    ]);
    
    return {
      minerStats: supportXMRMiner,
      poolStats: supportXMRPool,
      currentHashrate: supportXMRMiner.hash,
      totalHashes: supportXMRMiner.totalHashes,
      amountPaid: supportXMRMiner.amtPaid,
      amountDue: supportXMRMiner.amtDue,
      xmrPrice: priceData.xmr.usd,
      poolContribution: supportXMRPool.hashRate > 0 ? (supportXMRMiner.hash / supportXMRPool.hashRate) * 100 : 0
    };
  } catch (error) {
    console.error('Failed to fetch XMRT wallet mining data:', error);
    throw error;
  }
}