import type { ParSheetConfiguration } from "@/types/engine";

export function generateStopIndices(config: ParSheetConfiguration): number[] {
  return getReels(config).map((reel) => Math.floor(Math.random() * reel.length));
}

export function getReels(config: ParSheetConfiguration) {
  return [config.reels.reel1, config.reels.reel2, config.reels.reel3, config.reels.reel4, config.reels.reel5];
}
