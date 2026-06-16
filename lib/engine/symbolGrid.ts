import { getReels } from "@/lib/engine/reelStops";
import type { EngineSymbolGrid, ParSheetConfiguration } from "@/types/engine";

export function generateSymbolGrid(config: ParSheetConfiguration, stopIndices: number[]): EngineSymbolGrid {
  return getReels(config).map((reel, reelIndex) => {
    const stopIndex = stopIndices[reelIndex] % reel.length;
    return [0, 1, 2].map((offset) => reel[(stopIndex + offset) % reel.length]);
  });
}
