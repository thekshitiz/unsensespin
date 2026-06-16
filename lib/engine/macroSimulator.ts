import { runMathOnlySpin } from "@/lib/engine/slotEngine";
import { roundMoney } from "@/lib/engine/rtpScaling";
import type { BatchSimulationConfig, BatchSimulationResult } from "@/types/macro";

export function runMacroBatchSimulation(config: BatchSimulationConfig): BatchSimulationResult {
  const startedAt = performance.now();
  const startingBankroll = config.startingBankroll ?? 1000;

  let totalSimulatedWagered = 0;
  let totalSimulatedReturned = 0;
  let totalBaseWon = 0;
  let totalFeatureWon = 0;
  let biggestWin = 0;
  let currentLosingStreak = 0;
  let longestLosingStreak = 0;
  let simulatedBankroll = startingBankroll;
  let totalBustSessions = 0;

  for (let index = 0; index < config.totalSpinsToRun; index += 1) {
    if (simulatedBankroll < config.simBetSize) {
      totalBustSessions += 1;
      simulatedBankroll = startingBankroll;
    }

    const spin = runMathOnlySpin({
      sessionId: "macro_batch",
      profileKey: config.profileKey,
      targetRtp: config.targetRtp,
      volatility: config.volatility,
      betSize: config.simBetSize,
      currentBalance: simulatedBankroll,
      timestamp: 0,
    });

    totalSimulatedWagered += config.simBetSize;
    totalSimulatedReturned += spin.totalWin;
    totalBaseWon += spin.baseGameWin;
    totalFeatureWon += spin.featureWin;
    simulatedBankroll = spin.balanceAfterSpin;
    biggestWin = Math.max(biggestWin, spin.totalWin);

    if (spin.totalWin <= 0) {
      currentLosingStreak += 1;
      longestLosingStreak = Math.max(longestLosingStreak, currentLosingStreak);
    } else {
      currentLosingStreak = 0;
    }
  }

  const achievedActualRtp =
    totalSimulatedWagered === 0 ? 0 : (totalSimulatedReturned / totalSimulatedWagered) * 100;

  return {
    profileKey: config.profileKey,
    targetRtp: config.targetRtp,
    volatility: config.volatility,
    simulatedSpinsExecuted: config.totalSpinsToRun,
    simBetSize: config.simBetSize,
    totalSimulatedWagered: roundMoney(totalSimulatedWagered),
    totalSimulatedReturned: roundMoney(totalSimulatedReturned),
    achievedActualRtp: roundMoney(achievedActualRtp),
    rtpDeviation: roundMoney(achievedActualRtp - config.targetRtp),
    baseRtpContribution: roundMoney((totalBaseWon / totalSimulatedWagered) * 100),
    featureRtpContribution: roundMoney((totalFeatureWon / totalSimulatedWagered) * 100),
    totalBaseWon: roundMoney(totalBaseWon),
    totalFeatureWon: roundMoney(totalFeatureWon),
    totalBustSessions,
    bustProbability: roundMoney((totalBustSessions / config.totalSpinsToRun) * 100),
    biggestWin: roundMoney(biggestWin),
    longestLosingStreak,
    executionTimeMs: roundMoney(performance.now() - startedAt),
  };
}
