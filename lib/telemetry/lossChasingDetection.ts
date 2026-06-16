import type { SpinRecord } from "@/types/session";
import type { AdvancedTelemetryState, TelemetryWarning } from "@/types/telemetry";

export function detectLossChasing(
  spinHistory: SpinRecord[],
  currentSpin: SpinRecord,
  telemetry: AdvancedTelemetryState,
): TelemetryWarning[] {
  const previous = spinHistory.at(-1);
  const warnings: TelemetryWarning[] = [];

  if (currentSpin.lossStreakAtSpin >= 3 && previous && currentSpin.betAmount > previous.betAmount) {
    warnings.push({
      type: "LOSS_CHASING",
      message: "You increased your fake bet after a losing streak. This is a common loss-chasing pattern.",
      timestamp: Date.now(),
    });
  }

  if (telemetry.velocityOfLoss > 0 && telemetry.velocityOfLoss >= telemetry.peakVelocityOfLoss && currentSpin.netResult < 0) {
    warnings.push({
      type: "VELOCITY_OF_LOSS",
      message: "Your fake balance is falling quickly. In real gambling, this kind of speed can create serious financial harm.",
      timestamp: Date.now(),
    });
  }

  return warnings;
}
