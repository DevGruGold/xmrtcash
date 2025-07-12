
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
    <aside className="bg-card border-r border-border w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">CashDapp</h2>
            <p className="text-xs text-muted-foreground">Monero Bridge</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              location.pathname === to 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}
      </nav>
      
      <footer className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Powered by XMRT Protocol
        </p>
      </footer>
    </aside>
  );
}
