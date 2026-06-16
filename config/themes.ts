import type { SymbolType, ThemeProfileKey } from "@/types/engine";

export const THEME_SYMBOL_LABELS: Record<ThemeProfileKey, Record<SymbolType, string>> = {
  EMPIRE_CONQUEST: {
    LOW_A: "Scroll",
    LOW_K: "Banner",
    LOW_Q: "Map",
    LOW_J: "Coin",
    MEDIUM_1: "Shield",
    MEDIUM_2: "Sword",
    HIGH_1: "Castle",
    HIGH_2: "Crown",
    WILD: "General Wild",
    SCATTER: "Fortress Scatter",
    FEATURE_SYMBOL: "Multiplier Standard",
  },
  REEL_CATCH: {
    LOW_A: "Wave",
    LOW_K: "Anchor",
    LOW_Q: "Net",
    LOW_J: "Tackle Box",
    MEDIUM_1: "Boat",
    MEDIUM_2: "Rod",
    HIGH_1: "Treasure Chest",
    HIGH_2: "Golden Fish",
    WILD: "Fisherman Wild",
    SCATTER: "Lighthouse Scatter",
    FEATURE_SYMBOL: "Cash Fish",
  },
};
