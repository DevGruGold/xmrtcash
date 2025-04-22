
import MochaSidebar from "@/components/MochaSidebar";
import MochaHeader from "@/components/MochaHeader";

export default function AdminPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-mocha-900 via-mocha-700 to-mocha-500">
      <MochaSidebar />
      <main className="flex-1 flex flex-col">
        <MochaHeader />
        <section className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg bg-mocha-100/40 rounded-xl shadow-xl p-8 flex flex-col gap-6 items-center backdrop-blur-lg">
            <h2 className="text-xl font-bold font-mocha text-mocha-800">Admin Dashboard</h2>
            <span className="text-mocha-900 font-ui">Role-based actions and advanced controls will appear here.<br/>This is a placeholder for MVP.</span>
          </div>
        </section>
      </main>
    </div>
  );
}
