import type { FunnelHealthReport } from '@/lib/audit/funnel-health';

export function FunnelHealthStrip({ health }: { health: FunnelHealthReport }) {
  return (
    <div className="space-y-3 rounded-xl bg-raised p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Funnel health</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{health.note}</p>
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
                ? 'rounded-lg bg-warning-soft/80 px-3 py-2 text-sm text-warning-ink'
                : 'rounded-lg bg-muted px-3 py-2 text-sm text-foreground/80'
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
    <div className="rounded-lg bg-muted px-3 py-2">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
        {value > 0 ? value.toLocaleString() : '—'}
      </p>
    </div>
  );
}
