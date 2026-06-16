import { AppShell } from "@/components/layout/AppShell";

const resources = [
  ["National Gambling Helpline", "0808 8020 133"],
  ["GamCare", "Support, live chat, and advice for people affected by gambling harm."],
  ["GAMSTOP", "Free UK self-exclusion from participating online gambling companies."],
  ["NHS gambling support", "NHS clinics and guidance for gambling-related harm."],
  ["Bank gambling blocks", "Many UK banks let you block gambling merchant transactions."],
];

export default function SupportPage() {
  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="rounded-lg border border-rose-300/30 bg-rose-300/10 p-6">
          <h1 className="text-3xl font-black text-white">Responsible support</h1>
          <p className="mt-4 text-lg leading-8 text-rose-50">
            Real gambling can cause financial, emotional, and relationship harm. If you feel unable to stop,
            seek help now and talk to someone you trust.
          </p>
        </section>
        <div className="mt-6 grid gap-4">
          {resources.map(([title, body]) => (
            <article key={title} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-bold text-white">{title}</h2>
              <p className="mt-2 leading-7 text-slate-300">{body}</p>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
