
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mocha-900 via-mocha-700 to-mocha-500">
      <MochaSidebar />
      <main className="flex-1 flex flex-col">
        <MochaHeader />
        <section className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-2xl mx-auto bg-mocha-100/30 rounded-2xl shadow-2xl p-10 flex flex-col gap-8 backdrop-blur-2xl">
            <h2 className="font-mocha text-4xl font-bold text-mocha-800 text-center mb-2">Welcome to XMRT-UI Nexus</h2>
            <p className="text-lg text-mocha-800/80 font-ui text-center">
              Manage your <span className="font-semibold">XMRT</span> tokens: wrap XMR, on/off ramp fiat, and interact with CashDapps, securely and transparently.<br/>
              Inspired by the XMRT smart contract. <br/>
              <span className="italic text-mocha-700">Mocha + Java inspired design ☕</span>
            </p>
            <div className="flex flex-wrap justify-center gap-6 mt-6">
              <Link
                to="/wrap-xmr"
                className="bg-mocha-700 hover:bg-mocha-800 text-mocha-100 px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/onramp-fiat"
                className="bg-mocha-100 hover:bg-mocha-200 text-mocha-800 px-5 py-3 rounded-lg font-bold flex items-center gap-2 transition border border-mocha-400"
              >
                Fiat OnRamp <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="text-xs text-mocha-700 font-ui text-center mt-4 opacity-80">
              This frontend is a demonstration UI reflecting the main features and access roles of the XMRT contract.<br/>
              <span>
                Contract Roles: <span className="font-bold">Admin, CEO, CFO, CTO, Compliance Officer, CashDapp Operator</span>
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
