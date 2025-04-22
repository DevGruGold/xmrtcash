
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DeploymentPanelProps {
  isDeploying: boolean;
  onDeploy: (e: React.FormEvent) => void;
}

export default function DeploymentPanel({ isDeploying, onDeploy }: DeploymentPanelProps) {
  const [admin, setAdmin] = useState("0x3F43E75Aaba2c2fD6E227C10c6E7DC125A93DeB3");
  const [ceo, setCeo] = useState("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199");
  const [cfo, setCfo] = useState("0xdD2FD4581271e230360230F9337D5c0430Bf44C0");
  const [cto, setCto] = useState("0xbDA5747bFD65F08deb54cb465eB87D40e51B197E");
  const [complianceOfficer, setComplianceOfficer] = useState("0x2546BcD3c84621e976D8185a91A922aE77ECEc30");
  const [cashDappOperator, setCashDappOperator] = useState("0xcd3B766CCDd6AE721141F452C550Ca635964ce71");
  
  return (
    <form onSubmit={onDeploy} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="admin">Admin Address</Label>
          <Input 
            id="admin"
            value={admin}
            onChange={(e) => setAdmin(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="ceo">CEO Address</Label>
          <Input 
            id="ceo"
            value={ceo}
            onChange={(e) => setCeo(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cfo">CFO Address</Label>
          <Input 
            id="cfo"
            value={cfo}
            onChange={(e) => setCfo(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cto">CTO Address</Label>
          <Input 
            id="cto"
            value={cto}
            onChange={(e) => setCto(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="compliance">Compliance Officer Address</Label>
          <Input 
            id="compliance"
            value={complianceOfficer}
            onChange={(e) => setComplianceOfficer(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cashDapp">CashDapp Operator Address</Label>
          <Input 
            id="cashDapp"
            value={cashDappOperator}
            onChange={(e) => setCashDappOperator(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
      </div>
      
      <div className="space-y-3 pt-4">
        <p className="text-sm text-mocha-600">Gas Settings (Optional)</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="gasPrice">Gas Price (Gwei)</Label>
            <Input id="gasPrice" type="number" defaultValue={5} min={1} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gasLimit">Gas Limit</Label>
            <Input id="gasLimit" type="number" defaultValue={3000000} min={100000} />
          </div>
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-mocha-700 text-mocha-100 hover:bg-mocha-800 font-semibold py-3"
        disabled={isDeploying}
      >
        {isDeploying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Deploying...
          </>
        ) : (
          "Deploy Contract"
        )}
      </Button>
    </form>
  );
}
