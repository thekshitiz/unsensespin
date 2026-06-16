import { getParSheet } from "@/config/parSheets";
import { evaluateFeature } from "@/lib/engine/featureEvaluator";
import { evaluatePaylines } from "@/lib/engine/paylineEvaluator";
import { applyRtpScaling, roundMoney } from "@/lib/engine/rtpScaling";
import { generateStopIndices } from "@/lib/engine/reelStops";
import { generateSymbolGrid } from "@/lib/engine/symbolGrid";
import { createId } from "@/lib/utils/ids";
import type { RtpAccuracyResult, SpinInput, SpinOutput, ThemeProfileKey, VolatilityLevel } from "@/types/engine";

export function runMathOnlySpin(input: SpinInput): SpinOutput {
  const config = getParSheet(input.profileKey, input.volatility);
  const stopIndices = generateStopIndices(config);
  const symbolGrid = generateSymbolGrid(config, stopIndices);
  const paylineEvaluations = evaluatePaylines(symbolGrid, config.paylines, config.paytable, input.betSize);
  const featureEvaluation = evaluateFeature(symbolGrid, config.featureRules, input.betSize);

  const rawBaseWin = paylineEvaluations.reduce((sum, item) => sum + item.winAmount, 0);
  const rawFeatureWin = featureEvaluation.winAmount;
  const baseGameWin = applyRtpScaling(rawBaseWin, config.profileBaseRtp, input.targetRtp);
  const featureWin = applyRtpScaling(rawFeatureWin, config.profileBaseRtp, input.targetRtp);
  const totalWin = roundMoney(baseGameWin + featureWin);
  const balanceAfterSpin = roundMoney(input.currentBalance - input.betSize + totalWin);

  return {
    spinId: createId("engine_spin"),
    timestamp: input.timestamp,
    stopIndices,
    symbolGrid,
    paylineEvaluations,
    baseGameWin,
    featureWin,
    totalWin,
    netResult: roundMoney(totalWin - input.betSize),
    balanceAfterSpin,
    isWin: totalWin > 0,
    triggeredFeature: featureEvaluation.triggeredFeature,
    winningPayline: paylineEvaluations[0]?.line,
  };
}

export function simulateRtpAccuracy(
  profileKey: ThemeProfileKey,
  targetRtp: number,
  volatility: VolatilityLevel,
  spinCount: number,
): RtpAccuracyResult {
  let totalWagered = 0;
  let totalReturned = 0;

  for (let index = 0; index < spinCount; index += 1) {
    const spin = runMathOnlySpin({
      sessionId: "rtp_accuracy",
      profileKey,
      targetRtp,
      volatility,
      betSize: 1,
      currentBalance: 1000000,
      timestamp: 0,
    });
    totalWagered += 1;
    totalReturned += spin.totalWin;
  }

  const achievedRtp = totalWagered === 0 ? 0 : (totalReturned / totalWagered) * 100;

  return {
    profileKey,
    targetRtp,
    achievedRtp: roundMoney(achievedRtp),
    deviation: roundMoney(achievedRtp - targetRtp),
    spinCount,
    totalWagered: roundMoney(totalWagered),
    totalReturned: roundMoney(totalReturned),
  };
}
