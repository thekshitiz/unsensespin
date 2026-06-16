export type WarningType =
  | "near-miss"
  | "loss-streak"
  | "bet-increase-after-losses"
  | "stop-loss-reached"
  | "time-limit-reached"
  | "rapid-spins"
  | "big-win-context";

export type SessionWarning = {
  type: WarningType;
  title: string;
  message: string;
  timestamp: string;
};
