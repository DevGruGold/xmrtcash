
import { Home, ArrowUpDown, Send, Download, Upload, Users, Settings, BarChart3, Shield, DollarSign } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const sidebarItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/wrap-xmr", label: "Wrap XMR", icon: Upload },
  { to: "/unwrap-xmr", label: "Unwrap XMR", icon: Download },
  { to: "/onramp-fiat", label: "Buy Crypto", icon: ArrowUpDown },
  { to: "/offramp-fiat", label: "Sell Crypto", icon: Send },
  { to: "/cashdapp", label: "Quick Pay", icon: DollarSign },
  { to: "/simulation", label: "DAO Governance", icon: Users },
  { to: "/deploy", label: "Deploy", icon: BarChart3 },
  { to: "/testing", label: "Testing", icon: Shield },
  { to: "/admin", label: "Admin", icon: Settings },
];

export default function MochaSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex bg-card/95 backdrop-blur-sm border-r border-border/50 w-64 min-h-screen flex-col fixed lg:relative z-20">
      <div className="p-4 sm:p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-neon">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">CashDapp</h2>
            <p className="text-xs text-muted-foreground">Monero Bridge</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {sidebarItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              location.pathname === to 
                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-neon" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-primary/20 border border-transparent"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      
      <footer className="p-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Powered by <span className="text-primary font-medium">XMRT Protocol</span>
        </p>
      </footer>
    </aside>
  );
}
