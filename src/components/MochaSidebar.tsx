
import { Home, ArrowUpDown, Send, Download, Upload, Shield, Droplets } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const sidebarItems = [
  { to: "/", label: "Ecosystem Dashboard", icon: Home },
  { to: "/wrap-xmr", label: "Wrap XMR", icon: Upload },
  { to: "/unwrap-xmr", label: "Unwrap XMR", icon: Download },
  { to: "/onramp-fiat", label: "Buy Crypto", icon: ArrowUpDown },
  { to: "/offramp-fiat", label: "Sell Crypto", icon: Send },
  { to: "/meshnet", label: "Mesh Network", icon: Shield },
  { to: "/faucet", label: "XMRT Faucet", icon: Droplets },
];

export default function MochaSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:block glass-card border-r border-primary/20 w-64 min-h-screen overflow-y-auto">
      <div className="flex flex-col h-full min-h-screen pb-safe">{/* pb-safe for mobile bottom safe area */}
        <div className="p-4 sm:p-6 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-neon animate-float">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-bold gradient-text">XMRT DAO</h2>
              <p className="text-xs text-muted-foreground">Privacy Economy Ecosystem</p>
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
        
        <footer className="mt-auto p-4 border-t border-primary/20 space-y-3">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="gradient-text font-medium">XMRT Solutions</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Meshtastic Network Integration
            </p>
          </div>
          
          <div className="glass-card p-3 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="text-xs font-medium text-primary mb-1">About XMRT DAO</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Decentralized privacy-focused mining ecosystem connecting Monero with meshnet resilience and mobile mining capabilities.
            </p>
          </div>
        </footer>
      </div>
    </aside>
  );
}
