"use client";

import { AppShell } from "@/components/layout/AppShell";
import { BalanceChart, ExpectedVsActualChart, WageredChart } from "@/components/dashboard/DashboardCharts";
import { calculateHouseEdge } from "@/lib/slot/rtp";
import { formatMoney } from "@/lib/utils/currency";
import { useActiveSession } from "@/hooks/useActiveSession";

export default function DashboardPage() {
  const { session, chartData } = useActiveSession();

  return (
    <AppShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-black text-white">Reality dashboard</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          Short sessions can vary wildly, but repeated play tends to move toward the selected RTP and house edge.
        </p>
        {!session ? (
          <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-6 text-slate-300">
            Start a simulator session to populate the dashboard.
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Spins" value={session.totalSpins} />
              <Metric label="Fake wagered" value={formatMoney(session.totalWagered)} />
              <Metric label="Net result" value={formatMoney(session.netProfitLoss)} />
              <Metric label="Expected loss" value={formatMoney(session.expectedLoss)} />
              <Metric label="Selected RTP" value={`${session.selectedRTP}%`} />
              <Metric label="House edge" value={`${calculateHouseEdge(session.selectedRTP)}%`} />
              <Metric label="Biggest fake win" value={formatMoney(session.biggestWin)} />
              <Metric label="Longest losing streak" value={session.longestLosingStreak} />
              <Metric label="Near misses" value={session.nearMissCount} />
              <Metric label="Loss-chasing warnings" value={session.lossChasingWarnings} />
              <Metric label="Rapid-spin warnings" value={session.rapidSpinWarnings} />
              <Metric label="Actual vs expected" value={formatMoney(session.actualVsExpectedDifference)} />
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <BalanceChart data={chartData} />
              <WageredChart data={chartData} />
              <div className="lg:col-span-2">
                <ExpectedVsActualChart data={chartData} />
              </div>
            </div>
          </>
        )}
      </main>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
