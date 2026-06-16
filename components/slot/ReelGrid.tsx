"use client";

import { motion } from "framer-motion";
import { SymbolIcon } from "@/components/slot/SymbolIcon";
import { themes } from "@/lib/constants/themes";
import type { SymbolGrid, ThemeId } from "@/types/slot";

export function ReelGrid({
  grid,
  theme,
  spinningKey,
  reducedMotion,
  winningPayline,
  winningMatchCount = 0,
  winAmount,
  multiplier,
  isRolling,
}: {
  grid?: SymbolGrid;
  theme: ThemeId;
  spinningKey: number;
  reducedMotion?: boolean;
  winningPayline?: number[];
  winningMatchCount?: number;
  winAmount?: number;
  multiplier?: number;
  isRolling?: boolean;
}) {
  const fallback = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => themes[theme].symbols[(row * 5 + col) % themes[theme].symbols.length].id),
  );
  const visibleGrid = grid ?? fallback;

  return (
    <div className="relative grid grid-cols-5 gap-2 overflow-hidden rounded-lg border border-amber-300/30 bg-black/40 p-2 shadow-2xl">
      {!isRolling && winningPayline ? <PaylineOverlay line={winningPayline} matchCount={winningMatchCount} /> : null}
      {!isRolling && winAmount && winAmount > 0 ? (
        <WinOverlay amount={winAmount} multiplier={multiplier} reducedMotion={reducedMotion} />
      ) : null}
      {visibleGrid.flatMap((row, rowIndex) =>
        row.map((symbolId, colIndex) => {
          const symbol = themes[theme].symbols.find((item) => item.id === symbolId);
          const isWinningCell = Boolean(
            !isRolling &&
            winningPayline && winningPayline[colIndex] === rowIndex && colIndex < winningMatchCount,
          );
          return (
            <motion.div
              key={`${spinningKey}-${rowIndex}-${colIndex}-${symbolId}`}
              initial={
                reducedMotion
                  ? false
                  : isRolling
                    ? { rotateX: 0, opacity: 0.55, scale: 0.96 }
                    : { y: -12, opacity: 0.4 }
              }
              animate={
                reducedMotion
                  ? undefined
                  : isRolling
                    ? {
                        rotateX: [0, -88, -178, -268, -358, -360],
                        opacity: [0.55, 0.7, 0.82, 0.9, 1, 1],
                        scale: [0.96, 0.98, 1, 0.99, 1.01, 1],
                      }
                    : { y: 0, opacity: 1 }
              }
              transition={{
                duration: isRolling ? 0.7 + colIndex * 0.16 + rowIndex * 0.05 : 0.38,
                delay: isRolling ? colIndex * 0.1 + rowIndex * 0.03 : colIndex * 0.08,
                ease: isRolling ? [0.2, 0.8, 0.2, 1] : "easeOut",
              }}
              className={`relative z-10 grid aspect-square place-items-center rounded-md border text-center transition ${
                isWinningCell
                  ? "border-amber-200 bg-amber-300/25 shadow-[0_0_28px_rgba(251,191,36,0.5)]"
                  : "border-white/10 bg-slate-900/90"
              } [backface-visibility:hidden] [transform-style:preserve-3d]`}
            >
              <SymbolIcon
                symbolId={symbolId}
                label={symbol?.label}
                className={`size-7 sm:size-9 ${isRolling ? "text-cyan-100" : isWinningCell ? "text-amber-100" : "text-emerald-100"}`}
              />
            </motion.div>
          );
        }),
      )}
    </div>
  );
}

function PaylineOverlay({ line, matchCount }: { line: number[]; matchCount: number }) {
  const points = line.map((row, col) => ({
    x: `${((col + 0.5) / 5) * 100}%`,
    y: `${((row + 0.5) / 3) * 100}%`,
  }));
  const matchedPoints = points.slice(0, Math.max(3, matchCount));
  const path = points.map((point) => `${point.x} ${point.y}`).join(", ");
  const matchedPath = matchedPoints.map((point) => `${point.x} ${point.y}`).join(", ");

  return (
    <svg className="pointer-events-none absolute inset-2 z-30 h-[calc(100%-1rem)] w-[calc(100%-1rem)] overflow-visible">
      <polyline points={path} fill="none" stroke="rgba(251, 146, 60, 0.42)" strokeLinecap="round" strokeWidth="3" />
      <polyline
        points={matchedPath}
        fill="none"
        stroke="rgba(253, 224, 71, 0.98)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="6"
      />
      {matchedPoints.map((point, index) => (
        <g key={`${point.x}-${point.y}`}>
          <circle cx={point.x} cy={point.y} r="11" fill="#facc15" stroke="#7c2d12" strokeWidth="3" />
          <text
            x={point.x}
            y={point.y}
            dy="4"
            textAnchor="middle"
            className="fill-slate-950 text-[10px] font-black"
          >
            {index + 1}
          </text>
        </g>
      ))}
      <text x="2%" y="10%" className="fill-amber-200 text-[11px] font-black uppercase tracking-wide">
        Payline Win
      </text>
    </svg>
  );
}

function WinOverlay({
  amount,
  multiplier,
  reducedMotion,
}: {
  amount: number;
  multiplier?: number;
  reducedMotion?: boolean;
}) {
  const displayAmount = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <motion.div
      initial={reducedMotion ? false : { scale: 0.9, opacity: 0 }}
      animate={reducedMotion ? undefined : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.46, ease: "easeOut" }}
      className="pointer-events-none absolute inset-0 z-40 grid place-items-center bg-black/10"
    >
      <div className="rounded-lg border border-amber-200/70 bg-slate-950/70 px-5 py-3 text-center shadow-[0_0_40px_rgba(250,204,21,0.45)] backdrop-blur-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-200">Fake win</p>
        <p className="text-4xl font-black leading-none text-rose-100 [text-shadow:0_2px_0_#7f1d1d,0_0_18px_rgba(251,113,133,0.85)] sm:text-6xl">
          {displayAmount}
        </p>
        {multiplier ? (
          <p className="mt-1 text-sm font-bold text-amber-100">
            {multiplier >= 25 ? "Jackpot-style fake hit | " : ""}
            {multiplier.toFixed(2)}x multiplier
          </p>
        ) : null}
      </div>
    </motion.div>
  );
}
