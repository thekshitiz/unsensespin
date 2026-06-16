import type { ThemeProfileKey, VolatilityLevel } from "./engine";

export interface BatchSimulationConfig {
  profileKey: ThemeProfileKey;
  targetRtp: number;
  volatility: VolatilityLevel;
  totalSpinsToRun: number;
  simBetSize: number;
  startingBankroll?: number;
}

export interface BatchSimulationResult {
  profileKey: ThemeProfileKey;
  targetRtp: number;
  volatility: VolatilityLevel;
  simulatedSpinsExecuted: number;
  simBetSize: number;
  totalSimulatedWagered: number;
  totalSimulatedReturned: number;
  achievedActualRtp: number;
  rtpDeviation: number;
  baseRtpContribution: number;
  featureRtpContribution: number;
  totalBaseWon: number;
  totalFeatureWon: number;
  totalBustSessions: number;
  bustProbability?: number;
  biggestWin: number;
  longestLosingStreak: number;
  executionTimeMs: number;
}

export interface MacroWorkerInput {
  type: "RUN_MACRO_SIMULATION";
  payload: BatchSimulationConfig;
}

export interface MacroWorkerOutput {
  type: "MACRO_SIMULATION_COMPLETE" | "MACRO_SIMULATION_ERROR";
  payload?: BatchSimulationResult;
  error?: string;
}
