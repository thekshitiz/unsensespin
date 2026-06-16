import type { EngineSymbolGrid, PaylineEvaluation, Paytable, SymbolType } from "@/types/engine";

const nonLineSymbols = new Set<SymbolType>(["SCATTER", "FEATURE_SYMBOL"]);

export function evaluatePaylines(
  grid: EngineSymbolGrid,
  paylines: number[][],
  paytable: Paytable,
  betSize: number,
): PaylineEvaluation[] {
  return paylines.flatMap((line, paylineIndex) => {
    const lineSymbols = line.map((row, reelIndex) => grid[reelIndex][row]);
    const target = lineSymbols.find((symbol) => symbol !== "WILD" && !nonLineSymbols.has(symbol));

    if (!target) {
      return [];
    }

    let matchCount = 0;
    for (const symbol of lineSymbols) {
      if (symbol === target || symbol === "WILD") {
        matchCount += 1;
      } else {
        break;
      }
    }

    if (matchCount < 3) {
      return [];
    }

    const payout = paytable[target];
    const multiplier =
      matchCount >= 5 ? payout.fiveOfKind : matchCount === 4 ? payout.fourOfKind : payout.threeOfKind;

    if (multiplier <= 0) {
      return [];
    }

    return [
      {
        paylineIndex,
        line,
        symbol: target,
        matchCount,
        multiplier,
        winAmount: roundMoney(betSize * multiplier),
      },
    ];
  });
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}
