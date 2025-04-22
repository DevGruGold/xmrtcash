
import { User } from "lucide-react";

export default function MochaHeader() {
  return (
    <header className="flex items-center justify-between px-8 py-5 bg-mocha-800/60 shadow rounded-xl mb-8 mx-2">
      <h1 className="font-mocha text-3xl text-mocha-100 tracking-wide">XMRT Portal</h1>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 text-mocha-200 text-base">
          <User className="w-5 h-5" />
          <span>User</span>
        </span>
      </div>
    </header>
  );
}
