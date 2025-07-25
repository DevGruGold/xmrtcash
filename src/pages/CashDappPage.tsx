import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import CashDappPanel from "@/components/xmrt/CashDappPanel";

export default function CashDappPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <MochaSidebar />
      <main className="flex-1 flex flex-col lg:ml-0">
        <MochaHeader />
        
        <div className="flex-1 p-3 sm:p-4 lg:p-6">
          <CashDappPanel />
        </div>
      </main>
    </div>
  );
}