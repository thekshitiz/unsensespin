import { ENGINE_PAYLINES, VOLATILITY_BASE_RTP } from "@/config/constants";
import { DEFAULT_FEATURE_RULES, DEFAULT_PAYTABLE } from "@/config/paytables";
import type { ParSheetConfiguration, ReelStripConfiguration, SymbolType, ThemeProfileKey, VolatilityLevel } from "@/types/engine";

const lowReelBias: SymbolType[] = ["LOW_A", "LOW_K", "LOW_Q", "LOW_J"];

export function getParSheet(profileKey: ThemeProfileKey, volatility: VolatilityLevel): ParSheetConfiguration {
  return {
    profileKey,
    volatility,
    profileBaseRtp: VOLATILITY_BASE_RTP[volatility],
    reels: profileKey === "EMPIRE_CONQUEST" ? buildEmpireReels(volatility) : buildReelCatchReels(volatility),
    paylines: ENGINE_PAYLINES,
    paytable: DEFAULT_PAYTABLE,
    featureRules: DEFAULT_FEATURE_RULES,
  };
}

function buildEmpireReels(volatility: VolatilityLevel): ReelStripConfiguration {
  const rare: SymbolType[] = volatility === "HIGH" ? ["HIGH_2", "WILD"] : ["HIGH_1", "WILD", "LOW_A"];
  const frequent: SymbolType[] =
    volatility === "LOW" ? [...lowReelBias, "MEDIUM_1", "MEDIUM_2"] : [...lowReelBias, "LOW_A"];

  return {
    reel1: [...frequent, "MEDIUM_1", "HIGH_1", "SCATTER", ...rare],
    reel2: [...frequent, "MEDIUM_2", "HIGH_2", "WILD", "LOW_J"],
    reel3: [...frequent, "MEDIUM_1", "HIGH_1", "SCATTER", "FEATURE_SYMBOL"],
    reel4: [...frequent, "MEDIUM_2", "HIGH_2", "LOW_K", "FEATURE_SYMBOL"],
    reel5: [...frequent, "MEDIUM_1", "HIGH_1", "SCATTER", ...rare],
  };
}

function buildReelCatchReels(volatility: VolatilityLevel): ReelStripConfiguration {
  const rare: SymbolType[] =
    volatility === "HIGH" ? ["HIGH_2", "FEATURE_SYMBOL"] : ["HIGH_1", "SCATTER", "LOW_K"];
  const frequent: SymbolType[] =
    volatility === "LOW" ? [...lowReelBias, "MEDIUM_1", "MEDIUM_2"] : [...lowReelBias, "LOW_A"];

  return {
    reel1: [...frequent, "MEDIUM_1", "HIGH_1", "SCATTER", ...rare],
    reel2: [...frequent, "MEDIUM_2", "HIGH_2", "SCATTER", "LOW_J"],
    reel3: [...frequent, "MEDIUM_1", "HIGH_1", "FEATURE_SYMBOL", "SCATTER"],
    reel4: [...frequent, "MEDIUM_2", "HIGH_2", "FEATURE_SYMBOL", "LOW_A"],
    reel5: [...frequent, "MEDIUM_1", "HIGH_1", "SCATTER", ...rare],
  };
}
