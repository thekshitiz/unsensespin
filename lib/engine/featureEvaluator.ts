import type { EngineSymbolGrid, FeatureEvaluation, FeatureRules } from "@/types/engine";

export function evaluateFeature(grid: EngineSymbolGrid, featureRules: FeatureRules, betSize: number): FeatureEvaluation {
  const visibleSymbols = grid.flat();
  const scatterCount = visibleSymbols.filter((symbol) => symbol === "SCATTER").length;
  const featureSymbolCount = visibleSymbols.filter((symbol) => symbol === "FEATURE_SYMBOL").length;
  const scatterTriggered = scatterCount >= featureRules.scatterTriggerCount;
  const featureTriggered = featureSymbolCount >= featureRules.featureSymbolTriggerCount;
  const multiplier =
    (scatterTriggered ? featureRules.scatterMultiplier : 0) +
    (featureTriggered ? featureRules.featureSymbolMultiplier : 0);

  return {
    triggeredFeature: scatterTriggered || featureTriggered,
    scatterCount,
    featureSymbolCount,
    multiplier,
    winAmount: roundMoney(betSize * multiplier),
  };
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
