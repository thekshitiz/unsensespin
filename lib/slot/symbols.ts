import { themes } from "@/lib/constants/themes";
import type { SpinOutcome, SymbolGrid, SymbolId, ThemeId } from "@/types/slot";

export const paylines = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
];

export function generateSymbols(theme: ThemeId, outcome: SpinOutcome): SymbolGrid {
  const symbols = themes[theme].symbols;
  const grid: SymbolGrid = Array.from({ length: 3 }, () =>
    Array.from({ length: 5 }, () => randomSymbol(symbols.map((symbol) => symbol.id))),
  );

  if (outcome.isWin) {
    const line = paylines[Math.floor(Math.random() * paylines.length)];
    const winningSymbol = randomSymbol(symbols.map((symbol) => symbol.id));
    for (let reel = 0; reel < 3; reel += 1) {
      grid[line[reel]][reel] = winningSymbol;
    }
  } else if (Math.random() < 0.28) {
    const highSymbols = symbols.filter((symbol) => symbol.tier === "high").map((symbol) => symbol.id);
    const otherSymbols = symbols.filter((symbol) => symbol.tier !== "high").map((symbol) => symbol.id);
    const line = paylines[Math.floor(Math.random() * paylines.length)];
    const nearMissSymbol = randomSymbol(highSymbols);
    grid[line[0]][0] = nearMissSymbol;
    grid[line[1]][1] = nearMissSymbol;
    grid[line[2]][2] = randomSymbol(otherSymbols);
  }

  return grid;
}

export function detectNearMiss(symbolGrid: SymbolGrid, theme: ThemeId): boolean {
  const highSymbols = new Set(
    themes[theme].symbols.filter((symbol) => symbol.tier === "high").map((symbol) => symbol.id),
  );

  return paylines.some((line) => {
    const first = symbolGrid[line[0]][0];
    const second = symbolGrid[line[1]][1];
    const third = symbolGrid[line[2]][2];
    return first === second && first !== third && highSymbols.has(first);
  });
}

export function detectWinningPayline(symbolGrid: SymbolGrid): number[] | undefined {
  return paylines.find((line) => {
    const first = symbolGrid[line[0]][0];
    const second = symbolGrid[line[1]][1];
    const third = symbolGrid[line[2]][2];
    return first === second && second === third;
  });
}

function randomSymbol(symbols: SymbolId[]) {
  return symbols[Math.floor(Math.random() * symbols.length)];
}
