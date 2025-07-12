
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import OnRampFiat from "@/components/xmrt/OnRampFiat";

export default function OnRampFiatPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <MochaSidebar />
      <main className="flex-1 flex flex-col lg:ml-0">
        <MochaHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 lg:p-6">
          <OnRampFiat />
        </div>
      </main>
    </div>
  );
}
