import type { UserSettings } from "@/types/session";

export const rtpOptions = [70, 80, 85, 90, 92, 94, 96, 97, 98];
export const betOptions = [1, 2, 5, 10];
export const paylineOptions = [5, 10, 15, 20];

export const defaultSettings: UserSettings = {
  defaultTheme: "empire-conquest",
  startingBalance: 1000,
  defaultBetSize: 2,
  defaultRTP: 94,
  defaultVolatility: "medium",
  defaultActivePaylines: 10,
  sessionTimeReminderMinutes: 10,
  stopLossLimit: 100,
  soundEnabled: false,
  reducedMotion: false,
};
