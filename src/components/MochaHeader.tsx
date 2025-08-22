
import { Bell, Settings, User, DollarSign, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function MochaHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="glass-card h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 relative z-50 border-b border-primary/20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-glow-pulse">
            <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold gradient-text">CashDapp</h1>
            <span className="text-xs text-muted-foreground hidden sm:block">MobileMonero MeshMiner</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <a 
            href="https://mobilemonero.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="neon-button px-3 py-1.5 rounded-lg text-sm font-medium hidden sm:flex items-center"
          >
            Start Mining
          </a>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="neon-button hidden sm:flex"
          >
            Connect Wallet
          </Button>
          
          <div className="hidden sm:flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-primary" />
            </button>
          </div>
          
          <button 
            className="sm:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Menu className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 top-14 bg-background/95 backdrop-blur-sm z-40">
          <nav className="p-4 space-y-4">
            <a 
              href="https://mobilemonero.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground shadow-neon px-4 py-3 rounded-lg text-center font-medium transition-all duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Mining
            </a>
            
            <Button 
              variant="outline" 
              className="w-full bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground shadow-neon"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connect Wallet
            </Button>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <button 
                className="flex flex-col items-center gap-2 p-3 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Alerts</span>
              </button>
              <button 
                className="flex flex-col items-center gap-2 p-3 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Settings</span>
              </button>
              <button 
                className="flex flex-col items-center gap-2 p-3 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Profile</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
