"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = {
  spin: number;
  balance: number;
  wagered: number;
  expectedLoss: number;
  actualLoss: number;
};

export function BalanceChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame title="Fake balance over time">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="spin" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155" }} />
        <Area type="monotone" dataKey="balance" stroke="#34d399" fill="#34d39933" />
      </AreaChart>
    </ChartFrame>
  );
}

export function WageredChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame title="Cumulative fake wagered">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="spin" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155" }} />
        <Area type="monotone" dataKey="wagered" stroke="#38bdf8" fill="#38bdf833" />
      </AreaChart>
    </ChartFrame>
  );
}

export function ExpectedVsActualChart({ data }: { data: ChartPoint[] }) {
  return (
    <ChartFrame title="Expected loss vs actual loss">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="spin" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip contentStyle={{ background: "#020617", border: "1px solid #334155" }} />
        <Line type="monotone" dataKey="expectedLoss" stroke="#f59e0b" dot={false} />
        <Line type="monotone" dataKey="actualLoss" stroke="#f43f5e" dot={false} />
      </LineChart>
    </ChartFrame>
  );
}

function ChartFrame({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
      <h2 className="mb-4 font-semibold text-white">{title}</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
