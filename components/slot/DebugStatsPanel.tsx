import { Activity, Binary, Cpu, Gauge, Sigma } from "lucide-react";
import { calculateExpectedLoss, calculateHouseEdge } from "@/lib/slot/rtp";
import { formatMoney } from "@/lib/utils/currency";
import type { SlotSession } from "@/types/session";
import type { Volatility } from "@/types/slot";

type DebugStats = {
  rngSeed: number;
  bonusProbability: number;
  volatility: Volatility;
  activePaylines: number;
  betAmount: number;
  rtp: number;
  session: SlotSession | null;
  elapsedSeconds: number;
};

export function DebugStatsPanel({
  activePaylines,
  betAmount,
  bonusProbability,
  elapsedSeconds,
  rngSeed,
  rtp,
  session,
  volatility,
}: DebugStats) {
  const spinHistory = session?.spinHistory ?? [];
  const totalSpins = session?.totalSpins ?? 0;
  const wins = spinHistory.filter((spin) => spin.isWin && spin.betAmount > 0).length;
  const losses = spinHistory.filter((spin) => !spin.isWin && spin.betAmount > 0).length;
  const bonusEvents = spinHistory.filter((spin) => spin.grandBonusTriggered || (spin.featureWin ?? 0) > 0).length;
  const totalWagered = session?.totalWagered ?? 0;
  const totalReturned = session?.totalReturned ?? session?.totalWon ?? 0;
  const expectedLoss = calculateExpectedLoss(totalWagered, rtp);
  const actualLoss = Math.max(0, totalWagered - totalReturned);
  const houseEdge = calculateHouseEdge(rtp);
  const actualRtp = totalWagered > 0 ? (totalReturned / totalWagered) * 100 : 0;
  const hitRate = totalSpins > 0 ? (wins / totalSpins) * 100 : 0;
  const nearMissRate = totalSpins > 0 ? ((session?.nearMissCount ?? 0) / totalSpins) * 100 : 0;
  const avgBet = totalSpins > 0 ? totalWagered / totalSpins : betAmount;
  const expectedLossPerSpin = avgBet * (houseEdge / 100);
  const spinsToZero = expectedLossPerSpin > 0 && session ? session.endingBalance / expectedLossPerSpin : Infinity;
  const avgSecondsPerSpin = totalSpins > 1 ? elapsedSeconds / totalSpins : 0;
  const timeToZeroSeconds = Number.isFinite(spinsToZero) && avgSecondsPerSpin > 0 ? spinsToZero * avgSecondsPerSpin : Infinity;
  const varianceProxy = spinHistory.length
    ? spinHistory.reduce((sum, spin) => sum + Math.abs(spin.netResult - (session?.netProfitLoss ?? 0) / Math.max(totalSpins, 1)), 0) /
      spinHistory.length
    : 0;

  const groups = [
    {
      title: "RNG Core",
      icon: Binary,
      rows: [
        ["RNG Seed", String(rngSeed)],
        ["Entropy Window", `${(rngSeed % 997).toString().padStart(3, "0")} / 997`],
        ["Last Spin ID", spinHistory.at(-1)?.id.slice(-8) ?? "none"],
        ["Reel Matrix", "5x3 visible grid"],
      ],
    },
    {
      title: "Probability Stack",
      icon: Sigma,
      rows: [
        ["Probability of Bonus Trigger", `${bonusProbability.toFixed(2)}%`],
        ["Active Payline Coverage", `${activePaylines}/20 lines`],
        ["Estimated Hit Rate", `${hitRate.toFixed(2)}%`],
        ["Near-Miss Rate", `${nearMissRate.toFixed(2)}%`],
      ],
    },
    {
      title: "RTP Ledger",
      icon: Gauge,
      rows: [
        ["Current House Edge", `${houseEdge.toFixed(2)}%`],
        ["Target RTP", `${rtp.toFixed(2)}%`],
        ["Actual RTP", `${actualRtp.toFixed(2)}%`],
        ["RTP Drift", `${(actualRtp - rtp).toFixed(2)} pts`],
      ],
    },
    {
      title: "Loss Model",
      icon: Activity,
      rows: [
        ["Expected Loss", formatMoney(expectedLoss)],
        ["Actual Loss From Wagers", formatMoney(actualLoss)],
        ["Actual vs Expected", formatMoney(actualLoss - expectedLoss)],
        ["Expected Loss / Spin", formatMoney(expectedLossPerSpin)],
      ],
    },
    {
      title: "Survival Estimate",
      icon: Cpu,
      rows: [
        ["Projected Spins To Zero", Number.isFinite(spinsToZero) ? spinsToZero.toFixed(1) : "unknown"],
        ["Projected Time To Zero", formatDuration(timeToZeroSeconds)],
        ["Velocity Of Loss", `${formatMoney(session?.velocityOfLoss ?? 0)}/min`],
        ["Peak Velocity", `${formatMoney(session?.peakVelocityOfLoss ?? 0)}/min`],
      ],
    },
    {
      title: "Session Counters",
      icon: Cpu,
      rows: [
        ["Wins / Losses", `${wins} / ${losses}`],
        ["Bonus Events", String(bonusEvents)],
        ["Longest Loss Streak", String(session?.longestLosingStreak ?? 0)],
        ["Volatility Proxy", `${volatility.toUpperCase()} | ${varianceProxy.toFixed(2)}`],
      ],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200">Debug Mode</p>
        <h2 className="mt-1 text-2xl font-black text-white">Math Console</h2>
        <p className="mt-2 text-sm leading-6 text-emerald-50/80">
          Raw fake-money telemetry. These numbers explain the simulation model; they are not gambling advice.
        </p>
      </div>
      {groups.map((group) => {
        const Icon = group.icon;
        return (
          <section key={group.title} className="rounded-lg border border-white/10 bg-black/25 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
              <Icon className="size-4 text-emerald-300" />
              {group.title}
            </div>
            <dl className="space-y-2">
              {group.rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3 border-t border-white/5 pt-2 text-xs">
                  <dt className="text-slate-400">{label}</dt>
                  <dd className="max-w-[9rem] truncate font-mono font-semibold text-emerald-100">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}

export function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "unknown";
  }

  if (seconds < 60) {
    return `${seconds.toFixed(0)} sec`;
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  }

  return `${(minutes / 60).toFixed(1)} hr`;
}
