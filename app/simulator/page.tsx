"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Square, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ReelGrid } from "@/components/slot/ReelGrid";
import { SessionStatsPanel } from "@/components/slot/SessionStatsPanel";
import { WarningPanel } from "@/components/slot/WarningPanel";
import { betOptions, rtpOptions } from "@/lib/constants/options";
import { themeList, themes } from "@/lib/constants/themes";
import { volatilityMessages } from "@/lib/slot/volatility";
import { formatMoney } from "@/lib/utils/currency";
import { useActiveSession } from "@/hooks/useActiveSession";
import type { ThemeId, Volatility } from "@/types/slot";

const volatilityOptions: Volatility[] = ["low", "medium", "high"];
const autoplaySpinPresets = [5, 10, 25];

export default function SimulatorPage() {
  const sim = useActiveSession();
  const [autoplayBetAmount, setAutoplayBetAmount] = useState(sim.betAmount);
  const [autoplaySpinCount, setAutoplaySpinCount] = useState(10);
  const [autoplayRemaining, setAutoplayRemaining] = useState(0);
  const [autoplayActive, setAutoplayActive] = useState(false);
  const simRef = useRef(sim);
  const latestSpin = sim.session?.spinHistory.at(-1);
  const activeTheme = themes[sim.session?.theme ?? sim.theme];
  const canSpin = Boolean(sim.session && sim.session.endingBalance >= sim.betAmount && !sim.session.endedAt);
  const canAutoplay = Boolean(!autoplayActive && (!sim.session || sim.session.endingBalance >= autoplayBetAmount));

  useEffect(() => {
    simRef.current = sim;
  }, [sim]);

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

      const didSpin = currentSim.spin(autoplayBetAmount);
      if (didSpin) {
        setAutoplayRemaining((remaining) => Math.max(0, remaining - 1));
      } else {
        setAutoplayActive(false);
      }
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [autoplayActive, autoplayBetAmount, autoplayRemaining]);

  function startAutoplay() {
    if (!sim.session) {
      sim.startSession();
    }
    setAutoplayRemaining(autoplaySpinCount);
    setAutoplayActive(true);
  }

  return (
    <AppShell>
      <main className={`min-h-screen bg-gradient-to-br ${activeTheme.className}`}>
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.75fr_1.25fr_0.85fr]">
          <aside className="space-y-4 rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <h1 className="text-2xl font-bold text-white">Simulator</h1>
            <Field label="Theme">
              <select
                value={sim.theme}
                disabled={!sim.canConfigure}
                onChange={(event) => sim.setTheme(event.target.value as ThemeId)}
                className="control"
              >
                {themeList.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bet size">
              <select
                value={sim.betAmount}
                onChange={(event) => sim.setBetAmount(Number(event.target.value))}
                className="control"
              >
                {betOptions.map((bet) => (
                  <option key={bet} value={bet}>
                    {formatMoney(bet)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="RTP">
              <select
                value={sim.rtp}
                disabled={!sim.canConfigure}
                onChange={(event) => sim.setRtp(Number(event.target.value))}
                className="control"
              >
                {rtpOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}%
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Volatility">
              <select
                value={sim.volatility}
                disabled={!sim.canConfigure}
                onChange={(event) => sim.setVolatility(event.target.value as Volatility)}
                className="control"
              >
                {volatilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option[0].toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
            <p className="rounded-md bg-white/10 p-3 text-sm leading-6 text-slate-300">
              {volatilityMessages[sim.session?.selectedVolatility ?? sim.volatility]}
            </p>
            {!sim.session ? (
              <button className="primary-button w-full" onClick={sim.startSession}>
                Start fake session
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button className="secondary-button" onClick={sim.endSession}>
                  <Square className="size-4" /> Save
                </button>
                <button className="secondary-button" onClick={sim.resetSession}>
                  <RotateCcw className="size-4" /> Reset
                </button>
              </div>
            )}
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
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Last result</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {latestSpin ? `${latestSpin.resultMultiplier}x | ${formatMoney(latestSpin.netResult)}` : "No spins yet"}
                </p>
              </div>
              <button
                disabled={!canSpin}
                onClick={() => sim.spin()}
                className="primary-button min-h-20 px-8 text-lg disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Zap className="size-5" /> Spin
              </button>
            </div>
            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">Planned autoplay</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Choose a fake bet and spin limit. It stops on reminders or insufficient fake balance.
                  </p>
                </div>
                <p className="text-sm font-semibold text-emerald-200">
                  {autoplayActive ? `${autoplayRemaining} spins left` : "Off"}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Field label="Autoplay bet">
                  <select
                    value={autoplayBetAmount}
                    disabled={autoplayActive}
                    onChange={(event) => setAutoplayBetAmount(Number(event.target.value))}
                    className="control"
                  >
                    {betOptions.map((bet) => (
                      <option key={bet} value={bet}>
                        {formatMoney(bet)}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Spin count">
                  <select
                    value={autoplaySpinCount}
                    disabled={autoplayActive}
                    onChange={(event) => setAutoplaySpinCount(Number(event.target.value))}
                    className="control"
                  >
                    {autoplaySpinPresets.map((count) => (
                      <option key={count} value={count}>
                        {count} spins
                      </option>
                    ))}
                  </select>
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
            <WarningPanel warnings={sim.warnings} />
          </aside>
        </div>
      </main>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
    </label>
  );
}
