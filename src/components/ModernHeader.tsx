import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Web3Button } from "@/components/ui/web3-button";
import { Shield, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationTabs = [
  { id: "dao", label: "DAO", to: "/" },
  { id: "chat", label: "Chat", to: "/chat" },
  { id: "agents", label: "Agents", to: "/agents" },
  { id: "license", label: "License", to: "/license" },
];

export default function ModernHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname === "/") return "dao";
    if (location.pathname.includes("chat")) return "chat";
    if (location.pathname.includes("agents")) return "agents";
    if (location.pathname.includes("license")) return "license";
    return "dao";
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 max-w-screen-2xl items-center justify-between px-3 sm:px-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-bold gradient-text">XMRT DAO</h1>
                <Badge variant="secondary" className="text-xs px-1.5 sm:px-2 py-0.5 hidden sm:inline-flex">
                  Testnet
                </Badge>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {/* Navigation Tabs */}
            <Tabs value={getActiveTab()} className="w-auto">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                {navigationTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    asChild
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground"
                  >
                    <Link to={tab.to}>{tab.label}</Link>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Status and Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-3 sm:gap-4">
              <Badge variant="outline" className="text-xs">
                Connected
              </Badge>
              <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                Block: 2,847,392
              </span>
            </div>
            
            <div className="hidden sm:block">
              <Web3Button />
            </div>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Enhanced */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 sm:top-16 bg-background/95 backdrop-blur-sm z-40">
          <div className="container p-3 sm:p-4">
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Mobile Navigation */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {navigationTabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={getActiveTab() === tab.id ? "default" : "outline"}
                    asChild
                    className="h-12 sm:h-10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to={tab.to}>{tab.label}</Link>
                  </Button>
                ))}
              </div>

              {/* Mobile Web3 Button */}
              <div className="flex justify-center">
                <Web3Button />
              </div>

              {/* Mobile Status */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 pt-4 border-t">
                <Badge variant="outline" className="text-xs">
                  Connected
                </Badge>
                <span className="text-xs sm:text-sm text-muted-foreground font-mono">
                  Block: 2,847,392
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}