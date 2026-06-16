import type { SessionWarning } from "@/types/warning";

export function WarningPanel({ warnings }: { warnings: SessionWarning[] }) {
  if (warnings.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
        Risk-pattern messages will appear here when the simulator detects near-misses, rapid spins, or loss chasing.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {warnings.map((warning) => (
        <article key={`${warning.timestamp}-${warning.type}`} className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-4">
          <h3 className="font-semibold text-amber-100">{warning.title}</h3>
          <p className="mt-1 text-sm leading-6 text-amber-50/85">{warning.message}</p>
        </article>
      ))}
    </div>
  );
}
