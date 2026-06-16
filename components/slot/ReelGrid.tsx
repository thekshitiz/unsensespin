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
}: {
  grid?: SymbolGrid;
  theme: ThemeId;
  spinningKey: number;
  reducedMotion?: boolean;
  winningPayline?: number[];
}) {
  const fallback = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => themes[theme].symbols[(row * 5 + col) % themes[theme].symbols.length].id),
  );
  const visibleGrid = grid ?? fallback;

  return (
    <div className="relative grid grid-cols-5 gap-2 rounded-lg border border-white/10 bg-black/25 p-2 shadow-2xl">
      {winningPayline ? <PaylineOverlay line={winningPayline} /> : null}
      {visibleGrid.flatMap((row, rowIndex) =>
        row.map((symbolId, colIndex) => {
          const symbol = themes[theme].symbols.find((item) => item.id === symbolId);
          const isWinningCell = Boolean(winningPayline && winningPayline[colIndex] === rowIndex && colIndex < 3);
          return (
            <motion.div
              key={`${spinningKey}-${rowIndex}-${colIndex}-${symbolId}`}
              initial={reducedMotion ? false : { y: -12, opacity: 0.4 }}
              animate={reducedMotion ? undefined : { y: 0, opacity: 1 }}
              transition={{ duration: 0.2, delay: colIndex * 0.04 }}
              className={`relative z-10 grid aspect-square place-items-center rounded-md border text-center transition ${
                isWinningCell
                  ? "border-emerald-200 bg-emerald-300/20 shadow-[0_0_24px_rgba(52,211,153,0.35)]"
                  : "border-white/10 bg-slate-900/90"
              }`}
            >
              <SymbolIcon symbolId={symbolId} label={symbol?.label} className="size-7 text-emerald-100 sm:size-9" />
            </motion.div>
          );
        }),
      )}
    </div>
  );
}

function PaylineOverlay({ line }: { line: number[] }) {
  const points = line.slice(0, 3).map((row, col) => ({
    x: `${((col + 0.5) / 5) * 100}%`,
    y: `${((row + 0.5) / 3) * 100}%`,
  }));
  const path = points.map((point) => `${point.x} ${point.y}`).join(", ");

  return (
    <svg className="pointer-events-none absolute inset-2 z-20 h-[calc(100%-1rem)] w-[calc(100%-1rem)] overflow-visible">
      <polyline points={path} fill="none" stroke="rgba(16, 185, 129, 0.95)" strokeLinecap="round" strokeWidth="4" />
      {points.map((point) => (
        <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="6" fill="#a7f3d0" stroke="#064e3b" />
      ))}
    </svg>
  );
}
