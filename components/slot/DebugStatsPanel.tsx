import { Activity, Binary, Cpu, Gauge, Sigma, SlidersHorizontal, TerminalSquare } from "lucide-react";
import { calculateExpectedLoss, calculateHouseEdge } from "@/lib/slot/rtp";
import { formatMoney } from "@/lib/utils/currency";
import type { SlotSession } from "@/types/session";
import type { DebugOutcomeMode, Volatility } from "@/types/slot";

type DebugStats = {
  rngSeed: number;
  bonusProbability: number;
  volatility: Volatility;
  activePaylines: number;
  betAmount: number;
  rtp: number;
  session: SlotSession | null;
  elapsedSeconds: number;
  debugOutcomeMode: DebugOutcomeMode;
  debugMultiplier: number;
  debugHitChance: number;
  debugBonusChance: number;
  debugRtp: number;
  onDebugOutcomeModeChange: (mode: DebugOutcomeMode) => void;
  onDebugMultiplierChange: (value: number) => void;
  onDebugHitChanceChange: (value: number) => void;
  onDebugBonusChanceChange: (value: number) => void;
  onDebugRtpChange: (value: number) => void;
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
  debugOutcomeMode,
  debugMultiplier,
  debugHitChance,
  debugBonusChance,
  debugRtp,
  onDebugOutcomeModeChange,
  onDebugMultiplierChange,
  onDebugHitChanceChange,
  onDebugBonusChanceChange,
  onDebugRtpChange,
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
  const endingBalance = session?.endingBalance ?? 0;
  const netProfitLoss = session?.netProfitLoss ?? 0;
  const lastSpin = spinHistory.at(-1);
  const lossRun = session?.spinHistory.filter((spin) => spin.betAmount > 0).slice(-8).map((spin) => (spin.isWin ? "1" : "0")).join("") || "empty";
  const wagerBurn = totalWagered > 0 && session ? (totalWagered / session.startingBalance) * 100 : 0;
  const bonusDensity = totalSpins > 0 ? (bonusEvents / totalSpins) * 100 : 0;
  const balanceDeltaPercent = session ? (netProfitLoss / session.startingBalance) * 100 : 0;
  const nextForcedGross = debugOutcomeMode === "force-loss" || debugOutcomeMode === "force-near-miss" ? 0 : betAmount * debugMultiplier;
  const nextForcedNet = nextForcedGross - betAmount;
  const debugHouseEdge = calculateHouseEdge(debugRtp);
  const expectedHouseWinAtCurrentWager = calculateExpectedLoss(totalWagered, debugRtp);
  const expectedHouseWinNext100 = avgBet * 100 * (debugHouseEdge / 100);
  const expectedHouseWinNext1000 = avgBet * 1000 * (debugHouseEdge / 100);
  const expectedPlayerReturnNext100 = avgBet * 100 * (debugRtp / 100);
  const projectedBalanceAfter100 = session ? session.endingBalance - expectedHouseWinNext100 : 0;
  const projectedBalanceAfter1000 = session ? session.endingBalance - expectedHouseWinNext1000 : 0;

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
        ["Debug Hit Chance", `${debugHitChance.toFixed(1)}%`],
        ["Debug Bonus Chance", `${debugBonusChance.toFixed(1)}%`],
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
        ["Debug House Edge", `${debugHouseEdge.toFixed(2)}%`],
        ["Target RTP", `${rtp.toFixed(2)}%`],
        ["Debug RTP Dial", `${debugRtp.toFixed(2)}%`],
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
    {
      title: "Balance Bus",
      icon: TerminalSquare,
      rows: [
        ["Starting Balance", formatMoney(session?.startingBalance ?? 0)],
        ["Current Balance", formatMoney(endingBalance)],
        ["Net P/L Register", formatMoney(netProfitLoss)],
        ["Balance Delta", `${balanceDeltaPercent.toFixed(2)}%`],
      ],
    },
    {
      title: "Pattern Analyzer",
      icon: Binary,
      rows: [
        ["Last 8 Win Bits", lossRun],
        ["Wager Burn", `${wagerBurn.toFixed(2)}% of bankroll`],
        ["Bonus Density", `${bonusDensity.toFixed(2)}%`],
        ["Last Multiplier", `${(lastSpin?.resultMultiplier ?? 0).toFixed(2)}x`],
      ],
    },
    {
      title: "God Mode Preview",
      icon: SlidersHorizontal,
      rows: [
        ["Override Mode", debugOutcomeMode],
        ["Multiplier Dial", `${debugMultiplier.toFixed(2)}x`],
        ["Hit Chance Dial", `${debugHitChance.toFixed(1)}%`],
        ["Bonus Chance Dial", `${debugBonusChance.toFixed(1)}%`],
        ["Next Forced Gross", formatMoney(nextForcedGross)],
        ["Next Forced Net", formatMoney(nextForcedNet)],
      ],
    },
    {
      title: "House Edge Lab",
      icon: Gauge,
      rows: [
        ["Who Decides Edge", "RTP setting"],
        ["Formula", "100 - RTP"],
        ["Expected House Win So Far", formatMoney(expectedHouseWinAtCurrentWager)],
        ["Current Pattern Avg Bet", formatMoney(avgBet)],
      ],
    },
    {
      title: "Long-Run Projection",
      icon: Activity,
      rows: [
        ["Next 100 Spins House Win", formatMoney(expectedHouseWinNext100)],
        ["Next 100 Spins Player Return", formatMoney(expectedPlayerReturnNext100)],
        ["Balance After 100 EV", formatMoney(projectedBalanceAfter100)],
        ["Balance After 1000 EV", formatMoney(projectedBalanceAfter1000)],
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
      <section className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="size-4 text-cyan-200" />
          Superuser Outcome Lab
        </div>
        <label className="block text-xs font-semibold text-cyan-50">
          Outcome override
          <select
            className="control mt-2 text-sm"
            value={debugOutcomeMode}
            onChange={(event) => onDebugOutcomeModeChange(event.target.value as DebugOutcomeMode)}
          >
            <option value="rng">RNG engine</option>
            <option value="force-loss">Force loss</option>
            <option value="force-near-miss">Force near-miss</option>
            <option value="force-win">Force win</option>
            <option value="force-bonus">Force bonus win</option>
          </select>
        </label>
        <label className="mt-3 block text-xs font-semibold text-cyan-50">
          Multiplier dial: {debugMultiplier.toFixed(2)}x
          <input
            type="range"
            min={0.1}
            max={50}
            step={0.05}
            value={debugMultiplier}
            onChange={(event) => onDebugMultiplierChange(Number(event.target.value))}
            className="mt-2 w-full accent-cyan-300"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cyan-50">
          Hit probability dial: {debugHitChance.toFixed(1)}%
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={debugHitChance}
            onChange={(event) => onDebugHitChanceChange(Number(event.target.value))}
            className="mt-2 w-full accent-cyan-300"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cyan-50">
          Bonus probability dial: {debugBonusChance.toFixed(1)}%
          <input
            type="range"
            min={0}
            max={50}
            step={0.25}
            value={debugBonusChance}
            onChange={(event) => onDebugBonusChanceChange(Number(event.target.value))}
            className="mt-2 w-full accent-cyan-300"
          />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cyan-50">
          RTP / house edge dial: {debugRtp.toFixed(1)}% RTP | {debugHouseEdge.toFixed(1)}% edge
          <input
            type="range"
            min={50}
            max={100}
            step={0.5}
            value={debugRtp}
            onChange={(event) => onDebugRtpChange(Number(event.target.value))}
            className="mt-2 w-full accent-cyan-300"
          />
        </label>
        <p className="mt-2 text-xs leading-5 text-cyan-50/75">
          Applies only while Debug Mode is on. This is a simulator superuser control for exploring math outcomes, not a
          real gambling feature.
        </p>
      </section>
      <section className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
          <Gauge className="size-4 text-amber-200" />
          How The House Edge Is Decided
        </div>
        <p className="text-xs leading-5 text-amber-50/85">
          In this simulator, the selected RTP decides the house edge. The formula is <span className="font-mono">100 - RTP</span>.
          A 98% RTP means a 2% expected house edge: over many spins, the model expects the house side to retain about
          {` ${formatMoney(avgBet * (debugHouseEdge / 100))} `}per spin at the current average bet of {formatMoney(avgBet)}.
        </p>
      </section>
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
