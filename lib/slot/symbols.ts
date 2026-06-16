import { themes } from "@/lib/constants/themes";
import type { PaylineWin, SpinOutcome, SymbolGrid, SymbolId, ThemeId } from "@/types/slot";

export const paylines = [
  [0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1],
  [0, 1, 1, 1, 2],
  [2, 1, 1, 1, 0],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [0, 2, 1, 0, 2],
  [2, 0, 1, 2, 0],
  [1, 1, 0, 1, 1],
];

export function getActivePaylines(count?: number) {
  return paylines.slice(0, Math.min(Math.max(count ?? 10, 1), paylines.length));
}

export function generateSymbols(theme: ThemeId, outcome: SpinOutcome, activePaylineCount?: number): SymbolGrid {
  const symbols = themes[theme].symbols;
  const activePaylines = getActivePaylines(activePaylineCount);
  const grid: SymbolGrid = Array.from({ length: 3 }, () =>
    Array.from({ length: 5 }, () => randomSymbol(symbols.map((symbol) => symbol.id))),
  );

  if (outcome.isWin) {
    const selectedLineIndexes = pickWinningLineIndexes(outcome.multiplier, activePaylines.length);
    const winningSymbol = randomSymbol(symbols.map((symbol) => symbol.id));
    const matchCount = outcome.multiplier >= 10 ? 5 : outcome.multiplier >= 3 ? 4 : 3;
    selectedLineIndexes.forEach((lineIndex) => {
      const line = activePaylines[lineIndex];
      for (let reel = 0; reel < matchCount; reel += 1) {
        grid[line[reel]][reel] = winningSymbol;
      }
    });
  } else if (Math.random() < 0.28) {
    const highSymbols = symbols.filter((symbol) => symbol.tier === "high").map((symbol) => symbol.id);
    const otherSymbols = symbols.filter((symbol) => symbol.tier !== "high").map((symbol) => symbol.id);
    const line = activePaylines[Math.floor(Math.random() * activePaylines.length)];
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
  return evaluateWinningPaylines(symbolGrid, paylines.length)[0]?.line;
}

export function evaluateWinningPaylines(symbolGrid: SymbolGrid, activePaylineCount?: number): PaylineWin[] {
  return getActivePaylines(activePaylineCount)
    .map((line, lineIndex) => ({
      lineIndex,
      line,
      matchCount: detectWinningMatchCount(symbolGrid, line),
    }))
    .filter((item) => item.matchCount >= 3)
    .slice(0, 5);
}

function pickWinningLineIndexes(multiplier: number, activePaylineCount: number) {
  const targetLineCount = multiplier >= 25 ? 5 : multiplier >= 10 ? 3 : multiplier >= 5 ? 2 : 1;
  const lineIndexes = new Set<number>();

  while (lineIndexes.size < Math.min(targetLineCount, activePaylineCount)) {
    lineIndexes.add(Math.floor(Math.random() * activePaylineCount));
  }

  return [...lineIndexes];
}

export function detectWinningMatchCount(symbolGrid: SymbolGrid, line?: number[]): number {
  if (!line) {
    return 0;
  }

  const first = symbolGrid[line[0]][0];
  let matchCount = 1;

  for (let reel = 1; reel < line.length; reel += 1) {
    if (symbolGrid[line[reel]][reel] === first) {
      matchCount += 1;
    } else {
      break;
    }
  }

  return matchCount >= 3 ? matchCount : 0;
}

function randomSymbol(symbols: SymbolId[]) {
  return symbols[Math.floor(Math.random() * symbols.length)];
}
