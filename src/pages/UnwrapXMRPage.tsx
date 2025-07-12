
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import UnwrapXMR from "@/components/xmrt/UnwrapXMR";

export default function UnwrapXMRPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <MochaSidebar />
      <main className="flex-1 flex flex-col lg:ml-0">
        <MochaHeader />
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 lg:p-6">
          <UnwrapXMR />
        </div>
      </main>
    </div>
  );
}
