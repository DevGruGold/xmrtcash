
import { Home, LogIn, LogOut, Settings, Grid2x2, ArrowRight, ArrowLeft, Code, Play, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const sidebarItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/deploy", label: "Deploy Contract", icon: Code },
  { to: "/testing", label: "Test Contract", icon: Play },
  { to: "/simulation", label: "AI DAO Simulation", icon: User },
  { to: "/wrap-xmr", label: "Wrap XMR", icon: ArrowRight },
  { to: "/unwrap-xmr", label: "Unwrap XMR", icon: ArrowLeft },
  { to: "/onramp-fiat", label: "OnRamp Fiat", icon: LogIn },
  { to: "/offramp-fiat", label: "OffRamp Fiat", icon: LogOut },
  { to: "/cashdapp", label: "CashDapp Panel", icon: Grid2x2 },
  { to: "/admin", label: "Admin", icon: Settings },
];

export default function MochaSidebar() {
  const location = useLocation();

  return (
    <aside className="bg-mocha-900/60 backdrop-blur-md text-mocha-100 w-56 min-h-screen shadow-xl px-4 py-8 flex flex-col gap-8">
      <div className="flex items-center gap-3 mb-10 ml-2">
        <span className="text-2xl font-bold tracking-wide font-mocha">☕ XMRT-ui</span>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {sidebarItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              "flex items-center gap-3 p-3 rounded-lg font-semibold hover:bg-mocha-700/60 transition duration-150",
              location.pathname === to ? "bg-mocha-800 text-mocha-100" : "text-mocha-200"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
      <footer className="mt-auto px-2 text-xs text-mocha-400 font-ui">
        Made with <span aria-label="coffee" className="mx-1">☕</span> by XMRT
      </footer>
    </aside>
  );
}
