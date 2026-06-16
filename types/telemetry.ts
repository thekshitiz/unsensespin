import type { SpinRecord } from "./session";

export type TelemetryWarningType =
  | "NEAR_MISS"
  | "LOSS_CHASING"
  | "RAPID_SPIN"
  | "STOP_LOSS"
  | "TIME_LIMIT"
  | "VELOCITY_OF_LOSS";

export interface TelemetryWarning {
  type: TelemetryWarningType;
  message: string;
  timestamp: number;
}

export interface AdvancedTelemetryState {
  nearMissCount: number;
  rapidSpinCount: number;
  lossChasingWarningCount: number;
  velocityOfLoss: number;
  peakVelocityOfLoss: number;
  warnings: TelemetryWarning[];
}

export interface TelemetryInput {
  spinHistory: SpinRecord[];
  currentSpin: SpinRecord;
  sessionStartTimestamp: number;
  currentTimestamp: number;
  totalWagered: number;
  totalReturned: number;
  stopLossLimit: number;
  timeLimitMinutes: number;
}
