import type { FunnelHealthReport } from '@/lib/audit/funnel-health';

export function FunnelHealthStrip({ health }: { health: FunnelHealthReport }) {
  return (
    <div className="space-y-3 rounded-[14px] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Funnel health</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{health.note}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Overview sessions" value={health.overviewSessions} />
        <Metric label="Channel sum" value={health.channelSessions} />
        <Metric label="Landing sum" value={health.landingSessions} />
      </div>

      <ul className="space-y-2">
        {health.flags.map((flag) => (
          <li
            key={flag.id}
            className={
              flag.severity === 'warn'
                ? 'rounded-lg bg-amber-50/80 px-3 py-2 text-sm text-amber-950'
                : 'rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-700'
            }
          >
            {flag.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2">
      <p className="text-[11px] tracking-wide text-zinc-400 uppercase">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-950">
        {value > 0 ? value.toLocaleString() : '—'}
      </p>
    </div>
  );
}
