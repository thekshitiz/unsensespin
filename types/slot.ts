export type ThemeId = "empire-conquest" | "reel-catch";

export type Volatility = "low" | "medium" | "high";

export type SymbolId =
  | "crown"
  | "shield"
  | "sword"
  | "castle"
  | "scroll"
  | "coin-chest"
  | "banner"
  | "map"
  | "fish"
  | "rod"
  | "boat"
  | "anchor"
  | "treasure-chest"
  | "wave"
  | "lighthouse"
  | "fisherman";

export type SymbolGrid = SymbolId[][];

export type PaylineWin = {
  lineIndex: number;
  line: number[];
  matchCount: number;
};

export type ThemeSymbol = {
  id: SymbolId;
  label: string;
  tier: "low" | "medium" | "high";
};

export type SlotTheme = {
  id: ThemeId;
  name: string;
  description: string;
  symbols: ThemeSymbol[];
  className: string;
};

export type SpinSettings = {
  theme: ThemeId;
  betAmount: number;
  rtp: number;
  volatility: Volatility;
};

export type SpinOutcome = {
  multiplier: number;
  winAmount: number;
  netResult: number;
  isWin: boolean;
};

export type DebugOutcomeMode = "rng" | "force-loss" | "force-near-miss" | "force-win" | "force-bonus";

export type DebugSpinOverride = {
  mode: DebugOutcomeMode;
  multiplier: number;
};

export type OutcomeBucket = {
  multiplier: number;
  weight: number;
};

export type RTPResult = {
  spins: number;
  wagered: number;
  returned: number;
  estimatedRTP: number;
};
