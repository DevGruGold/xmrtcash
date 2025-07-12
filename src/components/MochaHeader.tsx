
import { Bell, Settings, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MochaHeader() {
  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground">CashDapp</h1>
        <span className="text-sm text-muted-foreground">by MobileMonero.com</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Connect Wallet
        </Button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <User className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
