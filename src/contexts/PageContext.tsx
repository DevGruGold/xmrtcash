import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupportXMRPoolStats, getXMRTWalletMining, getMoneroPrice } from '@/lib/real-data-api';

interface PageContextData {
  mining: {
    currentHashrate: number;
    amountDue: number;
    totalPaid: number;
    poolContribution: number;
    isActive: boolean;
    validShares: number;
    invalidShares: number;
  };
  pool: {
    hashRate: number;
    miners: number;
    totalBlocksFound: number;
    lastBlockFound: number;
    totalPayments: number;
  };
  market: {
    xmrPrice: number;
    xmrBtcRate: number;
  };
  activity: Array<{
    type: string;
    amount: string;
    time: string;
  }>;
  lastUpdated: Date;
}

interface PageContextType {
  data: PageContextData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageContextProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PageContextData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageData = async () => {
    try {
      setIsLoading(true);
      const [walletMining, poolStats, priceData] = await Promise.all([
        getXMRTWalletMining(),
        getSupportXMRPoolStats(),
        getMoneroPrice()
      ]);

      const now = new Date();
      const pageData: PageContextData = {
        mining: {
          currentHashrate: walletMining?.minerStats?.hash || 0,
          amountDue: walletMining?.minerStats?.amtDue || 0,
          totalPaid: walletMining?.minerStats?.amtPaid || 0,
          poolContribution: walletMining?.poolContribution || 0,
          isActive: (walletMining?.minerStats?.hash || 0) > 0,
          validShares: walletMining?.minerStats?.validShares || 0,
          invalidShares: walletMining?.minerStats?.invalidShares || 0,
        },
        pool: {
          hashRate: poolStats?.hashRate || 0,
          miners: poolStats?.miners || 0,
          totalBlocksFound: poolStats?.totalBlocksFound || 0,
          lastBlockFound: poolStats?.lastBlockFound || 0,
          totalPayments: poolStats?.totalPayments || 0,
        },
        market: {
          xmrPrice: priceData?.xmr?.usd || 0,
          xmrBtcRate: priceData?.xmr?.btc || 0,
        },
        activity: [
          {
            type: "Pool Mining",
            amount: `${((poolStats?.hashRate || 0) / 1000000).toFixed(1)} MH/s`,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            type: "Amount Due", 
            amount: `${((walletMining?.minerStats?.amtDue || 0) / 1000000000000).toFixed(6)} XMR`,
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ],
        lastUpdated: now
      };

      setData(pageData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch page data:', err);
      setError('Failed to load page data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
    const interval = setInterval(fetchPageData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const refresh = async () => {
    await fetchPageData();
  };

  return (
    <PageContext.Provider value={{ data, isLoading, error, refresh }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  const context = useContext(PageContext);
  if (context === undefined) {
    throw new Error('usePageContext must be used within a PageContextProvider');
  }
  return context;
}