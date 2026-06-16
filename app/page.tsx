import Link from 'next/link'
import {
    BookOpen,
    LifeBuoy,
    Play,
    ShieldAlert,
    Zap,
    TrendingDown,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { SymbolIcon } from '@/components/slot/SymbolIcon'
import type { SymbolId } from '@/types/slot'

const heroSymbols: SymbolId[] = [
    'crown',
    'shield',
    'sword',
    'castle',
    'coin-chest',
    'fisherman',
    'treasure-chest',
    'boat',
    'lighthouse',
    'wave',
    'map',
    'scroll',
    'anchor',
    'fish',
    'rod',
]

export default function Home() {
    return (
        <AppShell>
            <main className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
                <section>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                        Responsible awareness simulator
                    </p>
                    <h1 className="mt-4 max-w-3xl text-6xl font-black tracking-tight text-white sm:text-8xl">
                        SpinSense
                    </h1>
                    <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-300">
                        Explore fake-money slot outcomes while the app exposes
                        RTP, house edge, volatility, near-misses, loss chasing,
                        and expected mathematical loss.
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
                        {heroSymbols.map((symbolId, index) => (
                            <div
                                key={`${symbolId}-${index}`}
                                className="grid aspect-square place-items-center rounded-md border border-white/10 bg-black/25 text-xl font-black text-emerald-200"
                            >
                                <SymbolIcon
                                    symbolId={symbolId}
                                    className="size-8 text-emerald-100 sm:size-10"
                                />
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 grid gap-3 text-xs font-medium text-slate-200 sm:grid-cols-3">
                        <div className="flex flex-col rounded-md bg-black/40 p-3 border border-emerald-500/20">
                            <Zap className="mb-2 size-4 text-emerald-400" />
                            <span>RTP transparency vs. Actual Volatility</span>
                        </div>
                        <div className="flex flex-col rounded-md bg-black/40 p-3 border border-amber-500/20">
                            <ShieldAlert className="mb-2 size-4 text-amber-400" />
                            <span>Near-miss psychological breakdown</span>
                        </div>
                        <div className="flex flex-col rounded-md bg-black/40 p-3 border border-red-500/20">
                            <TrendingDown className="mb-2 size-4 text-red-400" />
                            <span>
                                Instant &quot;Time-to-Ruin&quot; simulations
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </AppShell>
    )
}
