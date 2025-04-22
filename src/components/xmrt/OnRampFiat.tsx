
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function OnRampFiat() {
  const [amount, setAmount] = useState("");

  const handleOnRamp = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Invalid amount", description: "Please enter a valid fiat amount." });
      return;
    }
    toast({ title: "OnRamp simulated", description: `On-ramped $${amount} worth of XMRT. (Fee: ~0.5%)` });
    setAmount("");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-mocha-100/40 rounded-xl shadow-xl p-8 flex flex-col gap-7 backdrop-blur-lg">
      <h2 className="text-xl font-bold font-mocha text-mocha-800">Fiat OnRamp</h2>
      <form onSubmit={handleOnRamp} className="flex flex-col gap-5">
        <label className="flex flex-col items-start gap-2 font-medium">
          <span>Amount (USD):</span>
          <input
            className="w-full px-3 py-2 bg-mocha-100 rounded ring-1 ring-mocha-400 focus:ring-2 focus:ring-mocha-700 font-ui"
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g. 100"
            required
          />
        </label>
        <Button type="submit" className="bg-mocha-700 text-mocha-100 hover:bg-mocha-800 font-semibold text-lg flex gap-2 items-center">
          <LogIn className="w-4 h-4" /> OnRamp
        </Button>
      </form>
      <span className="text-xs font-ui text-mocha-500">A 0.5% fee applies. This is a mock for demo purposes.</span>
    </div>
  );
}
