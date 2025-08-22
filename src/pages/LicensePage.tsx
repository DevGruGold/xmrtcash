import ModernHeader from "@/components/ModernHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Code, Globe, ExternalLink, Download } from "lucide-react";

const licenses = [
  {
    name: "XMRT Core Protocol",
    version: "1.0.0",
    license: "MIT License",
    description: "Core smart contracts and protocol logic for XMRT ecosystem",
    status: "active",
    lastUpdated: "2024-01-15"
  },
  {
    name: "Mobile Mining SDK",
    version: "2.1.3", 
    license: "Apache 2.0",
    description: "Software development kit for mobile mining applications",
    status: "active",
    lastUpdated: "2024-01-10"
  },
  {
    name: "Mesh Network Library",
    version: "0.8.2",
    license: "GNU GPL v3",
    description: "Decentralized mesh networking implementation",
    status: "beta",
    lastUpdated: "2024-01-08"
  },
  {
    name: "Privacy Utilities",
    version: "1.5.1",
    license: "BSD 3-Clause",
    description: "Privacy-preserving utilities and cryptographic functions",
    status: "active", 
    lastUpdated: "2024-01-12"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>;
    case "beta":
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Beta</Badge>;
    case "deprecated":
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Deprecated</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function LicensePage() {
  return (
    <div className="min-h-screen bg-background">
      <ModernHeader />
      
      <main className="container max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Licenses & Legal</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Open source licenses, legal compliance, and intellectual property information for the XMRT ecosystem
          </p>
        </div>

        {/* License Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="w-5 h-5 text-primary" />
                Open Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-sm text-muted-foreground">of core components</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                License Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-sm text-muted-foreground">different license types</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">✓</div>
              <p className="text-sm text-muted-foreground">global standards</p>
            </CardContent>
          </Card>
        </div>

        {/* Component Licenses */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Component Licenses</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {licenses.map((component, index) => (
                <Card key={index} className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{component.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">v{component.version}</Badge>
                          {getStatusBadge(component.status)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <CardDescription>{component.description}</CardDescription>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">License:</span>
                        <span className="font-medium">{component.license}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{component.lastUpdated}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy Policy
              </CardTitle>
              <CardDescription>
                How we handle your data and protect your privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                XMRT DAO is committed to protecting user privacy through zero-knowledge protocols, 
                decentralized infrastructure, and minimal data collection practices.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Zero personal data collection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Decentralized data storage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Anonymous transaction processing</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Full Policy
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Terms of Service
              </CardTitle>
              <CardDescription>
                Terms and conditions for using XMRT DAO services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                By using XMRT DAO services, you agree to our decentralized governance model, 
                open-source development principles, and community-driven decision making.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Community governance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Open source contributions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Decentralized operations</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Full Terms
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}