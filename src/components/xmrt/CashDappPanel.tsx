
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Grid2x2 } from "lucide-react";

export default function CashDappPanel() {
  const [name, setName] = useState("");
  const [registered, setRegistered] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Invalid Name", description: "CashDapp name is required." });
      return;
    }
    setRegistered(true);
    toast({ title: "Registered", description: `CashDapp "${name}" registered (mock)` });
    setName("");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-mocha-100/40 rounded-xl shadow-xl p-8 flex flex-col gap-7 backdrop-blur-lg">
      <h2 className="text-xl font-bold font-mocha text-mocha-800">CashDapp Registration</h2>
      {!registered ? (
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <label className="flex flex-col items-start gap-2 font-medium">
            <span>CashDapp Name:</span>
            <input
              className="w-full px-3 py-2 bg-mocha-100 rounded ring-1 ring-mocha-400 focus:ring-2 focus:ring-mocha-700 font-ui"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. MoneroPay"
              required
            />
          </label>
          <Button type="submit" className="bg-mocha-700 text-mocha-100 hover:bg-mocha-800 font-semibold text-lg flex gap-2 items-center">
            <Grid2x2 className="w-4 h-4" /> Register
          </Button>
        </form>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <span className="text-mocha-700 font-semibold font-ui">CashDapp registered!</span>
          <Button
            className="mt-3 bg-mocha-700 text-mocha-100 hover:bg-mocha-800"
            onClick={() => setRegistered(false)}
          >
            Register Another
          </Button>
        </div>
      )}
      <span className="text-xs font-ui text-mocha-500">Registered CashDapps can manage fiat flows. Demo mockup interface.</span>
    </div>
  );
}
