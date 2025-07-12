
import { Bell, Settings, User, DollarSign, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function MochaHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-border/50 h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 relative z-10">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-neon">
          <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">CashDapp</h1>
          <span className="text-xs text-muted-foreground hidden sm:block">by MobileMonero.com</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground shadow-neon hidden sm:flex"
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
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
