import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  RefreshCw, 
  Radio,
  Clock,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  source: string;
  timestamp: string;
  type: string;
  data: any;
}

interface LiveActivityFeedProps {
  className?: string;
}

export default function LiveActivityFeed({ className }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const { toast } = useToast();

  const fetchActivityFeed = async () => {
    try {
      setIsLoading(true);
      
      // Fetch from ecosystem webhook
      const { data, error } = await supabase.functions.invoke('ecosystem-webhook', {
        body: { path: '/activity/feed?limit=20' }
      });

      if (error) throw error;

      if (data?.success && data?.activities) {
        setActivities(data.activities);
        setIsLive(true);
        console.log(`✅ Loaded ${data.activities.length} activities from ecosystem webhook`);
      } else {
        throw new Error('Invalid response format');
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to fetch activity feed:', err);
      setError('Failed to load activity feed');
      setIsLive(false);
      toast({
        title: "Activity Feed Error",
        description: "Failed to fetch ecosystem activities",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityFeed();
    const interval = setInterval(fetchActivityFeed, 15000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mining_update':
        return <TrendingUp className="h-4 w-4" />;
      case 'meshnet_update':
        return <Radio className="h-4 w-4" />;
      case 'agent_discussion':
        return <Users className="h-4 w-4" />;
      case 'growth_update':
        return <Zap className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'supportxmr':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'meshnet':
        return 'bg-accent/10 text-accent border-accent/20';
      case 'agent_system':
        return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Live Activity Feed
              </CardTitle>
              <CardDescription>Real-time ecosystem updates</CardDescription>
            </div>
            <div className="status-indicator bg-muted animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="activity-item animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
              {isLive && (
                <Badge variant="outline" className="ml-2 text-xs neon-border animate-pulse">
                  LIVE
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Real-time ecosystem updates</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`status-indicator ${isLive ? 'bg-primary' : 'bg-muted'}`} />
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchActivityFeed}
              disabled={isLoading}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchActivityFeed} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activities
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="activity-item"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getActivityColor(activity.source)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-medium line-clamp-1">
                            {activity.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {activity.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {activity.source}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}