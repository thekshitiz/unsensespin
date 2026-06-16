"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bug, Eye, EyeOff, Pause, Play, RotateCcw, Square, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BonusRoundOverlay } from "@/components/slot/BonusRoundOverlay";
import { DebugStatsPanel } from "@/components/slot/DebugStatsPanel";
import { ReelGrid } from "@/components/slot/ReelGrid";
import { SessionStatsPanel } from "@/components/slot/SessionStatsPanel";
import { WarningPanel } from "@/components/slot/WarningPanel";
import { themeList, themes } from "@/lib/constants/themes";
import { formatMoney } from "@/lib/utils/currency";
import { useActiveSession } from "@/hooks/useActiveSession";
import type { SpinRecord } from "@/types/session";
import type { ThemeId } from "@/types/slot";
import type { SessionWarning } from "@/types/warning";

type AutoplayMode = "rounds" | "until-broke";

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
  const [autoplayMode, setAutoplayMode] = useState<AutoplayMode>("rounds");
  const [bonusSpinId, setBonusSpinId] = useState<string | null>(null);
  const [dismissedBonusSpinIds, setDismissedBonusSpinIds] = useState<Set<string>>(() => new Set());
  const [isRolling, setIsRolling] = useState(false);
  const [winPaused, setWinPaused] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showOutcomeNotice, setShowOutcomeNotice] = useState(true);
  const [rngSeed, setRngSeed] = useState(() => Math.floor(Math.random() * 900000) + 100000);
  const simRef = useRef(sim);
  const isRollingRef = useRef(isRolling);
  const winPausedRef = useRef(winPaused);
  const latestSpin = sim.session?.spinHistory.at(-1);
  const sessionId = sim.session?.id;
  const activeTheme = themes[sim.session?.theme ?? sim.theme];
  const canSpin = Boolean(
    sim.session && sim.session.endingBalance >= sim.betAmount && !sim.session.endedAt && !isRolling && !winPaused,
  );
  const canAutoplay = Boolean(!autoplayActive && !isRolling && !winPaused);
  const notificationFeed = buildNotificationFeed(sim.warnings);
  const activePaylines = sim.session?.activePaylines ?? sim.settings.defaultActivePaylines;
  const houseEdge = 100 - sim.rtp;
  const bonusProbability = estimateBonusProbability(activePaylines, sim.volatility);
  const themeFeatureCopy =
    (sim.session?.theme ?? sim.theme) === "reel-catch"
      ? {
          title: "Reeling Fish Feature",
          body: "Fish, lighthouse scatters, and treasure symbols can create fake free-spin moments, multi-line catches, and re-spin style pauses.",
        }
      : {
          title: "Grand Conquest Feature",
          body: "Crown, castle, and banner streaks can create fake multi-line conquest wins, grand bonus pauses, and boosted feature return.",
        };

  useEffect(() => {
    simRef.current = sim;
  }, [sim]);

  useEffect(() => {
    isRollingRef.current = isRolling;
  }, [isRolling]);

  useEffect(() => {
    winPausedRef.current = winPaused;
  }, [winPaused]);

  const runSpinWithScroll = useCallback(
    (betAmount: number, afterSpin?: (didSpin: boolean) => void) => {
      if (isRollingRef.current || winPausedRef.current) {
        return false;
      }

      setIsRolling(true);
      setRngSeed(Math.floor(Math.random() * 900000) + 100000);
      window.setTimeout(() => {
        const didSpin = simRef.current.spin(betAmount);
        setIsRolling(false);
        afterSpin?.(didSpin);
      }, sim.settings.reducedMotion ? 120 : 820);
      return true;
    },
    [sim.settings.reducedMotion],
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
      if (latestSpin.grandBonusTriggered || latestSpin.resultMultiplier >= 10) {
        setAutoplayActive(false);
      }
      setWinPaused(true);
      window.setTimeout(() => setWinPaused(false), latestSpin.resultMultiplier >= 25 ? 2200 : 1300);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [latestSpin]);

  useEffect(() => {
    if (!autoplayActive) {
      return;
    }

    if (autoplayMode === "rounds" && autoplayRemaining <= 0) {
      const timeout = window.setTimeout(() => setAutoplayActive(false), 0);
      return () => window.clearTimeout(timeout);
    }

    const currentSession = simRef.current.session;

    if (!currentSession || isRolling || winPaused) {
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
        autoplaySession.endedAt ||
        autoplaySession.stopLossTriggered ||
        autoplaySession.timeLimitTriggered ||
        autoplaySession.endingBalance <= 0
      ) {
        setAutoplayActive(false);
        return;
      }

      const nextBetAmount =
        autoplayMode === "until-broke"
          ? Number(Math.max(0, autoplaySession.endingBalance).toFixed(2))
          : autoplayBetAmount;

      if (nextBetAmount <= 0 || autoplaySession.endingBalance < nextBetAmount) {
        setAutoplayActive(false);
        return;
      }

      const didStart = runSpinWithScroll(nextBetAmount, (didSpin) => {
        if (didSpin) {
          if (autoplayMode === "rounds") {
            setAutoplayRemaining((remaining) => Math.max(0, remaining - 1));
          }
        } else {
          setAutoplayActive(false);
        }
      });

      if (!didStart) {
        return;
      }
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [autoplayActive, autoplayBetAmount, autoplayMode, autoplayRemaining, isRolling, runSpinWithScroll, sessionId, winPaused]);

  function startAutoplay() {
    if (!sim.session) {
      sim.startSession();
    }
    setAutoplayMode("rounds");
    setAutoplayRemaining(Math.max(1, Math.floor(autoplaySpinCount)));
    setAutoplayActive(true);
  }

  function startMaxBetUntilBroke() {
    if (!sim.session) {
      sim.startSession();
    }
    setAutoplayMode("until-broke");
    setAutoplayRemaining(0);
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

  function handleGameChange(nextTheme: ThemeId) {
    setAutoplayActive(false);
    setAutoplayRemaining(0);
    setWinPaused(false);
    setBonusSpinId(null);
    setDismissedBonusSpinIds(new Set());
    if (sim.session) {
      sim.resetSession();
    }
    sim.setTheme(nextTheme);
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
        <div
          className={`mx-auto grid gap-6 px-4 py-8 sm:px-6 ${
            zenMode ? "max-w-3xl lg:grid-cols-1" : "max-w-7xl lg:grid-cols-[0.75fr_1.25fr_0.85fr]"
          }`}
        >
          {!zenMode ? (
          <aside className="rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                  {debugMode ? "Telemetry lab" : "Risk feed"}
                </p>
                <h1 className="text-2xl font-bold text-white">{debugMode ? "Debug Console" : "Notifications"}</h1>
              </div>
              <button
                className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 text-xs font-semibold transition ${
                  debugMode
                    ? "border-emerald-300/50 bg-emerald-300/20 text-emerald-100"
                    : "border-white/10 bg-white/10 text-slate-300"
                }`}
                onClick={() => setDebugMode((value) => !value)}
              >
                <Bug className="size-3.5" />
                {debugMode ? "Debug on" : "Debug off"}
              </button>
            </div>
            <div className="mt-4">
              {debugMode ? (
                <DebugStatsPanel
                  activePaylines={activePaylines}
                  betAmount={sim.betAmount}
                  bonusProbability={bonusProbability}
                  elapsedSeconds={sim.elapsedSeconds}
                  rngSeed={rngSeed}
                  rtp={sim.rtp}
                  session={sim.session}
                  volatility={sim.volatility}
                />
              ) : (
                <div className="space-y-3">
                  {latestSpin && !isRolling ? (
                    <SpinNotificationCard
                      isVisible={showOutcomeNotice}
                      spin={latestSpin}
                      theme={sim.session?.theme ?? sim.theme}
                      onToggle={() => setShowOutcomeNotice((value) => !value)}
                    />
                  ) : null}
                  <WarningPanel warnings={notificationFeed} />
                </div>
              )}
            </div>
          </aside>
          ) : null}

          <section className="space-y-5 rounded-lg border border-white/10 bg-slate-950/70 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">{activeTheme.name}</p>
                <h2 className="text-3xl font-black text-white">Fake-money reels</h2>
              </div>
              <button
                className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  zenMode
                    ? "border-cyan-200/50 bg-cyan-300/20 text-cyan-50"
                    : "border-white/10 bg-white/10 text-slate-200 hover:bg-white/15"
                }`}
                onClick={() => setZenMode((value) => !value)}
              >
                {zenMode ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {zenMode ? "Exit Zen" : "Zen Mode"}
              </button>
            </div>
            <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-300 md:grid-cols-2">
              {!zenMode ? (
                <>
                  <div>
                    <h3 className="font-bold text-white">Paylines</h3>
                    <p className="mt-1">
                      A payline is the path where matching symbols must land to pay. This simulator uses straight,
                      diagonal, V-shape, W-shape, and zigzag paylines across both original themes.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{themeFeatureCopy.title}</h3>
                    <p className="mt-1">{themeFeatureCopy.body}</p>
                  </div>
                </>
              ) : null}
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-bold text-white">Game</span>
                <select
                  className="control"
                  value={sim.session?.theme ?? sim.theme}
                  disabled={autoplayActive || isRolling}
                  onChange={(event) => handleGameChange(event.target.value as ThemeId)}
                >
                  {themeList.map((theme) => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name}
                    </option>
                  ))}
                </select>
              </label>
            </section>
            <ReelGrid
              grid={latestSpin?.symbols}
              theme={sim.session?.theme ?? sim.theme}
              spinningKey={sim.session?.totalSpins ?? 0}
              reducedMotion={sim.settings.reducedMotion}
              winningPayline={latestSpin?.winningPayline}
              winningMatchCount={latestSpin?.winningMatchCount}
              winningPaylines={latestSpin?.winningPaylines}
              winAmount={latestSpin?.winAmount}
              multiplier={latestSpin?.resultMultiplier}
              isRolling={isRolling}
              debugMode={debugMode}
              debugMetrics={{
                bonusProbability,
                rngSeed,
                houseEdge,
                activePaylines,
                actualRtp: sim.session?.actualRtp ?? 0,
                expectedLoss: sim.session?.expectedLoss ?? 0,
                actualLoss: Math.max(0, (sim.session?.totalWagered ?? 0) - (sim.session?.totalReturned ?? sim.session?.totalWon ?? 0)),
              }}
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
                {latestSpin?.grandBonusTriggered ? (
                  <p className="mt-2 rounded-md border border-amber-200/30 bg-amber-300/10 px-3 py-2 text-sm font-semibold text-amber-100">
                    Grand bonus: up to five paylines connected on this fake result.
                  </p>
                ) : null}
                {latestSpin && !isRolling ? <SpinResultExplanation spin={latestSpin} theme={sim.session?.theme ?? sim.theme} /> : null}
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
                    Enter your own fake bet and number of rounds. It pauses on wins, then stops on bonus events or insufficient fake balance.
                  </p>
                </div>
                <p className="text-sm font-semibold text-emerald-200">
                  {autoplayActive
                    ? autoplayMode === "until-broke"
                      ? "Max bet until broke"
                      : `${autoplayRemaining} rounds left`
                    : winPaused
                      ? "Paused on win"
                      : "Off"}
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
              {!autoplayActive ? (
                <button
                  disabled={!canAutoplay}
                  className="mt-3 w-full rounded-md border border-rose-300/35 bg-rose-400/15 px-4 py-3 text-sm font-black uppercase tracking-wide text-rose-100 transition hover:border-rose-200 hover:bg-rose-400/25 disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={startMaxBetUntilBroke}
                >
                  <Zap className="mr-2 inline size-4" /> Max bet until I lose it all
                </button>
              ) : null}
            </section>
          </section>

          {!zenMode ? (
            <aside className="space-y-4">
              <SessionStatsPanel session={sim.session} elapsedSeconds={sim.elapsedSeconds} />
            </aside>
          ) : null}
        </div>
      </main>
    </AppShell>
  );
}

function estimateBonusProbability(activePaylines: number, volatility: string) {
  const volatilityFactor = volatility === "high" ? 1.35 : volatility === "medium" ? 1 : 0.72;
  return Math.min(8.5, 0.28 + activePaylines * 0.052 * volatilityFactor);
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

function SpinNotificationCard({
  spin,
  theme,
  isVisible,
  onToggle,
}: {
  spin: SpinRecord;
  theme: ThemeId;
  isVisible: boolean;
  onToggle: () => void;
}) {
  const content = getSpinNotificationContent(spin, theme);

  return (
    <article className={`rounded-lg border p-4 ${content.className}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-white">{content.title}</h3>
        <button
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold text-slate-100 transition hover:bg-white/15"
          onClick={onToggle}
        >
          {isVisible ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
          {isVisible ? "Hide" : "Show"}
        </button>
      </div>
      {isVisible ? (
        <>
          <p className="mt-2 text-sm leading-6 text-white/85">{content.body}</p>
          {content.details.length ? (
            <ul className="mt-2 space-y-1 text-sm leading-6 text-white/80">
              {content.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 text-xs leading-5 text-white/65">{content.footer}</p>
        </>
      ) : (
        <p className="mt-2 text-xs text-white/60">Latest spin explanation hidden.</p>
      )}
    </article>
  );
}

function getSpinNotificationContent(spin: SpinRecord, theme: ThemeId) {
  const themeSymbols = themes[theme].symbols;
  const symbolLabel = (symbolId?: string) =>
    themeSymbols.find((symbol) => symbol.id === symbolId)?.label ?? symbolId ?? "symbol";

  if (spin.isWin) {
    const winningLines = spin.winningPaylines?.length
      ? spin.winningPaylines
      : spin.winningPayline
        ? [{ lineIndex: 0, line: spin.winningPayline, matchCount: spin.winningMatchCount ?? 0 }]
        : [];

    return {
      title: "How this result happened",
      body:
        spin.betAmount > 0
          ? `${formatMoney(spin.betAmount)} bet x ${spin.resultMultiplier} = ${formatMoney(spin.winAmount)} gross win. After returning the stake cost, the displayed net result is ${formatMoney(spin.netResult)}.`
          : `A bonus feature award added ${formatMoney(spin.netResult)} without charging another spin stake.`,
      details: winningLines.map((win) => {
        const matchedSymbol = symbolLabel(spin.symbols[win.line[0]]?.[0]);
        const path = win.line.map((row, reel) => `R${reel + 1}:${row + 1}`).join(" -> ");
        return `Payline ${win.lineIndex + 1}: ${matchedSymbol} matched across ${win.matchCount} reels on ${path}.`;
      }),
      footer:
        "The connector shows the active payline path. A win explains what already happened; it does not predict the next spin.",
      className: "border-emerald-300/30 bg-emerald-300/10",
    };
  }

  if (spin.isNearMiss) {
    return {
      title: "Why this still lost",
      body: `The reel showed a near-miss pattern, but no active payline reached three matching symbols from the left. The full ${formatMoney(spin.betAmount)} stake was lost on this spin.`,
      details: [],
      footer:
        "Near-misses can feel close, but they do not make the next random spin more controllable or more likely to win.",
      className: "border-amber-300/30 bg-amber-300/10",
    };
  }

  return {
    title: "Why this lost",
    body: `No active payline reached three matching symbols from the left, so the multiplier stayed at 0x and the full ${formatMoney(spin.betAmount)} stake was lost on this spin.`,
    details: [],
    footer: "Each spin is independent. A streak of losses does not build hidden progress toward a future win.",
    className: "border-slate-400/20 bg-white/[0.04]",
  };
}

function SpinResultExplanation({ spin, theme }: { spin: SpinRecord; theme: ThemeId }) {
  const themeSymbols = themes[theme].symbols;
  const symbolLabel = (symbolId?: string) =>
    themeSymbols.find((symbol) => symbol.id === symbolId)?.label ?? symbolId ?? "symbol";
  const grossWin = spin.winAmount;
  const formula =
    spin.betAmount > 0
      ? `${formatMoney(spin.betAmount)} bet x ${spin.resultMultiplier} = ${formatMoney(grossWin)} gross win; ${formatMoney(grossWin)} - ${formatMoney(spin.betAmount)} stake = ${formatMoney(spin.netResult)} net result.`
      : `Feature award added ${formatMoney(spin.netResult)} without charging another spin stake.`;

  if (spin.isWin) {
    const winningLines = spin.winningPaylines?.length
      ? spin.winningPaylines
      : spin.winningPayline
        ? [{ lineIndex: 0, line: spin.winningPayline, matchCount: spin.winningMatchCount ?? 0 }]
        : [];

    return (
      <div className="mt-3 rounded-md border border-emerald-300/25 bg-emerald-300/10 p-3 text-sm text-emerald-50">
        <p className="font-bold text-white">How this result happened</p>
        <p className="mt-1 text-emerald-100">{formula}</p>
        {winningLines.length ? (
          <ul className="mt-2 space-y-1 text-emerald-100">
            {winningLines.map((win) => {
              const matchedSymbol = symbolLabel(spin.symbols[win.line[0]]?.[0]);
              const path = win.line.map((row, reel) => `R${reel + 1}:${row + 1}`).join(" -> ");
              return (
                <li key={`${win.lineIndex}-${win.matchCount}`}>
                  Payline {win.lineIndex + 1}: {matchedSymbol} matched across {win.matchCount} reels on {path}.
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="mt-2 text-xs text-emerald-200/85">
          The highlighted connector shows the payline path. The multiplier is the simulated payout rate for this spin,
          not evidence that the next spin is more likely to win.
        </p>
      </div>
    );
  }

  if (spin.isNearMiss) {
    return (
      <div className="mt-3 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm text-amber-50">
        <p className="font-bold text-white">Why this still lost</p>
        <p className="mt-1">
          The reel showed a near-miss pattern, but no active payline reached three matching symbols from the left.
          The full {formatMoney(spin.betAmount)} stake was lost on this spin.
        </p>
        <p className="mt-2 text-xs text-amber-100/85">
          Near-misses can feel close, but they do not make the next random spin more controllable or more likely to win.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-slate-400/20 bg-slate-900/70 p-3 text-sm text-slate-200">
      <p className="font-bold text-white">Why this lost</p>
      <p className="mt-1">
        None of the active paylines produced at least three matching symbols from the left, so the multiplier stayed at
        0x and the {formatMoney(spin.betAmount)} stake was deducted.
      </p>
      <p className="mt-2 text-xs text-slate-400">
        Each spin is independent. A losing streak does not build hidden progress toward a future win.
      </p>
    </div>
  );
}
