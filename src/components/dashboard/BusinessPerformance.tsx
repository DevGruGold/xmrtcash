import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Brain, Wallet, Users, Vote } from "lucide-react";

const performanceMetrics = [
  {
    label: "Revenue ($K)",
    value: "$127.5K",
    change: "+23%",
    positive: true,
    icon: DollarSign
  },
  {
    label: "AI Efficiency %", 
    value: "94.2%",
    change: "+5.1%",
    positive: true,
    icon: Brain
  }
];

const additionalStats = [
  {
    label: "Treasury Balance",
    value: "$2.4M",
    icon: Wallet
  },
  {
    label: "Active Proposals", 
    value: "3",
    icon: Vote
  },
  {
    label: "Governance Participation",
    value: "89%",
    icon: Users
  }
];

export default function BusinessPerformance() {
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Business Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {performanceMetrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <Badge 
                    variant={metric.positive ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {metric.change}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Stats */}
        <div className="space-y-3 pt-4 border-t border-border/40">
          {additionalStats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <span className="font-medium">{stat.value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}