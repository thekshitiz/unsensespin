"use client";

import { motion } from "framer-motion";
import { SymbolIcon } from "@/components/slot/SymbolIcon";
import { themes } from "@/lib/constants/themes";
import type { PaylineWin, SymbolGrid, ThemeId } from "@/types/slot";

type DebugMetrics = {
  bonusProbability: number;
  rngSeed: number;
  houseEdge: number;
  activePaylines: number;
  actualRtp: number;
  expectedLoss: number;
  actualLoss: number;
};

export function ReelGrid({
  grid,
  theme,
  spinningKey,
  reducedMotion,
  winningPayline,
  winningMatchCount = 0,
  winningPaylines,
  winAmount,
  multiplier,
  isRolling,
  debugMode,
  debugMetrics,
}: {
  grid?: SymbolGrid;
  theme: ThemeId;
  spinningKey: number;
  reducedMotion?: boolean;
  winningPayline?: number[];
  winningMatchCount?: number;
  winningPaylines?: PaylineWin[];
  winAmount?: number;
  multiplier?: number;
  isRolling?: boolean;
  debugMode?: boolean;
  debugMetrics?: DebugMetrics;
}) {
  const fallback = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => themes[theme].symbols[(row * 5 + col) % themes[theme].symbols.length].id),
  );
  const visibleGrid = grid ?? fallback;
  const visibleWins = winningPaylines?.length
    ? winningPaylines
    : winningPayline
      ? [{ lineIndex: 0, line: winningPayline, matchCount: winningMatchCount }]
      : [];
  const isGrandBonus = visibleWins.length >= 5 || (multiplier ?? 0) >= 25;

  return (
    <div className="relative grid grid-cols-5 gap-2 overflow-hidden rounded-lg border border-amber-300/30 bg-black/40 p-2 shadow-2xl">
      {!isRolling && visibleWins.length > 0 ? <PaylineOverlay wins={visibleWins} isGrandBonus={isGrandBonus} /> : null}
      {!isRolling && winAmount && winAmount > 0 ? (
        <WinOverlay amount={winAmount} multiplier={multiplier} reducedMotion={reducedMotion} isGrandBonus={isGrandBonus} />
      ) : null}
      {debugMode && debugMetrics ? <DebugReelOverlay metrics={debugMetrics} isRolling={Boolean(isRolling)} /> : null}
      {visibleGrid.flatMap((row, rowIndex) =>
        row.map((symbolId, colIndex) => {
          const symbol = themes[theme].symbols.find((item) => item.id === symbolId);
          const isWinningCell =
            !isRolling &&
            visibleWins.some((win) => win.line[colIndex] === rowIndex && colIndex < win.matchCount);
          return (
            <motion.div
              key={`${spinningKey}-${rowIndex}-${colIndex}-${symbolId}`}
              initial={reducedMotion ? false : isRolling ? { opacity: 0.85 } : { y: -12, opacity: 0.4 }}
              animate={reducedMotion ? undefined : isRolling ? { opacity: 1 } : { y: 0, opacity: 1 }}
              transition={{
                duration: isRolling ? 0.36 : 0.38,
                delay: isRolling ? colIndex * 0.1 + rowIndex * 0.03 : colIndex * 0.08,
                ease: "easeOut",
              }}
              className={`relative z-10 grid aspect-square place-items-center overflow-hidden rounded-md border text-center transition ${
                isWinningCell
                  ? "border-amber-200 bg-amber-300/25 shadow-[0_0_28px_rgba(251,191,36,0.5)]"
                  : "border-white/10 bg-slate-900/90"
              }`}
            >
              {isRolling && !reducedMotion ? (
                <RollingTileStack theme={theme} colIndex={colIndex} rowIndex={rowIndex} finalSymbolId={symbolId} />
              ) : (
                <SymbolIcon
                  symbolId={symbolId}
                  label={symbol?.label}
                  className={`size-7 sm:size-9 ${isWinningCell ? "text-amber-100" : "text-emerald-100"}`}
                />
              )}
            </motion.div>
          );
        }),
      )}
    </div>
  );
}

function DebugReelOverlay({ metrics, isRolling }: { metrics: DebugMetrics; isRolling: boolean }) {
  const rows = [
    ["Probability of Bonus Trigger", `${metrics.bonusProbability.toFixed(2)}%`],
    ["RNG Seed", String(metrics.rngSeed)],
    ["Current House Edge", `${metrics.houseEdge.toFixed(2)}%`],
    ["Active Payline Bus", `${metrics.activePaylines}/20`],
    ["Actual RTP Stream", `${metrics.actualRtp.toFixed(2)}%`],
    ["Loss Delta", `${(metrics.actualLoss - metrics.expectedLoss).toFixed(2)}`],
    ["Reel State", isRolling ? "SCANNING" : "LOCKED"],
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-50 p-3 font-mono text-[10px] text-emerald-100">
      <div className="grid h-full grid-cols-2 content-between gap-2">
        {rows.map(([label, value], index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035 }}
            className="w-fit rounded border border-emerald-300/25 bg-slate-950/70 px-2 py-1 shadow-[0_0_18px_rgba(16,185,129,0.18)] backdrop-blur"
          >
            <span className="text-emerald-300">{label}: </span>
            <span className="font-black text-white">{value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RollingTileStack({
  theme,
  colIndex,
  rowIndex,
  finalSymbolId,
}: {
  theme: ThemeId;
  colIndex: number;
  rowIndex: number;
  finalSymbolId: SymbolGrid[number][number];
}) {
  const themeSymbols = themes[theme].symbols;
  const rollingSymbols = [
    finalSymbolId,
    ...Array.from({ length: 6 }, (_, index) => themeSymbols[(index + colIndex * 2 + rowIndex) % themeSymbols.length].id),
  ];

  return (
    <motion.div
      className="absolute inset-x-1 top-0 flex flex-col gap-1"
      initial={{ y: "-78%" }}
      animate={{ y: "0%" }}
      transition={{
        duration: 0.95 + colIndex * 0.16 + rowIndex * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {rollingSymbols.map((rollingSymbol, index) => (
        <div
          key={`${rollingSymbol}-${index}`}
          className="grid aspect-square place-items-center rounded-md border border-cyan-200/20 bg-slate-900 shadow-inner"
        >
          <SymbolIcon symbolId={rollingSymbol} className="size-7 text-cyan-100 sm:size-9" />
        </div>
      ))}
    </motion.div>
  );
}

const lineColors = ["#fde047", "#38bdf8", "#fb7185", "#a78bfa", "#34d399"];

function PaylineOverlay({ wins, isGrandBonus }: { wins: PaylineWin[]; isGrandBonus: boolean }) {
  return (
    <svg className="pointer-events-none absolute inset-2 z-30 h-[calc(100%-1rem)] w-[calc(100%-1rem)] overflow-visible">
      {wins.map((win, winIndex) => {
        const points = win.line.map((row, col) => ({
          x: `${((col + 0.5) / 5) * 100}%`,
          y: `${((row + 0.5) / 3) * 100}%`,
        }));
        const matchedPoints = points.slice(0, Math.max(3, win.matchCount));
        const fullPath = points.map((point) => `${point.x} ${point.y}`).join(", ");
        const matchedPath = matchedPoints.map((point) => `${point.x} ${point.y}`).join(", ");
        const color = lineColors[winIndex % lineColors.length];

        return (
          <g key={`${win.lineIndex}-${win.matchCount}`}>
            <polyline points={fullPath} fill="none" stroke={`${color}66`} strokeLinecap="round" strokeWidth="3" />
            <polyline
              points={matchedPath}
              fill="none"
              stroke={color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isGrandBonus ? "7" : "5"}
            />
            {matchedPoints.map((point, index) => (
              <g key={`${win.lineIndex}-${point.x}-${point.y}`}>
                <circle cx={point.x} cy={point.y} r="9" fill={color} stroke="#020617" strokeWidth="3" />
                <text
                  x={point.x}
                  y={point.y}
                  dy="3.5"
                  textAnchor="middle"
                  className="fill-slate-950 text-[9px] font-black"
                >
                  {index + 1}
                </text>
              </g>
            ))}
          </g>
        );
      })}
      <text x="2%" y="10%" className="fill-amber-200 text-[11px] font-black uppercase tracking-wide">
        {isGrandBonus ? "Grand Multi-Line Bonus" : `${wins.length} Payline Win${wins.length > 1 ? "s" : ""}`}
      </text>
    </svg>
  );
}

function WinOverlay({
  amount,
  multiplier,
  reducedMotion,
  isGrandBonus,
}: {
  amount: number;
  multiplier?: number;
  reducedMotion?: boolean;
  isGrandBonus: boolean;
}) {
  const displayAmount = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <motion.div
      initial={reducedMotion ? false : { y: 12, scale: 0.94, opacity: 0 }}
      animate={reducedMotion ? undefined : { y: 0, scale: 1, opacity: 1 }}
      transition={{ delay: reducedMotion ? 0 : 0.85, duration: 0.5, ease: "easeOut" }}
      className="pointer-events-none absolute inset-x-2 bottom-2 z-40 flex justify-end"
    >
      <div className="max-w-[72%] rounded-lg border border-amber-200/70 bg-slate-950/80 px-4 py-2 text-right shadow-[0_0_32px_rgba(250,204,21,0.38)] backdrop-blur-sm sm:max-w-[52%]">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">
          {isGrandBonus ? "Grand fake bonus" : "Fake win"}
        </p>
        <p className="text-3xl font-black leading-none text-rose-100 [text-shadow:0_2px_0_#7f1d1d,0_0_18px_rgba(251,113,133,0.85)] sm:text-4xl">
          {displayAmount}
        </p>
        {multiplier ? (
          <p className="mt-1 text-xs font-bold text-amber-100 sm:text-sm">
            {multiplier >= 25 ? "Jackpot-style fake hit | " : ""}
            {multiplier.toFixed(2)}x multiplier
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
