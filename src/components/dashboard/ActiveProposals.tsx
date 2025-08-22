import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vote, CheckCircle, FileText, Brain, Users } from "lucide-react";

const proposals = [
  {
    id: 42,
    title: "Increase Mining Rewards by 15%",
    status: "active",
    votes: 1247,
    aiRecommendation: "Support",
    confidence: 87,
    statusColor: "bg-green-500"
  },
  {
    id: 41,
    title: "Deploy Cross-chain Bridge to Polygon", 
    status: "passed",
    votes: 2156,
    aiRecommendation: "Support",
    confidence: 94,
    statusColor: "bg-blue-500"
  },
  {
    id: 40,
    title: "Update Governance Parameters",
    status: "draft", 
    votes: 0,
    aiRecommendation: "Review",
    confidence: 72,
    statusColor: "bg-yellow-500"
  }
];

export default function ActiveProposals() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">active</Badge>;
      case "passed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">passed</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Support":
        return "text-green-500";
      case "Review":
        return "text-yellow-500";
      case "Oppose":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Vote className="w-5 h-5 text-primary" />
          Active Proposals
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {proposals.map((proposal) => (
          <div
            key={proposal.id}
            className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-border/40"
          >
            <div className="flex items-center gap-4 flex-1">
              {/* Status Indicator */}
              <div className={`w-3 h-3 rounded-full ${proposal.statusColor}`}></div>
              
              {/* Proposal Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm mb-1">#{proposal.id}</h3>
                    <h4 className="font-semibold mb-2">{proposal.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>Votes: {proposal.votes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        <span>AI Recommendation:</span>
                        <span className={getRecommendationColor(proposal.aiRecommendation)}>
                          {proposal.aiRecommendation}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Confidence:</span>
                        <span className="font-medium">{proposal.confidence}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(proposal.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}