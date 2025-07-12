
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
  LogIn, LogOut, Code
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
    <div className="flex min-h-screen bg-gradient-to-br from-mocha-900 via-mocha-700 to-mocha-500">
      <MochaSidebar />
      <main className="flex-1 flex flex-col">
        <MochaHeader />
        <section className="flex-1 p-4 overflow-auto">
          <div className="w-full max-w-7xl mx-auto">
            {/* Simulation header */}
            <div className="bg-mocha-100/40 rounded-xl shadow-xl p-6 backdrop-blur-lg mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold font-mocha text-mocha-800">XMRT DAO AI Simulation</h2>
                  <p className="text-mocha-600">
                    Simulating autonomous governance through specialized AI personas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={speed} 
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="bg-mocha-100/80 border border-mocha-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="1000">Fast (1s)</option>
                    <option value="2000">Medium (2s)</option>
                    <option value="5000">Slow (5s)</option>
                  </select>
                  
                  {!isRunning ? (
                    <Button 
                      onClick={startSimulation} 
                      disabled={isRunning}
                      className="bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
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
                      className="bg-mocha-500 text-mocha-100 hover:bg-mocha-600"
                    >
                      Next Day
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Day progress indicator */}
              {actions.length > 0 && (
                <div className="mt-4 flex items-center">
                  <div className="text-mocha-700 font-semibold mr-3">
                    Day: {step} / {simulationScenarios.length}
                  </div>
                  <div className="flex-1 bg-mocha-200 rounded-full h-2">
                    <div 
                      className="bg-mocha-700 h-2 rounded-full"
                      style={{ width: `${(step / simulationScenarios.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* AI Personas */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold font-mocha text-mocha-800 mb-3">DAO Governance AIs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personas.map((persona) => (
                  <Card 
                    key={persona.id} 
                    className={`p-4 border ${persona.color.split(' ')[0]} bg-white/90`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className={persona.color}>
                        <div className="h-10 w-10 rounded-full flex items-center justify-center">
                          {persona.icon}
                        </div>
                      </Avatar>
                      <div>
                        <h4 className="font-bold">{persona.name}</h4>
                        <Badge variant="outline" className="font-normal">
                          {persona.role}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-mocha-600 mt-2">{persona.description}</p>
                    <div className="mt-3">
                      <h5 className="text-xs font-semibold mb-1">Decision Criteria:</h5>
                      <ul className="text-xs text-mocha-600">
                        {persona.decisionCriteria.map((criteria, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-mocha-400"></span>
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
                <h3 className="text-xl font-semibold font-mocha text-mocha-800 mb-3">DAO Activity</h3>
                <div className="bg-mocha-100/40 rounded-xl shadow-lg backdrop-blur-lg p-4">
                  <div className="space-y-4">
                    {actions.map((action) => {
                      const actor = personas.find(p => p.id === action.actor);
                      
                      return (
                        <div key={action.id} className="bg-white rounded-lg border border-mocha-200 p-4 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className={actor?.color || ""}>
                                <div className="h-8 w-8 rounded-full flex items-center justify-center">
                                  {actor?.icon}
                                </div>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">{action.action}</h4>
                                <div className="flex items-center gap-2 text-sm text-mocha-600">
                                  <span>{actor?.name} ({actor?.role})</span>
                                  <span>•</span>
                                  <span>{action.timestamp.toLocaleTimeString()}</span>
                                </div>
                              </div>
                            </div>
                            <Badge
                              className={
                                action.status === "executed" ? "bg-green-100 text-green-800 border-green-300" :
                                action.status === "rejected" ? "bg-red-100 text-red-800 border-red-300" :
                                "bg-amber-100 text-amber-800 border-amber-300"
                              }
                            >
                              {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <p className="mt-2 text-mocha-700">{action.description}</p>
                          
                          {/* Votes */}
                          <div className="mt-3">
                            <h5 className="text-sm font-semibold">Votes:</h5>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {Object.entries(action.votes).map(([personaId, vote]) => {
                                const voter = personas.find(p => p.id === personaId);
                                return (
                                  <Badge
                                    key={personaId}
                                    variant="outline"
                                    className={
                                      vote === "approve" ? "bg-green-50 border-green-200" :
                                      vote === "reject" ? "bg-red-50 border-red-200" :
                                      "bg-gray-50 border-gray-200"
                                    }
                                  >
                                    {voter?.name}: {vote}
                                  </Badge>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Voting buttons - only for pending actions */}
                          {action.status === "pending" && !isRunning && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {personas.map(persona => {
                                // Skip if already voted
                                if (action.votes[persona.id]) return null;
                                
                                return (
                                  <div key={persona.id} className="flex items-center gap-1">
                                    <span className="text-xs">{persona.name}:</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                      onClick={() => handleVote(action.id, persona.id, "approve")}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                      onClick={() => handleVote(action.id, persona.id, "reject")}
                                    >
                                      Reject
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 px-2 text-xs"
                                      onClick={() => handleVote(action.id, persona.id, "abstain")}
                                    >
                                      Abstain
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-mocha-100/40 rounded-xl shadow-xl p-8 backdrop-blur-lg text-center">
                <h3 className="text-xl font-semibold font-mocha text-mocha-800 mb-3">Simulation Ready</h3>
                <p className="text-mocha-600 mb-6">
                  Click "Start Simulation" to see how an AI-governed DAO would operate the XMRT token ecosystem
                </p>
                <Button 
                  onClick={startSimulation}
                  className="bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
                >
                  Start Simulation
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
