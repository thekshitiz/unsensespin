"use client";

import { useEffect, useMemo, useState } from "react";
import { generateSpinOutcome } from "@/lib/slot/engine";
import { calculateSessionStats, currentLossStreak } from "@/lib/slot/stats";
import { detectNearMiss, detectWinningPayline, generateSymbols } from "@/lib/slot/symbols";
import { detectSpinWarnings } from "@/lib/slot/warnings";
import { calculateVelocityOfLoss } from "@/lib/telemetry/velocityOfLoss";
import {
  clearActiveSession,
  loadActiveSession,
  loadSettings,
  saveActiveSession,
  saveCompletedSession,
  saveSettings,
} from "@/lib/storage/localStorage";
import { createId } from "@/lib/utils/ids";
import type { SlotSession, SpinRecord, UserSettings } from "@/types/session";
import type { SpinSettings, ThemeId, Volatility } from "@/types/slot";
import type { SessionWarning } from "@/types/warning";

export function useActiveSession() {
  const [settings, setSettingsState] = useState<UserSettings>(() => loadSettings());
  const [session, setSession] = useState<SlotSession | null>(() => loadActiveSession());
  const [betAmount, setBetAmount] = useState(() => loadActiveSession()?.defaultBetSize ?? loadSettings().defaultBetSize);
  const [theme, setTheme] = useState<ThemeId>(() => loadActiveSession()?.theme ?? "empire-conquest");
  const [rtp, setRtp] = useState(() => loadActiveSession()?.selectedRTP ?? loadSettings().defaultRTP);
  const [volatility, setVolatility] = useState<Volatility>(
    () => loadActiveSession()?.selectedVolatility ?? loadSettings().defaultVolatility,
  );
  const [warnings, setWarnings] = useState<SessionWarning[]>([]);
  const [startedAtMs, setStartedAtMs] = useState<number | null>(() => {
    const savedSession = loadActiveSession();
    return savedSession ? new Date(savedSession.createdAt).getTime() : null;
  });
  const [now, setNow] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const elapsedSeconds = startedAtMs ? Math.max(0, Math.floor((now - startedAtMs) / 1000)) : 0;

  const canConfigure = !session || session.totalSpins === 0;

  function updateSettings(next: UserSettings) {
    setSettingsState(next);
    saveSettings(next);
  }

  function startSession() {
    const createdAt = new Date().toISOString();
    const nextSession: SlotSession = {
      id: createId("session"),
      createdAt,
      theme,
      startingBalance: settings.startingBalance,
      endingBalance: settings.startingBalance,
      peakFakeBalance: settings.startingBalance,
      selectedRTP: rtp,
      selectedVolatility: volatility,
      defaultBetSize: betAmount,
      currentBetSize: betAmount,
      totalSpins: 0,
      totalWagered: 0,
      totalReturned: 0,
      totalWon: 0,
      baseGameTotalWon: 0,
      featureTotalWon: 0,
      netProfitLoss: 0,
      expectedLoss: 0,
      actualRtp: 0,
      actualVsExpectedDifference: 0,
      biggestWin: 0,
      longestLosingStreak: 0,
      nearMissCount: 0,
      lossChasingWarnings: 0,
      rapidSpinWarnings: 0,
      velocityOfLoss: 0,
      peakVelocityOfLoss: 0,
      stopLossTriggered: false,
      timeLimitTriggered: false,
      spinHistory: [],
    };

    setWarnings([]);
    setSession(nextSession);
    setStartedAtMs(Date.now());
    saveActiveSession(nextSession);
  }

  function spin(overrideBetAmount?: number): boolean {
    const activeSession = session;
    const spinBetAmount = overrideBetAmount ?? betAmount;
    if (!activeSession || activeSession.endingBalance < spinBetAmount || activeSession.endedAt) {
      return false;
    }

    const settingsForSpin: SpinSettings = {
      theme: activeSession.theme,
      betAmount: spinBetAmount,
      rtp: activeSession.selectedRTP,
      volatility: activeSession.selectedVolatility,
    };

    const previousSpin = activeSession.spinHistory.at(-1);
    const outcome = generateSpinOutcome(settingsForSpin);
    const isFeatureStyleWin = outcome.multiplier >= 10;
    const baseGameWin = isFeatureStyleWin ? 0 : outcome.winAmount;
    const featureWin = isFeatureStyleWin ? outcome.winAmount : 0;
    const symbols = generateSymbols(activeSession.theme, outcome);
    const winningPayline = outcome.isWin ? detectWinningPayline(symbols) : undefined;
    const isNearMiss = !outcome.isWin && detectNearMiss(symbols, activeSession.theme);
    const secondsSincePreviousSpin = previousSpin
      ? Math.max(0, (Date.now() - new Date(previousSpin.timestamp).getTime()) / 1000)
      : undefined;
    const balanceBeforeSpin = activeSession.endingBalance;
    const balanceAfterSpin = Number((balanceBeforeSpin + outcome.netResult).toFixed(2));
    const lossStreakAtSpin = outcome.netResult < 0 ? currentLossStreak(activeSession.spinHistory) + 1 : 0;
    const totalWageredAfterSpin = (activeSession.totalWagered ?? 0) + spinBetAmount;
    const totalReturnedAfterSpin = (activeSession.totalReturned ?? activeSession.totalWon ?? 0) + outcome.winAmount;
    const velocityOfLossAfterSpin = calculateVelocityOfLoss(
      totalWageredAfterSpin,
      totalReturnedAfterSpin,
      new Date(activeSession.createdAt).getTime(),
      Date.now(),
    );

    const currentSpin: SpinRecord = {
      id: createId("spin"),
      sessionId: activeSession.id,
      timestamp: new Date().toISOString(),
      betAmount: spinBetAmount,
      previousBetAmount: previousSpin?.betAmount ?? activeSession.defaultBetSize,
      resultMultiplier: outcome.multiplier,
      baseGameWin,
      featureWin,
      totalWin: outcome.winAmount,
      winAmount: outcome.winAmount,
      netResult: outcome.netResult,
      balanceBeforeSpin,
      balanceAfterSpin,
      isWin: outcome.isWin,
      isNearMiss,
      lossStreakAtSpin,
      secondsSincePreviousSpin,
      velocityOfLossAfterSpin,
      symbols,
      winningPayline,
    };

    const triggeredWarnings = detectSpinWarnings({
      session: activeSession,
      spinsBeforeCurrent: activeSession.spinHistory,
      currentSpin,
      previousBet: previousSpin?.betAmount ?? activeSession.defaultBetSize,
      settings,
      elapsedMinutes: elapsedSeconds / 60,
    });

    currentSpin.warningTriggered = triggeredWarnings[0]?.type;

    const updatedSpins = [...activeSession.spinHistory, currentSpin];
    const recalculated = calculateSessionStats(activeSession, updatedSpins);
    const nextSession: SlotSession = {
      ...recalculated,
      lossChasingWarnings:
        recalculated.lossChasingWarnings +
        triggeredWarnings.filter((warning) => warning.type === "bet-increase-after-losses").length,
      rapidSpinWarnings:
        recalculated.rapidSpinWarnings + triggeredWarnings.filter((warning) => warning.type === "rapid-spins").length,
      stopLossTriggered:
        recalculated.stopLossTriggered || triggeredWarnings.some((warning) => warning.type === "stop-loss-reached"),
      timeLimitTriggered:
        recalculated.timeLimitTriggered || triggeredWarnings.some((warning) => warning.type === "time-limit-reached"),
      currentBetSize: spinBetAmount,
      peakFakeBalance: Math.max(recalculated.peakFakeBalance ?? recalculated.startingBalance, balanceAfterSpin),
      velocityOfLoss: velocityOfLossAfterSpin,
      peakVelocityOfLoss: Math.max(recalculated.peakVelocityOfLoss ?? 0, velocityOfLossAfterSpin),
    };

    setWarnings((items) => [...triggeredWarnings, ...items].slice(0, 5));
    setSession(nextSession);
    saveActiveSession(nextSession);
    return true;
  }

  function endSession() {
    if (!session) {
      return;
    }
    const completed = { ...session, endedAt: new Date().toISOString() };
    saveCompletedSession(completed);
    clearActiveSession();
    setSession(completed);
  }

  function resetSession() {
    clearActiveSession();
    setSession(null);
    setWarnings([]);
    setStartedAtMs(null);
  }

  const chartData = useMemo(
    () =>
      session?.spinHistory.map((spin, index) => ({
        spin: index + 1,
        balance: spin.balanceAfterSpin,
        wagered: session.spinHistory.slice(0, index + 1).reduce((sum, item) => sum + item.betAmount, 0),
        expectedLoss: (session.spinHistory.slice(0, index + 1).reduce((sum, item) => sum + item.betAmount, 0) *
          (100 - session.selectedRTP)) /
          100,
        actualLoss: Math.max(0, session.startingBalance - spin.balanceAfterSpin),
        velocityOfLoss: spin.velocityOfLossAfterSpin ?? 0,
      })) ?? [],
    [session],
  );

  return {
    settings,
    updateSettings,
    session,
    warnings,
    theme,
    setTheme,
    rtp,
    setRtp,
    volatility,
    setVolatility,
    betAmount,
    setBetAmount,
    canConfigure,
    elapsedSeconds,
    startSession,
    spin,
    endSession,
    resetSession,
    chartData,
  };
}
