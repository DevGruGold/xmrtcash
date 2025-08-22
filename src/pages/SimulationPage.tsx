import { useState, useEffect } from "react";
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { 
  Settings, User, Database, Shield, ArrowRight, 
  LogIn, Code
} from "lucide-react";

// AI persona types and data
interface AIAction {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  description: string;
  status: "pending" | "approved" | "rejected" | "executed";
  votes: {
    [key: string]: "approve" | "reject" | "abstain";
  };
}

interface AIPersona {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  decisionCriteria: string[];
}

export default function SimulationPage() {
  const [actions, setActions] = useState<AIAction[]>([]);
  const [step, setStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2000); // milliseconds between actions
  
  // AI Personas
  const personas: AIPersona[] = [
    {
      id: "admin",
      name: "Guardian",
      role: "Admin",
      description: "Oversight AI with emergency powers",
      icon: <Settings className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800 border-purple-300",
      decisionCriteria: [
        "Acts only in emergency situations",
        "Can revoke any role in case of malicious activity",
        "Prioritizes system integrity above all"
      ]
    },
    {
      id: "ceo",
      name: "Strategist",
      role: "CEO",
      description: "Strategic decision maker",
      icon: <User className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800 border-blue-300",
      decisionCriteria: [
        "Evaluates market opportunities",
        "Focuses on growth and partnerships",
        "Makes long-term strategic decisions"
      ]
    },
    {
      id: "cfo",
      name: "Treasurer",
      role: "CFO",
      description: "Financial manager",
      icon: <Database className="h-5 w-5" />,
      color: "bg-green-100 text-green-800 border-green-300",
      decisionCriteria: [
        "Manages treasury funds",
        "Sets fee structures",
        "Ensures financial sustainability"
      ]
    },
    {
      id: "cto",
      name: "Architect",
      role: "CTO",
      description: "Technical director",
      icon: <Code className="h-5 w-5" />,
      color: "bg-amber-100 text-amber-800 border-amber-300",
      decisionCriteria: [
        "Oversees technical improvements",
        "Evaluates security implications",
        "Plans contract upgrades"
      ]
    },
    {
      id: "compliance",
      name: "Regulator",
      role: "Compliance Officer",
      description: "Regulatory focused AI",
      icon: <Shield className="h-5 w-5" />,
      color: "bg-red-100 text-red-800 border-red-300",
      decisionCriteria: [
        "Ensures regulatory compliance",
        "Reviews KYC/AML procedures",
        "Monitors suspicious activity"
      ]
    },
    {
      id: "cashdapp",
      name: "Facilitator",
      role: "CashDapp Operator",
      description: "Fiat/crypto interface manager",
      icon: <ArrowRight className="h-5 w-5" />,
      color: "bg-indigo-100 text-indigo-800 border-indigo-300",
      decisionCriteria: [
        "Manages fiat on/off ramps",
        "Optimizes transaction flows",
        "Interfaces with traditional finance"
      ]
    }
  ];
  
  // Predefined simulation scenarios
  const simulationScenarios = [
    // Day 1: Initial setup
    [
      {
        id: "action-1",
        timestamp: new Date(),
        actor: "admin",
        action: "System Initialization",
        description: "Guardian AI initialized XMRT DAO with role assignments to specialized AI personas",
        status: "executed" as const,
        votes: { admin: "approve" as const }
      },
      {
        id: "action-2",
        timestamp: new Date(),
        actor: "ceo",
        action: "Strategy Proposal",
        description: "Strategist AI proposes initial market entry strategy for XMRT token",
        status: "pending" as const,
        votes: { ceo: "approve" as const }
      }
    ],
    // Day 2: First proposals and voting
    [
      {
        id: "action-3",
        timestamp: new Date(),
        actor: "cfo",
        action: "Fee Structure Proposal",
        description: "Treasurer AI proposes 0.5% fee structure for wrap/unwrap operations",
        status: "pending" as const,
        votes: { cfo: "approve" as const, ceo: "approve" as const }
      },
      {
        id: "action-4",
        timestamp: new Date(),
        actor: "cto",
        action: "Security Audit",
        description: "Architect AI initiates comprehensive security audit of smart contract",
        status: "pending" as const,
        votes: { cto: "approve" as const, admin: "approve" as const }
      }
    ],
    // Day 3: Compliance and operations
    [
      {
        id: "action-5",
        timestamp: new Date(),
        actor: "compliance",
        action: "Compliance Framework",
        description: "Regulator AI establishes compliance framework for all operations",
        status: "pending" as const,
        votes: { compliance: "approve" as const, admin: "approve" as const, ceo: "abstain" as const }
      },
      {
        id: "action-6",
        timestamp: new Date(),
        actor: "cashdapp",
        action: "Fiat Integration",
        description: "Facilitator AI proposes integration with 3 new fiat on-ramp providers",
        status: "pending" as const,
        votes: { cashdapp: "approve" as const, cfo: "approve" as const, compliance: "approve" as const }
      }
    ],
    // Day 4: Crisis management
    [
      {
        id: "action-7",
        timestamp: new Date(),
        actor: "cto",
        action: "Vulnerability Response",
        description: "Architect AI detects minor vulnerability and proposes immediate patch",
        status: "pending" as const,
        votes: { cto: "approve" as const, admin: "approve" as const }
      },
      {
        id: "action-8",
        timestamp: new Date(),
        actor: "admin",
        action: "Emergency Lock",
        description: "Guardian AI temporarily locks unwrap operations while patch is applied",
        status: "executed" as const,
        votes: { admin: "approve" as const, cto: "approve" as const }
      }
    ],
    // Day 5: Resolution and improvement
    [
      {
        id: "action-9",
        timestamp: new Date(),
        actor: "admin",
        action: "Resume Operations",
        description: "Guardian AI verifies patch and resumes normal operations",
        status: "executed" as const,
        votes: { admin: "approve" as const, cto: "approve" as const, ceo: "approve" as const }
      },
      {
        id: "action-10",
        timestamp: new Date(),
        actor: "ceo",
        action: "Growth Strategy",
        description: "Strategist AI proposes new marketing initiatives to increase adoption",
        status: "pending" as const,
        votes: { ceo: "approve" as const, cfo: "approve" as const }
      }
    ]
  ];
  
  // Start simulation
  const startSimulation = () => {
    setIsRunning(true);
    setActions([...simulationScenarios[0]]);
    setStep(1);
    
    toast({
      title: "Simulation Started",
      description: "Day 1: DAO initialization and initial proposals",
    });
  };
  
  // Stop simulation
  const stopSimulation = () => {
    setIsRunning(false);
    toast({
      title: "Simulation Paused",
      description: "You can continue or reset the simulation",
    });
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsRunning(false);
    setActions([]);
    setStep(1);
    toast({
      title: "Simulation Reset",
      description: "All progress has been cleared",
    });
  };
  
  // Handle voting
  const handleVote = (actionId: string, persona: string, vote: "approve" | "reject" | "abstain") => {
    setActions(prevActions => 
      prevActions.map(action => {
        if (action.id === actionId) {
          const newVotes = { ...action.votes, [persona]: vote };
          
          // Check if action should be executed (simple majority rule)
          const approvals = Object.values(newVotes).filter(v => v === "approve").length;
          const rejections = Object.values(newVotes).filter(v => v === "reject").length;
          
          let newStatus = action.status;
          if (approvals >= 3 && approvals > rejections) {
            newStatus = "executed";
            toast({
              title: "Action Executed",
              description: `${action.action} has been approved and executed`,
            });
          } else if (rejections >= 3) {
            newStatus = "rejected";
            toast({
              title: "Action Rejected",
              description: `${action.action} has been rejected`,
            });
          }
          
          return { ...action, votes: newVotes, status: newStatus };
        }
        return action;
      })
    );
  };
  
  // Advance simulation to next day
  const advanceDay = () => {
    if (step < simulationScenarios.length) {
      const nextStep = step + 1;
      setStep(nextStep);
      
      // Update actions with new day's events
      setActions(prevActions => {
        // Get new day's actions and update their timestamps
        const newDayActions = simulationScenarios[nextStep - 1].map(action => ({
          ...action,
          timestamp: new Date()
        }));
        
        return [...prevActions, ...newDayActions];
      });
      
      toast({
        title: `Day ${nextStep} Simulation`,
        description: `Advancing to day ${nextStep} of DAO operations`,
      });
    } else {
      toast({
        title: "Simulation Complete",
        description: "You've reached the end of the predefined simulation",
      });
      setIsRunning(false);
    }
  };
  
  // Auto-advance simulation based on timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && step < simulationScenarios.length) {
      timer = setTimeout(() => {
        advanceDay();
      }, speed);
    }
    
    return () => clearTimeout(timer);
  }, [isRunning, step, speed]);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex">
        <MochaSidebar />
        
        <div className="flex-1 lg:ml-0">
          <MochaHeader />
          
          <main className="p-3 sm:p-4 lg:p-6 space-y-6 pb-20">
            <div className="max-w-7xl mx-auto">
              {/* Simulation header */}
              <Card className="glass-card p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">XMRT DAO AI Simulation</h2>
                    <p className="text-muted-foreground">
                      Simulating autonomous governance through specialized AI personas
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={speed} 
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="bg-card border border-border rounded px-3 py-1 text-sm text-foreground"
                    >
                      <option value="1000">Fast (1s)</option>
                      <option value="2000">Medium (2s)</option>
                      <option value="5000">Slow (5s)</option>
                    </select>
                    
                    {!isRunning ? (
                      <Button 
                        onClick={startSimulation} 
                        disabled={isRunning}
                        className="neon-button"
                      >
                        {actions.length > 0 ? "Continue" : "Start Simulation"}
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopSimulation}
                        variant="destructive"
                      >
                        Pause
                      </Button>
                    )}
                    
                    <Button 
                      onClick={resetSimulation}
                      variant="outline"
                    >
                      Reset
                    </Button>
                    
                    {!isRunning && step < simulationScenarios.length && (
                      <Button 
                        onClick={advanceDay}
                        className="neon-button"
                      >
                        Next Day
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Day progress indicator */}
                {actions.length > 0 && (
                  <div className="mt-4 flex items-center">
                    <div className="text-foreground font-semibold mr-3">
                      Day: {step} / {simulationScenarios.length}
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(step / simulationScenarios.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </Card>
              
              {/* AI Personas */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-3">DAO Governance AIs</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {personas.map((persona) => (
                    <Card 
                      key={persona.id} 
                      className="glass-card p-4 hover:shadow-neon-strong transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="bg-primary/10 text-primary border border-primary/20">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center">
                            {persona.icon}
                          </div>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-foreground">{persona.name}</h4>
                          <Badge variant="outline" className="font-normal">
                            {persona.role}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{persona.description}</p>
                      <div className="mt-3">
                        <h5 className="text-xs font-semibold mb-1 text-foreground">Decision Criteria:</h5>
                        <ul className="text-xs text-muted-foreground">
                          {persona.decisionCriteria.map((criteria, idx) => (
                            <li key={idx} className="flex items-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-primary"></span>
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* DAO Activity Feed */}
              {actions.length > 0 ? (
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">DAO Activity</h3>
                  <Card className="glass-card p-4">
                    <div className="space-y-4">
                      {actions.map((action) => {
                        const actor = personas.find(p => p.id === action.actor);
                        
                        return (
                          <Card key={action.id} className="glass-card p-4 border border-border/50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <Avatar className="bg-primary/10 text-primary border border-primary/20">
                                  <div className="h-8 w-8 rounded-full flex items-center justify-center">
                                    {actor?.icon}
                                  </div>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold text-foreground">{action.action}</h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>{actor?.name} ({actor?.role})</span>
                                    <span>•</span>
                                    <span>{action.timestamp.toLocaleTimeString()}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge
                                className={
                                  action.status === "executed" ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400" :
                                  action.status === "rejected" ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400" :
                                  "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }
                              >
                                {action.status}
                              </Badge>
                            </div>
                            
                            <p className="mt-3 text-sm text-muted-foreground pl-11">{action.description}</p>
                            
                            {/* Voting interface */}
                            {action.status === "pending" && (
                              <div className="mt-4 pl-11">
                                <div className="flex flex-wrap gap-2">
                                  {personas.map((persona) => {
                                    const currentVote = action.votes[persona.id];
                                    
                                    return (
                                      <div key={persona.id} className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{persona.name}:</span>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant={currentVote === "approve" ? "default" : "outline"}
                                            onClick={() => handleVote(action.id, persona.id, "approve")}
                                            className="h-6 px-2 text-xs"
                                          >
                                            ✓
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant={currentVote === "reject" ? "destructive" : "outline"}
                                            onClick={() => handleVote(action.id, persona.id, "reject")}
                                            className="h-6 px-2 text-xs"
                                          >
                                            ✗
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant={currentVote === "abstain" ? "secondary" : "outline"}
                                            onClick={() => handleVote(action.id, persona.id, "abstain")}
                                            className="h-6 px-2 text-xs"
                                          >
                                            ~
                                          </Button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </Card>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="glass-card text-center py-12">
                  <LogIn className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No DAO Activity Yet</h3>
                  <p className="text-muted-foreground mb-4">Start the simulation to see autonomous AI governance in action</p>
                  <Button 
                    onClick={startSimulation}
                    className="neon-button"
                  >
                    Begin Simulation
                  </Button>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}