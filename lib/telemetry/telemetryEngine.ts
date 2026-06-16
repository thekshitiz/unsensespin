import { calculateVelocityOfLoss } from "@/lib/telemetry/velocityOfLoss";
import { detectLossChasing } from "@/lib/telemetry/lossChasingDetection";
import { detectRapidSpin } from "@/lib/telemetry/rapidSpinDetection";
import type { AdvancedTelemetryState, TelemetryInput, TelemetryWarning } from "@/types/telemetry";

export function calculateTelemetry(input: TelemetryInput): AdvancedTelemetryState {
  const velocityOfLoss = calculateVelocityOfLoss(
    input.totalWagered,
    input.totalReturned,
    input.sessionStartTimestamp,
    input.currentTimestamp,
  );

  const rapidSpinWarnings: TelemetryWarning[] = detectRapidSpin(input.currentSpin.secondsSincePreviousSpin)
    ? [
        {
          type: "RAPID_SPIN",
          message: "Fast repeated spins can make fake losses accumulate before you notice.",
          timestamp: input.currentTimestamp,
        },
      ]
    : [];

  const nearMissWarnings: TelemetryWarning[] = input.currentSpin.isNearMiss
    ? [
        {
          type: "NEAR_MISS",
          message: "That looked close, but it was still a loss. Near-misses can make random games feel more meaningful than they are.",
          timestamp: input.currentTimestamp,
        },
      ]
    : [];

  const draftTelemetry: AdvancedTelemetryState = {
    nearMissCount: input.spinHistory.filter((spin) => spin.isNearMiss).length + Number(input.currentSpin.isNearMiss),
    rapidSpinCount:
      input.spinHistory.filter((spin) => detectRapidSpin(spin.secondsSincePreviousSpin)).length +
      Number(detectRapidSpin(input.currentSpin.secondsSincePreviousSpin)),
    lossChasingWarningCount: 0,
    velocityOfLoss,
    peakVelocityOfLoss: velocityOfLoss,
    warnings: [],
  };

  const lossChasingWarnings = detectLossChasing(input.spinHistory, input.currentSpin, draftTelemetry);
  const stopLossWarnings: TelemetryWarning[] =
    input.totalWagered - input.totalReturned >= input.stopLossLimit
      ? [
          {
            type: "STOP_LOSS",
            message: "You reached your chosen fake loss limit. In real gambling, stopping here would protect money.",
            timestamp: input.currentTimestamp,
          },
        ]
      : [];
  const elapsedMinutes = (input.currentTimestamp - input.sessionStartTimestamp) / 60000;
  const timeLimitWarnings: TelemetryWarning[] =
    elapsedMinutes >= input.timeLimitMinutes
      ? [
          {
            type: "TIME_LIMIT",
            message: "Your planned session time is over. Time-on-device is one way gambling harm can grow.",
            timestamp: input.currentTimestamp,
          },
        ]
      : [];

  const warnings = [...nearMissWarnings, ...rapidSpinWarnings, ...lossChasingWarnings, ...stopLossWarnings, ...timeLimitWarnings];

  return {
    ...draftTelemetry,
    lossChasingWarningCount: lossChasingWarnings.length,
    warnings,
  };
}
