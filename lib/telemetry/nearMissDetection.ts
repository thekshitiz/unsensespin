import type { EngineSymbolGrid, SymbolType } from "@/types/engine";

export function detectNearMiss(
  grid: EngineSymbolGrid,
  paylines: number[][],
  highValueSymbols: SymbolType[],
): boolean {
  const highValues = new Set(highValueSymbols);

  return paylines.some((line) => {
    const first = grid[0][line[0]];
    const second = grid[1][line[1]];
    const third = grid[2][line[2]];
    return first === second && first !== third && highValues.has(first);
  });
}
