"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { defaultSettings, paylineOptions, rtpOptions } from "@/lib/constants/options";
import { themeList } from "@/lib/constants/themes";
import { clearAllSpinSenseData, loadSettings, saveSettings } from "@/lib/storage/localStorage";
import type { UserSettings } from "@/types/session";
import type { ThemeId, Volatility } from "@/types/slot";

const volatilityOptions: Volatility[] = ["low", "medium", "high"];

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());

  function update<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-black text-white">Settings</h1>
        <div className="mt-6 grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Default theme</span>
            <select className="control" value={settings.defaultTheme} onChange={(event) => update("defaultTheme", event.target.value as ThemeId)}>
              {themeList.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
            </select>
          </label>
          <NumberField label="Starting fake balance" value={settings.startingBalance} onChange={(value) => update("startingBalance", value)} />
          <NumberField label="Default bet size" value={settings.defaultBetSize} onChange={(value) => update("defaultBetSize", value)} />
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Default RTP</span>
            <select className="control" value={settings.defaultRTP} onChange={(event) => update("defaultRTP", Number(event.target.value))}>
              {rtpOptions.map((rtp) => <option key={rtp} value={rtp}>{rtp}%</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Default volatility</span>
            <select className="control" value={settings.defaultVolatility} onChange={(event) => update("defaultVolatility", event.target.value as Volatility)}>
              {volatilityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span className="mb-2 block text-sm font-medium text-slate-300">Active paylines</span>
            <select className="control" value={settings.defaultActivePaylines} onChange={(event) => update("defaultActivePaylines", Number(event.target.value))}>
              {paylineOptions.map((count) => <option key={count} value={count}>{count} paylines</option>)}
            </select>
          </label>
          <NumberField label="Session reminder minutes" value={settings.sessionTimeReminderMinutes} onChange={(value) => update("sessionTimeReminderMinutes", value)} />
          <NumberField label="Stop-loss reminder" value={settings.stopLossLimit} onChange={(value) => update("stopLossLimit", value)} />
          <label className="flex items-center justify-between gap-3 rounded-md bg-white/5 p-3 text-slate-200">
            Reduced animation mode
            <input type="checkbox" checked={settings.reducedMotion} onChange={(event) => update("reducedMotion", event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md bg-white/5 p-3 text-slate-200">
            Sound enabled
            <input type="checkbox" checked={settings.soundEnabled} onChange={(event) => update("soundEnabled", event.target.checked)} />
          </label>
          <button className="secondary-button border-rose-300/30 text-rose-100" onClick={() => {
            clearAllSpinSenseData();
            setSettings(defaultSettings);
          }}>
            Reset all local data
          </button>
        </div>
      </main>
    </AppShell>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input className="control" min={0} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
