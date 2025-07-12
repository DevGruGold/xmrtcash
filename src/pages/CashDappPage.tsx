import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid2x2, Smartphone } from "lucide-react";

export default function CashDappPage() {
  const [name, setName] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Invalid Name", description: "CashDapp name is required." });
      return;
    }
    setRegistered(true);
    toast({ title: "Registered", description: `CashDapp "${name}" registered (mock)` });
    setName("");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MochaSidebar />
      <main className="flex-1 flex flex-col lg:ml-0">
        <MochaHeader />
        
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          <div className="max-w-md mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-neon">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-neon">
                  <Grid2x2 className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">CashDapp Registration</CardTitle>
                <p className="text-sm text-muted-foreground">Register your CashDapp to manage fiat flows</p>
              </CardHeader>
              
              <CardContent className="px-4 sm:px-6">
                {!registered ? (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        CashDapp Name
                      </label>
                      <Input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. MoneroPay"
                        className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-neon"
                    >
                      <Grid2x2 className="w-4 h-4 mr-2" />
                      Register CashDapp
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto shadow-neon">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary mb-2">Registration Successful!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Your CashDapp is now registered and ready to manage fiat flows.
                      </p>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => setRegistered(false)}
                    >
                      Register Another CashDapp
                    </Button>
                  </div>
                )}
                
                <div className="mt-6 p-3 bg-muted/30 rounded-lg border border-border/30">
                  <p className="text-xs text-muted-foreground text-center">
                    <span className="text-primary font-medium">Demo Interface:</span> Registered CashDapps can manage fiat flows through the XMRT protocol
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}