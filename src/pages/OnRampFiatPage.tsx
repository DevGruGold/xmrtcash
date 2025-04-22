
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";
import OnRampFiat from "@/components/xmrt/OnRampFiat";

export default function OnRampFiatPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mocha-900 via-mocha-700 to-mocha-500">
      <MochaSidebar />
      <main className="flex-1 flex flex-col">
        <MochaHeader />
        <section className="flex-1 flex flex-col items-center justify-center">
          <OnRampFiat />
        </section>
      </main>
    </div>
  );
}
