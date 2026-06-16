"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Square, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BonusRoundOverlay } from "@/components/slot/BonusRoundOverlay";
import { ReelGrid } from "@/components/slot/ReelGrid";
import { SessionStatsPanel } from "@/components/slot/SessionStatsPanel";
import { WarningPanel } from "@/components/slot/WarningPanel";
import { themes } from "@/lib/constants/themes";
import { formatMoney } from "@/lib/utils/currency";
import { useActiveSession } from "@/hooks/useActiveSession";
import type { SessionWarning } from "@/types/warning";

const guidanceNotifications: SessionWarning[] = [
  {
    type: "loss-streak",
    title: "Losing streak",
    message: "Several losses in a row do not make a win more likely. Each spin is independent.",
    timestamp: "guidance-loss-streak-1",
  },
  {
    type: "rapid-spins",
    title: "Rapid spins",
    message: "Fast repeated spins can make losses accumulate before you notice.",
    timestamp: "guidance-rapid-spins-1",
  },
  {
    type: "near-miss",
    title: "Near miss",
    message:
      "That looked close, but it was still a loss. Near-misses can make random games feel more controllable than they are.",
    timestamp: "guidance-near-miss",
  },
  {
    type: "loss-streak",
    title: "Losing streak",
    message: "Several losses in a row do not make a win more likely. Each spin is independent.",
    timestamp: "guidance-loss-streak-2",
  },
  {
    type: "rapid-spins",
    title: "Rapid spins",
    message: "Fast repeated spins can make losses accumulate before you notice.",
    timestamp: "guidance-rapid-spins-2",
  },
];

export default function SimulatorPage() {
  const sim = useActiveSession();
  const [autoplayBetAmount, setAutoplayBetAmount] = useState(sim.betAmount);
  const [autoplaySpinCount, setAutoplaySpinCount] = useState(25);
  const [autoplayRemaining, setAutoplayRemaining] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(false);
  const [bonusSpinId, setBonusSpinId] = useState<string | null>(null);
  const [dismissedBonusSpinIds, setDismissedBonusSpinIds] = useState<Set<string>>(() => new Set());
  const [isRolling, setIsRolling] = useState(false);
  const [winPaused, setWinPaused] = useState(false);
  const simRef = useRef(sim);
  const latestSpin = sim.session?.spinHistory.at(-1);
  const activeTheme = themes[sim.session?.theme ?? sim.theme];
  const canSpin = Boolean(
    sim.session && sim.session.endingBalance >= sim.betAmount && !sim.session.endedAt && !isRolling && !winPaused,
  );
  const canAutoplay = Boolean(
    !autoplayActive && !isRolling && !winPaused && (!sim.session || sim.session.endingBalance >= autoplayBetAmount),
  );
  const notificationFeed = buildNotificationFeed(sim.warnings);

  useEffect(() => {
    simRef.current = sim;
  }, [sim]);

  const runSpinWithScroll = useCallback(
    (betAmount: number, afterSpin?: (didSpin: boolean) => void) => {
      if (isRolling || winPaused) {
        return;
      }

      setIsRolling(true);
      window.setTimeout(() => {
        const didSpin = simRef.current.spin(betAmount);
        setIsRolling(false);
        afterSpin?.(didSpin);
      }, sim.settings.reducedMotion ? 120 : 820);
    },
    [isRolling, sim.settings.reducedMotion, winPaused],
  );

  useEffect(() => {
    if (
      latestSpin?.id &&
      latestSpin.betAmount > 0 &&
      latestSpin.resultMultiplier >= 10 &&
      !dismissedBonusSpinIds.has(latestSpin.id)
    ) {
      const timeout = window.setTimeout(() => {
        setAutoplayActive(false);
        setBonusSpinId(latestSpin.id);
      }, 0);

      return () => window.clearTimeout(timeout);
    }
  }, [dismissedBonusSpinIds, latestSpin]);

  useEffect(() => {
    if (!latestSpin?.id || !latestSpin.isWin || latestSpin.betAmount <= 0) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setAutoplayActive(false);
      setWinPaused(true);
      window.setTimeout(() => setWinPaused(false), latestSpin.resultMultiplier >= 25 ? 2200 : 1300);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [latestSpin]);

  useEffect(() => {
    if (!autoplayActive) {
      return;
    }

    if (!simRef.current.session) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const currentSim = simRef.current;
      const autoplaySession = currentSim.session;

      if (!autoplaySession) {
        setAutoplayActive(false);
        return;
      }

      if (
        autoplayRemaining <= 0 ||
        autoplaySession.endedAt ||
        autoplaySession.stopLossTriggered ||
        autoplaySession.timeLimitTriggered ||
        autoplaySession.endingBalance < autoplayBetAmount
      ) {
        setAutoplayActive(false);
        return;
      }

      runSpinWithScroll(autoplayBetAmount, (didSpin) => {
        if (didSpin) {
          setAutoplayRemaining((remaining) => Math.max(0, remaining - 1));
        } else {
          setAutoplayActive(false);
        }
      });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [autoplayActive, autoplayBetAmount, autoplayRemaining, runSpinWithScroll]);

  function startAutoplay() {
    if (!sim.session) {
      sim.startSession();
    }
    setAutoplayRemaining(Math.max(1, Math.floor(autoplaySpinCount)));
    setAutoplayActive(true);
  }

  function closeBonus() {
    if (bonusSpinId) {
      setDismissedBonusSpinIds((items) => new Set(items).add(bonusSpinId));
    }
    setBonusSpinId(null);
  }

  function collectBonus(amount: number) {
    sim.applyBonusAward(amount);
    closeBonus();
  }

  return (
    <AppShell>
      {bonusSpinId && latestSpin ? (
        <BonusRoundOverlay
          betAmount={latestSpin.betAmount || sim.betAmount}
          reducedMotion={sim.settings.reducedMotion}
          onCollect={collectBonus}
          onSkip={closeBonus}
        />
      ) : null}
      <main className={`min-h-screen bg-gradient-to-br ${activeTheme.className}`}>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.75fr_1.25fr_0.85fr]">
          <aside className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Risk feed</p>
                <h1 className="text-2xl font-bold text-white">Notifications</h1>
              </div>
              <span className="rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-slate-300">Live</span>
            </div>
            <div className="mt-4">
              <WarningPanel warnings={notificationFeed} />
            </div>
          </aside>

          <section className="space-y-5 rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">{activeTheme.name}</p>
                <h2 className="text-3xl font-black text-white">Fake-money reels</h2>
              </div>
              <p className="text-sm text-slate-300">Educational approximation, not a certified gambling engine.</p>
            </div>
            <ReelGrid
              grid={latestSpin?.symbols}
              theme={sim.session?.theme ?? sim.theme}
              spinningKey={sim.session?.totalSpins ?? 0}
              reducedMotion={sim.settings.reducedMotion}
              winningPayline={latestSpin?.winningPayline}
              winningMatchCount={latestSpin?.winningMatchCount}
              winAmount={latestSpin?.winAmount}
              multiplier={latestSpin?.resultMultiplier}
              isRolling={isRolling}
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Last result</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {isRolling
                    ? "Reels spinning..."
                    : winPaused
                      ? "Win pause: showing how it landed"
                      : latestSpin
                        ? `${latestSpin.resultMultiplier}x | ${formatMoney(latestSpin.netResult)}`
                        : "No spins yet"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {activeTheme.name} | {formatMoney(sim.betAmount)} fake bet | {sim.rtp}% RTP | {sim.volatility} volatility |{" "}
                  {sim.session?.activePaylines ?? sim.settings.defaultActivePaylines} paylines
                </p>
              </div>
              {!sim.session ? (
                <button onClick={sim.startSession} className="primary-button min-h-20 px-8 text-lg">
                  <Play className="size-5" /> Start
                </button>
              ) : (
                <button
                  disabled={!canSpin}
                  onClick={() => runSpinWithScroll(sim.betAmount)}
                  className="primary-button min-h-20 px-8 text-lg disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Zap className="size-5" /> Spin
                </button>
              )}
            </div>
            {sim.session ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <button className="secondary-button" onClick={sim.endSession}>
                  <Square className="size-4" /> Save session
                </button>
                <button className="secondary-button" onClick={sim.resetSession}>
                  <RotateCcw className="size-4" /> Reset session
                </button>
              </div>
            ) : null}
            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">Planned autoplay</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Enter your own fake bet and number of rounds. It stops on reminders, wins, or insufficient fake balance.
                  </p>
                </div>
                <p className="text-sm font-semibold text-emerald-200">
                  {autoplayActive ? `${autoplayRemaining} rounds left` : winPaused ? "Paused on win" : "Off"}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="Autoplay bet">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={autoplayBetAmount}
                    disabled={autoplayActive}
                    onChange={(event) => setAutoplayBetAmount(Math.max(1, Number(event.target.value)))}
                    className="control"
                  />
                </Field>
                <Field label="Custom rounds">
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    step={1}
                    value={autoplaySpinCount}
                    disabled={autoplayActive}
                    onChange={(event) => setAutoplaySpinCount(Math.max(1, Math.floor(Number(event.target.value))))}
                    className="control"
                  />
                </Field>
                {autoplayActive ? (
                  <button className="secondary-button self-end" onClick={() => setAutoplayActive(false)}>
                    <Pause className="size-4" /> Stop
                  </button>
                ) : (
                  <button disabled={!canAutoplay} className="secondary-button self-end disabled:cursor-not-allowed disabled:opacity-45" onClick={startAutoplay}>
                    <Play className="size-4" /> Start
                  </button>
                )}
              </div>
            </section>
          </section>

          <aside className="space-y-4">
            <SessionStatsPanel session={sim.session} elapsedSeconds={sim.elapsedSeconds} />
          </aside>
        </div>
      </main>
    </AppShell>
  );
}

function buildNotificationFeed(liveWarnings: SessionWarning[]) {
  const merged = [...liveWarnings, ...guidanceNotifications];
  const seen = new Set<string>();
  return merged
    .filter((warning) => {
      const key = `${warning.type}-${warning.message}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}
