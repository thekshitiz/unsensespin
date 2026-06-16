import { calculateExpectedLoss, roundMoney } from "@/lib/slot/rtp";
import type { SlotSession, SpinRecord } from "@/types/session";

export function calculateLongestLosingStreak(spins: SpinRecord[]): number {
  let longest = 0;
  let current = 0;

  for (const spin of spins) {
    if (spin.netResult < 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

export function calculateSessionStats(session: SlotSession, spins: SpinRecord[]): SlotSession {
  const totalWagered = roundMoney(spins.reduce((sum, spin) => sum + spin.betAmount, 0));
  const totalWon = roundMoney(spins.reduce((sum, spin) => sum + spin.winAmount, 0));
  const baseGameTotalWon = roundMoney(spins.reduce((sum, spin) => sum + (spin.baseGameWin ?? spin.winAmount), 0));
  const featureTotalWon = roundMoney(spins.reduce((sum, spin) => sum + (spin.featureWin ?? 0), 0));
  const endingBalance = roundMoney(session.startingBalance - totalWagered + totalWon);
  const expectedLoss = calculateExpectedLoss(totalWagered, session.selectedRTP);
  const actualLoss = Math.max(0, session.startingBalance - endingBalance);
  const actualRtp = totalWagered === 0 ? 0 : roundMoney((totalWon / totalWagered) * 100);
  const peakFakeBalance = Math.max(session.startingBalance, ...spins.map((spin) => spin.balanceAfterSpin));
  const peakVelocityOfLoss = Math.max(0, ...spins.map((spin) => spin.velocityOfLossAfterSpin ?? 0));

  return {
    ...session,
    endingBalance,
    peakFakeBalance,
    totalSpins: spins.length,
    totalWagered,
    totalReturned: totalWon,
    totalWon,
    baseGameTotalWon,
    featureTotalWon,
    netProfitLoss: roundMoney(endingBalance - session.startingBalance),
    expectedLoss,
    actualRtp,
    actualVsExpectedDifference: roundMoney(actualLoss - expectedLoss),
    biggestWin: roundMoney(Math.max(0, ...spins.map((spin) => spin.winAmount))),
    longestLosingStreak: calculateLongestLosingStreak(spins),
    nearMissCount: spins.filter((spin) => spin.isNearMiss).length,
    velocityOfLoss: spins.at(-1)?.velocityOfLossAfterSpin ?? session.velocityOfLoss ?? 0,
    peakVelocityOfLoss,
    spinHistory: spins,
  };
}

export function currentLossStreak(spins: SpinRecord[]): number {
  let streak = 0;
  for (let index = spins.length - 1; index >= 0; index -= 1) {
    if (spins[index].netResult < 0) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
}
