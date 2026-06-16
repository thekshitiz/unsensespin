import { calculateHouseEdge } from "@/lib/slot/rtp";
import { formatMoney } from "@/lib/utils/currency";
import type { SlotSession } from "@/types/session";

export function SessionStatsPanel({ session, elapsedSeconds }: { session: SlotSession | null; elapsedSeconds: number }) {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;

  const stats = [
    ["Balance", formatMoney(session?.endingBalance ?? 0)],
    ["Spins", String(session?.totalSpins ?? 0)],
    ["Wagered", formatMoney(session?.totalWagered ?? 0)],
    ["Net result", formatMoney(session?.netProfitLoss ?? 0)],
    ["Expected loss", formatMoney(session?.expectedLoss ?? 0)],
    ["House edge", session ? `${calculateHouseEdge(session.selectedRTP)}%` : "0%"],
    ["Time", `${minutes}:${seconds.toString().padStart(2, "0")}`],
    ["Near misses", String(session?.nearMissCount ?? 0)],
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-lg font-semibold text-white">{value}</p>
        </div>
      ))}
    </div>
  );
}
