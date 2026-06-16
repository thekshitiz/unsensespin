import { AppShell } from "@/components/layout/AppShell";

const sections = [
  {
    title: "What is RTP?",
    body: "Return to Player is the long-run percentage of fake wagered value returned by the simulator. A 94% RTP means the expected loss is 6% of total fake wagered over many spins.",
  },
  {
    title: "What is house edge?",
    body: "House edge is 100% minus RTP. It is the mathematical disadvantage built into repeated play.",
  },
  {
    title: "What is volatility?",
    body: "Volatility changes the shape of results. Low volatility gives more frequent small wins. High volatility gives longer losing periods and rare larger fake wins.",
  },
  {
    title: "Variable rewards",
    body: "Random rewards can feel powerful because the next outcome is uncertain. That uncertainty can make people continue even when the expected result is negative.",
  },
  {
    title: "Near-misses",
    body: "A near miss can feel meaningful, but mathematically it is still a loss. The simulator flags near-misses so they are explained instead of used as encouragement.",
  },
  {
    title: "Chasing losses",
    body: "Increasing stakes after losses can accelerate harm. SpinSense warns when bet increases follow losing streaks.",
  },
  {
    title: "Fake money still affects behaviour",
    body: "Even without real money, repeated wins, losses, speed, and streaks can influence attention and emotion.",
  },
  {
    title: "Past spins do not change future spins",
    body: "A losing streak does not make a win due. Each spin is independent in this educational simulator.",
  },
];

export default function LearnPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-black text-white">Learn the maths and psychology</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="text-xl font-bold text-white">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
