import type { FeatureRules, Paytable } from "@/types/engine";

export const DEFAULT_PAYTABLE: Paytable = {
  LOW_A: { threeOfKind: 0.2, fourOfKind: 0.5, fiveOfKind: 1 },
  LOW_K: { threeOfKind: 0.2, fourOfKind: 0.5, fiveOfKind: 1 },
  LOW_Q: { threeOfKind: 0.3, fourOfKind: 0.7, fiveOfKind: 1.2 },
  LOW_J: { threeOfKind: 0.3, fourOfKind: 0.7, fiveOfKind: 1.2 },
  MEDIUM_1: { threeOfKind: 0.5, fourOfKind: 1.5, fiveOfKind: 3 },
  MEDIUM_2: { threeOfKind: 0.7, fourOfKind: 2, fiveOfKind: 4 },
  HIGH_1: { threeOfKind: 1, fourOfKind: 3, fiveOfKind: 8 },
  HIGH_2: { threeOfKind: 1.5, fourOfKind: 5, fiveOfKind: 12 },
  WILD: { threeOfKind: 2, fourOfKind: 8, fiveOfKind: 25 },
  SCATTER: { threeOfKind: 0, fourOfKind: 0, fiveOfKind: 0 },
  FEATURE_SYMBOL: { threeOfKind: 0, fourOfKind: 0, fiveOfKind: 0 },
};

export const DEFAULT_FEATURE_RULES: FeatureRules = {
  scatterTriggerCount: 3,
  scatterMultiplier: 5,
  featureSymbolTriggerCount: 3,
  featureSymbolMultiplier: 3,
};
