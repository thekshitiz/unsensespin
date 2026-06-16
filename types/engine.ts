export type ThemeProfileKey = "EMPIRE_CONQUEST" | "REEL_CATCH";

export type VolatilityLevel = "LOW" | "MEDIUM" | "HIGH";

export type SymbolType =
  | "LOW_A"
  | "LOW_K"
  | "LOW_Q"
  | "LOW_J"
  | "MEDIUM_1"
  | "MEDIUM_2"
  | "HIGH_1"
  | "HIGH_2"
  | "WILD"
  | "SCATTER"
  | "FEATURE_SYMBOL";

// Reel-first shape: [reel][row].
export type EngineSymbolGrid = SymbolType[][];

export interface SymbolPayout {
  threeOfKind: number;
  fourOfKind: number;
  fiveOfKind: number;
}

export type Paytable = Record<SymbolType, SymbolPayout>;

export interface FeatureRules {
  scatterTriggerCount: number;
  scatterMultiplier: number;
  featureSymbolTriggerCount: number;
  featureSymbolMultiplier: number;
}

export interface ReelStripConfiguration {
  reel1: SymbolType[];
  reel2: SymbolType[];
  reel3: SymbolType[];
  reel4: SymbolType[];
  reel5: SymbolType[];
}

export interface ParSheetConfiguration {
  profileKey: ThemeProfileKey;
  volatility: VolatilityLevel;
  profileBaseRtp: number;
  reels: ReelStripConfiguration;
  paylines: number[][];
  paytable: Paytable;
  featureRules: FeatureRules;
}

export interface PaylineEvaluation {
  paylineIndex: number;
  line: number[];
  symbol: SymbolType;
  matchCount: number;
  multiplier: number;
  winAmount: number;
}

export interface FeatureEvaluation {
  triggeredFeature: boolean;
  scatterCount: number;
  featureSymbolCount: number;
  multiplier: number;
  winAmount: number;
}

export interface SpinInput {
  sessionId: string;
  profileKey: ThemeProfileKey;
  targetRtp: number;
  volatility: VolatilityLevel;
  betSize: number;
  currentBalance: number;
  timestamp: number;
}

export interface SpinOutput {
  spinId: string;
  timestamp: number;
  stopIndices: number[];
  symbolGrid: EngineSymbolGrid;
  paylineEvaluations: PaylineEvaluation[];
  baseGameWin: number;
  featureWin: number;
  totalWin: number;
  netResult: number;
  balanceAfterSpin: number;
  isWin: boolean;
  triggeredFeature: boolean;
  winningPayline?: number[];
}

export interface RtpAccuracyResult {
  profileKey: ThemeProfileKey;
  targetRtp: number;
  achievedRtp: number;
  deviation: number;
  spinCount: number;
  totalWagered: number;
  totalReturned: number;
}
