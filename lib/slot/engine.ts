import { volatilityBuckets, averageReturn } from "@/lib/slot/volatility";
import { roundMoney } from "@/lib/slot/rtp";
import type { OutcomeBucket, RTPResult, SpinOutcome, SpinSettings } from "@/types/slot";

export function generateSpinOutcome(settings: SpinSettings): SpinOutcome {
  const buckets = volatilityBuckets[settings.volatility];
  const bucket = pickWeightedBucket(buckets);
  const baseAverage = averageReturn(buckets);
  const targetAverage = settings.rtp / 100;
  const scaledMultiplier = bucket.multiplier === 0 ? 0 : bucket.multiplier * (targetAverage / baseAverage);
  const multiplier = Number(scaledMultiplier.toFixed(2));
  const winAmount = roundMoney(settings.betAmount * multiplier);

  return {
    multiplier,
    winAmount,
    netResult: roundMoney(winAmount - settings.betAmount),
    isWin: winAmount > 0,
  };
}

export function simulateRTP(settings: SpinSettings, spins: number): RTPResult {
  let returned = 0;
  const wagered = settings.betAmount * spins;

  for (let index = 0; index < spins; index += 1) {
    returned += generateSpinOutcome(settings).winAmount;
  }

  return {
    spins,
    wagered,
    returned: roundMoney(returned),
    estimatedRTP: Number(((returned / wagered) * 100).toFixed(2)),
  };
}

function pickWeightedBucket(buckets: OutcomeBucket[]) {
  const totalWeight = buckets.reduce((sum, bucket) => sum + bucket.weight, 0);
  let cursor = Math.random() * totalWeight;

  for (const bucket of buckets) {
    cursor -= bucket.weight;
    if (cursor <= 0) {
      return bucket;
    }
  }

  return buckets[buckets.length - 1];
}
