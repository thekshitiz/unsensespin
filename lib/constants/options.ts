import type { UserSettings } from "@/types/session";

export const rtpOptions = [70, 80, 85, 90, 92, 94, 96, 97, 98];
export const betOptions = [1, 2, 5, 10];

export const defaultSettings: UserSettings = {
  startingBalance: 1000,
  defaultBetSize: 2,
  defaultRTP: 94,
  defaultVolatility: "medium",
  sessionTimeReminderMinutes: 10,
  stopLossLimit: 100,
  soundEnabled: false,
  reducedMotion: false,
};
