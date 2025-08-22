import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, Zap, Users } from 'lucide-react';
import { getWorkerLeaderboard, formatHashrate, calculateEfficiency, type WorkerStats } from '@/lib/worker-tracking';
import { useToast } from '@/components/ui/use-toast';

export default function WorkerLeaderboard() {
  const [workers, setWorkers] = useState<WorkerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkerData = async () => {
    try {
      setError(null);
      const workerData = await getWorkerLeaderboard();
      setWorkers(workerData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch worker data';
      setError(errorMessage);
      toast({
        title: "Error fetching worker data",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchWorkerData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchWorkerData();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Active Miners Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && workers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Active Miners Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalActiveWorkers = workers.length;
  const totalHashrate = workers.reduce((sum, worker) => sum + worker.hashrate, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Active Miners Leaderboard
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Active Miners:</span>
            <Badge variant="secondary">{totalActiveWorkers}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Total Hashrate:</span>
            <Badge variant="secondary">{formatHashrate(totalHashrate)}</Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {workers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No active miners found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Miners will appear here once they start contributing hashrate
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {workers.map((worker, index) => {
              const efficiency = calculateEfficiency(worker.validShares, worker.invalidShares);
              const isTop3 = index < 3;
              
              return (
                <div 
                  key={worker.workerId}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                    isTop3 ? 'bg-primary/5 border-primary/20' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                      index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    
                    {/* Worker Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Miner {worker.workerId}</span>
                        {worker.isActive && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            ONLINE
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Efficiency: {efficiency.toFixed(1)}%</span>
                        <span>Shares: {worker.validShares.toLocaleString()}</span>
                        {worker.amountDue > 0 && (
                          <span>Due: {(worker.amountDue / 1e12).toFixed(6)} XMR</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hashrate */}
                  <div className="text-right">
                    <div className="font-medium">{formatHashrate(worker.hashrate)}</div>
                    <div className="text-sm text-muted-foreground">
                      {(worker.totalHashes / 1e6).toFixed(1)}M hashes
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {workers.length > 0 && (
          <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}