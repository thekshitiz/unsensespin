import Link from "next/link";
import { ArrowRight, BookOpen, LifeBuoy, Play } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { SymbolIcon } from "@/components/slot/SymbolIcon";
import type { SymbolId } from "@/types/slot";

const heroSymbols: SymbolId[] = [
  "crown",
  "shield",
  "sword",
  "castle",
  "coin-chest",
  "fisherman",
  "treasure-chest",
  "boat",
  "lighthouse",
  "wave",
  "map",
  "scroll",
  "anchor",
  "fish",
  "rod",
];

export default function Home() {
  return (
    <AppShell>
      <main className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Responsible awareness simulator
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-white sm:text-7xl">
            SpinSense
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Explore fake-money slot outcomes while the app exposes RTP, house edge, volatility, near-misses,
            loss chasing, and expected mathematical loss.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 py-3 font-semibold text-slate-950 hover:bg-emerald-300"
              href="/simulator"
            >
              <Play className="size-5" /> Start Simulator
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10"
              href="/learn"
            >
              <BookOpen className="size-5" /> Learn the Maths
            </Link>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-3 font-semibold text-white hover:bg-white/10"
              href="/support"
            >
              <LifeBuoy className="size-5" /> Support
            </Link>
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-gradient-to-br from-slate-900 via-cyan-950 to-amber-950 p-5 shadow-2xl">
          <div className="grid grid-cols-5 gap-2">
            {heroSymbols.map(
              (symbolId, index) => (
                <div
                  key={`${symbolId}-${index}`}
                  className="grid aspect-square place-items-center rounded-md border border-white/10 bg-black/25 text-xl font-black text-emerald-200"
                >
                  <SymbolIcon symbolId={symbolId} className="size-8 text-emerald-100 sm:size-10" />
                </div>
              ),
            )}
          </div>
          <div className="mt-5 grid gap-3 text-sm text-slate-200 sm:grid-cols-3">
            {["RTP is selected before play", "Every spin is independent", "No real-money features"].map((item) => (
              <div key={item} className="rounded-md bg-white/10 p-3">
                {item} <ArrowRight className="mt-2 size-4 text-emerald-300" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </AppShell>
  );
}
