import { supabase } from '@/integrations/supabase/client';

export interface WorkerStats {
  workerId: string;
  address: string;
  hashrate: number;
  totalHashes: number;
  validShares: number;
  invalidShares: number;
  amountPaid: number;
  amountDue: number;
  lastSeen: number;
  isActive: boolean;
}

// Main wallet address from mining script
export const MAIN_WALLET = "46UxNFuGM2E3UwmZWWJicaRPoRwqwW4byQkaTHkX8yPcVihp91qAVtSFipWUGJJUyTXgzSqxzDQtNLf2bsp2DX2qCCgC5mg";

// Get workers list for the main wallet
export async function getActiveWorkers(): Promise<WorkerStats[]> {
  try {
    const { data, error } = await supabase.functions.invoke('supportxmr-proxy', {
      body: { path: `/pool/workers/${MAIN_WALLET}` }
    });
    
    if (error) throw error;
    
    console.log('Workers API Response:', JSON.stringify(data, null, 2));
    
    if (!data || !Array.isArray(data)) {
      console.log('No worker data or invalid format');
      return [];
    }
    
    // Parse worker data - SupportXMR format
    return data.map((worker: any) => {
      // Extract 8-digit worker ID from identifier (format: wallet.workerId)
      const workerId = worker.identifier?.split('.').pop() || 'unknown';
      
      return {
        workerId,
        address: worker.identifier || '',
        hashrate: worker.hash || 0,
        totalHashes: worker.totalHashes || 0,
        validShares: worker.validShares || 0,
        invalidShares: worker.invalidShares || 0,
        amountPaid: worker.amtPaid || 0,
        amountDue: worker.amtDue || 0,
        lastSeen: worker.lastHash || Date.now(),
        isActive: (worker.hash || 0) > 0
      };
    }).sort((a, b) => b.hashrate - a.hashrate); // Sort by hashrate descending
    
  } catch (error) {
    console.error('Failed to fetch worker stats:', error);
    return [];
  }
}

// Get individual worker stats by worker ID
export async function getWorkerStats(workerId: string): Promise<WorkerStats | null> {
  try {
    const workers = await getActiveWorkers();
    return workers.find(w => w.workerId === workerId) || null;
  } catch (error) {
    console.error('Failed to fetch worker stats:', error);
    return null;
  }
}

// Calculate worker leaderboard
export async function getWorkerLeaderboard(): Promise<WorkerStats[]> {
  try {
    const workers = await getActiveWorkers();
    
    // Filter active workers and sort by contribution
    return workers
      .filter(w => w.isActive)
      .sort((a, b) => {
        // Primary sort: hashrate
        if (b.hashrate !== a.hashrate) {
          return b.hashrate - a.hashrate;
        }
        // Secondary sort: total hashes
        return b.totalHashes - a.totalHashes;
      })
      .slice(0, 10); // Top 10 workers
      
  } catch (error) {
    console.error('Failed to generate worker leaderboard:', error);
    return [];
  }
}

// Format hashrate for display
export function formatHashrate(hashrate: number): string {
  if (hashrate >= 1e6) {
    return `${(hashrate / 1e6).toFixed(2)} MH/s`;
  } else if (hashrate >= 1e3) {
    return `${(hashrate / 1e3).toFixed(2)} KH/s`;
  } else {
    return `${hashrate.toFixed(2)} H/s`;
  }
}

// Calculate share efficiency
export function calculateEfficiency(validShares: number, invalidShares: number): number {
  const totalShares = validShares + invalidShares;
  if (totalShares === 0) return 0;
  return (validShares / totalShares) * 100;
}