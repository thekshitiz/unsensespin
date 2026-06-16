import { defaultSettings } from "@/lib/constants/options";
import type { SlotSession, UserSettings } from "@/types/session";

const activeSessionKey = "spinsense.activeSession";
const sessionHistoryKey = "spinsense.sessionHistory";
const settingsKey = "spinsense.settings";

export function loadSettings(): UserSettings {
  return { ...defaultSettings, ...(readJson<Partial<UserSettings>>(settingsKey) ?? {}) };
}

export function saveSettings(settings: UserSettings) {
  writeJson(settingsKey, settings);
}

export function loadActiveSession(): SlotSession | null {
  return readJson<SlotSession>(activeSessionKey);
}

export function saveActiveSession(session: SlotSession) {
  writeJson(activeSessionKey, session);
}

export function clearActiveSession() {
  localStorage.removeItem(activeSessionKey);
}

export function loadSessionHistory(): SlotSession[] {
  return readJson<SlotSession[]>(sessionHistoryKey) ?? [];
}

export function saveCompletedSession(session: SlotSession) {
  const history = loadSessionHistory();
  writeJson(sessionHistoryKey, [session, ...history.filter((item) => item.id !== session.id)].slice(0, 50));
}

export function clearAllSpinSenseData() {
  localStorage.removeItem(activeSessionKey);
  localStorage.removeItem(sessionHistoryKey);
  localStorage.removeItem(settingsKey);
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}
