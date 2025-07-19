
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
    <aside className="hidden lg:flex glass-card border-r border-primary/20 w-64 min-h-screen flex-col fixed lg:relative z-20">
      <div className="p-4 sm:p-6 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-float">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold gradient-text">CashDapp</h2>
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
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group",
              location.pathname === to 
                ? "neon-border bg-primary/10 text-primary shadow-neon-strong" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60 hover:shadow-glow border border-transparent hover:border-primary/20"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className="truncate">{label}</span>
          </Link>
        ))}
      </nav>
      
      <footer className="p-4 border-t border-primary/20">
        <p className="text-xs text-muted-foreground text-center">
          Powered by <span className="gradient-text font-medium">XMRT Protocol</span>
        </p>
      </footer>
    </aside>
  );
}
