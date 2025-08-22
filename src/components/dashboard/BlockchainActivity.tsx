import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, Vote, FileText, TrendingUp } from "lucide-react";

const activityData = [
  {
    id: 1,
    type: "Mining Reward",
    address: "0x2a8b...d3e9",
    amount: "0.15 XMR",
    time: "6:43:17 PM",
    icon: Activity,
    color: "text-green-500"
  },
  {
    id: 2,
    type: "Cross-chain Bridge",
    address: "0x8d2e...f7a4",
    amount: "$3,100",
    time: "6:43:05 PM",
    icon: TrendingUp,
    color: "text-blue-500"
  },
  {
    id: 3,
    type: "Smart Contract",
    address: "0x9e4d...c1f8",
    amount: "$850",
    time: "6:42:53 PM",
    icon: FileText,
    color: "text-orange-500"
  },
  {
    id: 4,
    type: "DAO Vote",
    address: "0x7f3a...b2d5",
    amount: "125 votes",
    time: "6:42:30 PM",
    icon: Vote,
    color: "text-purple-500"
  },
  {
    id: 5,
    type: "Governance Proposal",
    address: "0x5c8e...a9f1",
    amount: "Proposal #42",
    time: "6:41:15 PM",
    icon: FileText,
    color: "text-indigo-500"
  }
];

export default function BlockchainActivity() {
  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          Blockchain Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activityData.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-background ${activity.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{activity.type}</span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {activity.address}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-sm">{activity.amount}</div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}