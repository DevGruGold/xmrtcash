
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import CashDappPanel from "@/components/xmrt/CashDappPanel";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="lg:flex">
        <MochaSidebar />
        
        <div className="flex-1 lg:ml-0">
          <MochaHeader />
          
          <main className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 pb-20">
            <CashDappPanel />
          </main>
        </div>
      </div>
    </div>
  );
}
