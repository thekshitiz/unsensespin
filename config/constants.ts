import type { VolatilityLevel } from "@/types/engine";

export const ENGINE_RTP_OPTIONS = [70, 80, 85, 90, 92, 94, 96, 97, 98] as const;
export const MACRO_SPIN_COUNT_OPTIONS = [1000, 10000, 100000, 500000, 1000000] as const;

export const ENGINE_PAYLINES = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
];

export const VOLATILITY_BASE_RTP: Record<VolatilityLevel, number> = {
  LOW: 92,
  MEDIUM: 94,
  HIGH: 96,
};
