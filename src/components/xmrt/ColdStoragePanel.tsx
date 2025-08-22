import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Snowflake, 
  Shield, 
  Download, 
  Upload,
  QrCode,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Printer,
  Copy,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ColdStoragePanel() {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [showSeed, setShowSeed] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const { toast } = useToast();

  // Mock seed phrase for demo
  const mockSeedPhrase = "abandon ability able about above absent absorb abstract absurd abuse access accident account accuse achieve acid acoustic acquire across act action actor actress actual";

  const generateColdWallet = () => {
    if (!walletName.trim()) {
      toast({
        title: "Wallet Name Required",
        description: "Please enter a name for your cold wallet",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate wallet generation
    setTimeout(() => {
      setSeedPhrase(mockSeedPhrase);
      setIsGenerating(false);
      toast({
        title: "Cold Wallet Generated",
        description: "Your offline wallet has been securely generated",
      });
    }, 2000);
  };

  const copySeedPhrase = () => {
    navigator.clipboard.writeText(seedPhrase);
    toast({
      title: "Seed Phrase Copied",
      description: "Seed phrase copied to clipboard - store securely!",
    });
  };

  const printWallet = () => {
    toast({
      title: "Printing Wallet",
      description: "Opening print dialog for paper wallet backup",
    });
    // In real app, this would format and print the wallet
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon">
              <Snowflake className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="gradient-text">Cold Storage</CardTitle>
              <CardDescription>Offline wallet management and security</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Warning Card */}
      <Card className="glass-card border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-yellow-500">Security Notice</h4>
              <p className="text-sm text-muted-foreground">
                Cold storage wallets are generated offline and never touch the internet. 
                Store your seed phrase securely - losing it means losing access to your funds permanently.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass-card border-primary/20">
          <TabsTrigger value="create">Create Wallet</TabsTrigger>
          <TabsTrigger value="restore">Restore Wallet</TabsTrigger>
          <TabsTrigger value="paper">Paper Wallet</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Generate Cold Wallet
              </CardTitle>
              <CardDescription>
                Create a new offline wallet for maximum security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet Name</Label>
                <Input
                  id="wallet-name"
                  placeholder="My Cold Storage Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="border-primary/20"
                />
              </div>

              <Button
                onClick={generateColdWallet}
                disabled={isGenerating}
                className="w-full h-12 bg-primary hover:bg-primary/90 shadow-neon"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating Secure Wallet...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Snowflake className="w-4 h-4" />
                    Generate Cold Wallet
                  </div>
                )}
              </Button>

              {seedPhrase && (
                <div className="space-y-4 p-4 bg-muted/20 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-primary">Seed Phrase Generated</h4>
                    <Badge variant="outline" className="neon-border bg-green-500/10 text-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Secure
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">25-Word Recovery Phrase</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSeed(!showSeed)}
                      >
                        {showSeed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    
                    <div className="p-3 bg-background/50 rounded border font-mono text-sm">
                      {showSeed ? seedPhrase : "••• ••••• •••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• ••••• •••••"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySeedPhrase}
                      className="flex-1 border-primary/20"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Phrase
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={printWallet}
                      className="flex-1 border-primary/20"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Print Backup
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Restore Cold Wallet
              </CardTitle>
              <CardDescription>
                Import an existing wallet using your seed phrase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restore-name">Wallet Name</Label>
                <Input
                  id="restore-name"
                  placeholder="Restored Wallet"
                  className="border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seed-input">Seed Phrase (25 words)</Label>
                <textarea
                  id="seed-input"
                  placeholder="Enter your 25-word recovery phrase here..."
                  className="w-full h-24 p-3 text-sm border border-primary/20 rounded-md bg-background/50 font-mono resize-none"
                />
              </div>

              <Button className="w-full h-12 bg-primary hover:bg-primary/90 shadow-neon">
                <Upload className="w-4 h-4 mr-2" />
                Restore Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paper" className="space-y-4">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Printer className="w-5 h-5 text-primary" />
                Paper Wallet Generator
              </CardTitle>
              <CardDescription>
                Create a printable paper wallet for ultimate offline storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Public Address</h4>
                  <div className="space-y-2">
                    <div className="w-32 h-32 bg-muted/20 rounded flex items-center justify-center mx-auto">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-mono text-center break-all p-2 bg-background/50 rounded">
                      4BrL51JCc9NGQ71kWhnYJLlT5JBDxJb4AJjhD...
                    </p>
                  </div>
                </Card>

                <Card className="p-4 border-primary/20">
                  <h4 className="font-medium mb-2">Private Key</h4>
                  <div className="space-y-2">
                    <div className="w-32 h-32 bg-muted/20 rounded flex items-center justify-center mx-auto">
                      <QrCode className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <p className="text-xs font-mono text-center break-all p-2 bg-background/50 rounded">
                      ••••••••••••••••••••••••••••••••••••••••••••••••••••
                    </p>
                  </div>
                </Card>
              </div>

              <Separator className="bg-primary/20" />

              <div className="space-y-2">
                <h4 className="font-medium">Paper Wallet Instructions</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Print this page on a secure, offline printer</p>
                  <p>• Store the printed wallet in a fireproof safe</p>
                  <p>• Never share or photograph the private key</p>
                  <p>• Consider laminating for long-term storage</p>
                </div>
              </div>

              <Button
                onClick={printWallet}
                className="w-full h-12 bg-primary hover:bg-primary/90 shadow-neon"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Paper Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Tips */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Cold Storage Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-primary">Do:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Generate wallets on offline devices</li>
                <li>• Store multiple backup copies</li>
                <li>• Use fireproof storage solutions</li>
                <li>• Test recovery before large deposits</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-red-500">Don't:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Share seed phrases with anyone</li>
                <li>• Store digitally or in cloud</li>
                <li>• Take photos of private keys</li>
                <li>• Use connected printers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}