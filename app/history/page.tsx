"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { loadSessionHistory } from "@/lib/storage/localStorage";
import { themes } from "@/lib/constants/themes";
import { formatMoney } from "@/lib/utils/currency";
import type { SlotSession } from "@/types/session";

export default function HistoryPage() {
  const [history] = useState<SlotSession[]>(() => loadSessionHistory());

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-black text-white">Session history</h1>
        <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
          <div className="grid min-w-[820px] grid-cols-8 bg-white/[0.06] p-3 text-sm font-semibold text-slate-300">
            <span>Date</span>
            <span>Theme</span>
            <span>Spins</span>
            <span>RTP</span>
            <span>Volatility</span>
            <span>Wagered</span>
            <span>Net</span>
            <span>Risk flags</span>
          </div>
          <div className="overflow-x-auto">
            {history.length === 0 ? (
              <p className="p-5 text-slate-300">Saved sessions will appear here after you press Save in the simulator.</p>
            ) : (
              history.map((session) => (
                <div key={session.id} className="grid min-w-[820px] grid-cols-8 border-t border-white/10 p-3 text-sm text-slate-300">
                  <span>{new Date(session.createdAt).toLocaleString("en-GB")}</span>
                  <span>{themes[session.theme].name}</span>
                  <span>{session.totalSpins}</span>
                  <span>{session.selectedRTP}%</span>
                  <span>{session.selectedVolatility}</span>
                  <span>{formatMoney(session.totalWagered)}</span>
                  <span>{formatMoney(session.netProfitLoss)}</span>
                  <span>{session.lossChasingWarnings + session.rapidSpinWarnings + Number(session.stopLossTriggered) + Number(session.timeLimitTriggered)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
