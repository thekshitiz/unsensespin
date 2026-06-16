import { create } from "zustand";
import { calculateExpectedLoss } from "@/lib/slot/rtp";
import { runMathOnlySpin } from "@/lib/engine/slotEngine";
import type { SymbolId, SymbolGrid } from "@/types/slot";
import type { SlotSession, SpinRecord } from "@/types/session";
import type { AdvancedTelemetryState } from "@/types/telemetry";
import type { ThemeProfileKey, VolatilityLevel } from "@/types/engine";

interface StartSessionConfig {
  profileKey: ThemeProfileKey;
  targetRtp: number;
  volatility: VolatilityLevel;
  startingBalance: number;
  betSize: number;
}

interface GameStore {
  activeSession: SlotSession | null;
  spinHistory: SpinRecord[];
  telemetry: AdvancedTelemetryState;
  startSession: (config: StartSessionConfig) => void;
  spin: () => void;
  endSession: () => void;
  resetSession: () => void;
  setTheme: (theme: ThemeProfileKey) => void;
  setTargetRtp: (rtp: number) => void;
  setVolatility: (volatility: VolatilityLevel) => void;
  setBetSize: (betSize: number) => void;
}

const defaultTelemetry: AdvancedTelemetryState = {
  nearMissCount: 0,
  rapidSpinCount: 0,
  lossChasingWarningCount: 0,
  velocityOfLoss: 0,
  peakVelocityOfLoss: 0,
  warnings: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  activeSession: null,
  spinHistory: [],
  telemetry: defaultTelemetry,
  startSession(config) {
    const createdAt = new Date().toISOString();
    set({
      activeSession: {
        id: `store_session_${Date.now()}`,
        createdAt,
        theme: config.profileKey === "EMPIRE_CONQUEST" ? "empire-conquest" : "reel-catch",
        startingBalance: config.startingBalance,
        endingBalance: config.startingBalance,
        peakFakeBalance: config.startingBalance,
        selectedRTP: config.targetRtp,
        selectedVolatility: config.volatility.toLowerCase() as "low" | "medium" | "high",
        defaultBetSize: config.betSize,
        currentBetSize: config.betSize,
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
      },
      spinHistory: [],
      telemetry: defaultTelemetry,
    });
  },
  spin() {
    const session = get().activeSession;
    if (!session || session.endingBalance < (session.currentBetSize ?? session.defaultBetSize)) {
      return;
    }

    const betSize = session.currentBetSize ?? session.defaultBetSize;
    const output = runMathOnlySpin({
      sessionId: session.id,
      profileKey: session.theme === "empire-conquest" ? "EMPIRE_CONQUEST" : "REEL_CATCH",
      targetRtp: session.selectedRTP,
      volatility: session.selectedVolatility.toUpperCase() as VolatilityLevel,
      betSize,
      currentBalance: session.endingBalance,
      timestamp: Date.now(),
    });

    const previousSpin = get().spinHistory.at(-1);
    const spinRecord: SpinRecord = {
      id: output.spinId,
      sessionId: session.id,
      timestamp: new Date(output.timestamp).toISOString(),
      betAmount: betSize,
      previousBetAmount: previousSpin?.betAmount ?? session.defaultBetSize,
      resultMultiplier: betSize === 0 ? 0 : output.totalWin / betSize,
      baseGameWin: output.baseGameWin,
      featureWin: output.featureWin,
      totalWin: output.totalWin,
      winAmount: output.totalWin,
      netResult: output.netResult,
      balanceBeforeSpin: session.endingBalance,
      balanceAfterSpin: output.balanceAfterSpin,
      isWin: output.isWin,
      isNearMiss: false,
      lossStreakAtSpin: output.netResult < 0 ? (previousSpin?.lossStreakAtSpin ?? 0) + 1 : 0,
      secondsSincePreviousSpin: previousSpin
        ? Math.max(0, (output.timestamp - new Date(previousSpin.timestamp).getTime()) / 1000)
        : undefined,
      symbols: mapEngineGridToUiGrid(output.symbolGrid, session.theme),
      winningPayline: output.winningPayline,
    };

    const spinHistory = [...get().spinHistory, spinRecord];
    const totalWagered = session.totalWagered + betSize;
    const totalReturned = (session.totalReturned ?? session.totalWon) + output.totalWin;
    const endingBalance = output.balanceAfterSpin;
    set({
      spinHistory,
      activeSession: {
        ...session,
        endingBalance,
        peakFakeBalance: Math.max(session.peakFakeBalance ?? session.startingBalance, endingBalance),
        totalSpins: session.totalSpins + 1,
        totalWagered,
        totalReturned,
        totalWon: totalReturned,
        baseGameTotalWon: (session.baseGameTotalWon ?? 0) + output.baseGameWin,
        featureTotalWon: (session.featureTotalWon ?? 0) + output.featureWin,
        netProfitLoss: endingBalance - session.startingBalance,
        expectedLoss: calculateExpectedLoss(totalWagered, session.selectedRTP),
        actualRtp: totalWagered === 0 ? 0 : (totalReturned / totalWagered) * 100,
        biggestWin: Math.max(session.biggestWin, output.totalWin),
        spinHistory,
      },
    });
  },
  endSession() {
    const session = get().activeSession;
    if (session) {
      set({ activeSession: { ...session, endedAt: new Date().toISOString() } });
    }
  },
  resetSession() {
    set({ activeSession: null, spinHistory: [], telemetry: defaultTelemetry });
  },
  setTheme(theme) {
    const session = get().activeSession;
    if (session && session.totalSpins === 0) {
      set({ activeSession: { ...session, theme: theme === "EMPIRE_CONQUEST" ? "empire-conquest" : "reel-catch" } });
    }
  },
  setTargetRtp(rtp) {
    const session = get().activeSession;
    if (session && session.totalSpins === 0) {
      set({ activeSession: { ...session, selectedRTP: rtp } });
    }
  },
  setVolatility(volatility) {
    const session = get().activeSession;
    if (session && session.totalSpins === 0) {
      set({ activeSession: { ...session, selectedVolatility: volatility.toLowerCase() as "low" | "medium" | "high" } });
    }
  },
  setBetSize(betSize) {
    const session = get().activeSession;
    if (session) {
      set({ activeSession: { ...session, currentBetSize: betSize } });
    }
  },
}));

function mapEngineGridToUiGrid(
  grid: import("@/types/engine").EngineSymbolGrid,
  theme: SlotSession["theme"],
): SymbolGrid {
  const mappedByReel = grid.map((reel) => reel.map((symbol) => mapSymbol(symbol, theme)));
  return [0, 1, 2].map((row) => mappedByReel.map((reel) => reel[row]));
}

function mapSymbol(symbol: import("@/types/engine").SymbolType, theme: SlotSession["theme"]): SymbolId {
  const empire: Record<import("@/types/engine").SymbolType, SymbolId> = {
    LOW_A: "scroll",
    LOW_K: "banner",
    LOW_Q: "map",
    LOW_J: "coin-chest",
    MEDIUM_1: "shield",
    MEDIUM_2: "sword",
    HIGH_1: "castle",
    HIGH_2: "crown",
    WILD: "crown",
    SCATTER: "castle",
    FEATURE_SYMBOL: "banner",
  };
  const catchMap: Record<import("@/types/engine").SymbolType, SymbolId> = {
    LOW_A: "wave",
    LOW_K: "anchor",
    LOW_Q: "rod",
    LOW_J: "fish",
    MEDIUM_1: "boat",
    MEDIUM_2: "rod",
    HIGH_1: "treasure-chest",
    HIGH_2: "fish",
    WILD: "fisherman",
    SCATTER: "lighthouse",
    FEATURE_SYMBOL: "fish",
  };

  return theme === "empire-conquest" ? empire[symbol] : catchMap[symbol];
}
