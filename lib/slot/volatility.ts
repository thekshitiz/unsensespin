import type { OutcomeBucket, Volatility } from "@/types/slot";

export const volatilityBuckets: Record<Volatility, OutcomeBucket[]> = {
  low: [
    { multiplier: 0, weight: 45 },
    { multiplier: 0.5, weight: 25 },
    { multiplier: 1, weight: 18 },
    { multiplier: 2, weight: 8 },
    { multiplier: 5, weight: 3 },
    { multiplier: 10, weight: 1 },
  ],
  medium: [
    { multiplier: 0, weight: 60 },
    { multiplier: 0.5, weight: 15 },
    { multiplier: 1, weight: 12 },
    { multiplier: 3, weight: 8 },
    { multiplier: 8, weight: 4 },
    { multiplier: 20, weight: 1 },
  ],
  high: [
    { multiplier: 0, weight: 75 },
    { multiplier: 1, weight: 10 },
    { multiplier: 3, weight: 7 },
    { multiplier: 10, weight: 5 },
    { multiplier: 25, weight: 2 },
    { multiplier: 100, weight: 1 },
  ],
};

export const volatilityMessages: Record<Volatility, string> = {
  low: "Low volatility can make the game feel safer because small wins happen often, but the house edge still exists.",
  medium:
    "Medium volatility balances small wins and occasional larger outcomes, but expected loss is still controlled by RTP.",
  high: "High volatility can make players keep chasing the rare big win.",
};

export function averageReturn(buckets: OutcomeBucket[]) {
  const totalWeight = buckets.reduce((sum, bucket) => sum + bucket.weight, 0);
  return buckets.reduce((sum, bucket) => sum + bucket.multiplier * bucket.weight, 0) / totalWeight;
}
