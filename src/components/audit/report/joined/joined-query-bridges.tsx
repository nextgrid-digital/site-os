import { AnalyticsRowIcon } from '@/components/audit/report/analytics/analytics-row-icon';
import type { JoinedProblemTag, JoinedQueryBridge } from '@/lib/audit/joined-traffic-story';

function pct(rate: number) {
  if (!rate) return '—';
  const value = rate <= 1 ? rate * 100 : rate;
  return `${value.toFixed(1)}%`;
}

function tagClass(tag: JoinedProblemTag) {
  switch (tag) {
    case 'keep':
      return 'bg-emerald-50 text-emerald-800';
    case 'ok':
      return 'bg-zinc-100 text-zinc-600';
    case 'deprioritize':
      return 'bg-zinc-100 text-zinc-500';
    case 'discoverability':
      return 'bg-sky-50 text-sky-800';
    case 'visibility':
    case 'click':
    case 'landing':
    case 'engagement':
    case 'conversion':
      return 'bg-amber-50 text-amber-900';
    default: {
      const _exhaustive: never = tag;
      return _exhaustive;
    }
  }
}

export function JoinedQueryBridges({ rows }: { rows: JoinedQueryBridge[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[14px] bg-surface-5 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          No Search Console queries stored for this audit yet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[14px] bg-surface-3">
      <table className="w-full min-w-[64rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-surface-6 text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Query</th>
            <th className="px-4 py-3 font-medium">Lands on</th>
            <th className="px-4 py-3 text-right font-medium">Impr.</th>
            <th className="px-4 py-3 text-right font-medium">Clicks</th>
            <th className="px-4 py-3 text-right font-medium">CTR</th>
            <th className="px-4 py-3 text-right font-medium">Pos.</th>
            <th className="px-4 py-3 text-right font-medium">Sessions</th>
            <th className="px-4 py-3 text-right font-medium">Conv.</th>
            <th className="px-4 py-3 font-medium">Tag</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={`${row.query}-${row.pagePath ?? 'none'}`}
              className="border-b border-surface-6 last:border-b-0"
            >
              <td className="max-w-[14rem] truncate px-4 py-2.5 font-medium">
                <span className="inline-flex max-w-full items-center gap-2">
                  <AnalyticsRowIcon kind="search" label={row.query} className="shrink-0" />
                  <span className="truncate">{row.query}</span>
                </span>
              </td>
              <td className="max-w-[12rem] truncate px-4 py-2.5 font-mono text-xs">
                {row.pagePath ? (
                  <span className="inline-flex max-w-full items-center gap-2">
                    <AnalyticsRowIcon kind="page" label={row.pagePath} className="shrink-0" />
                    <span className="truncate">{row.pagePath}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {row.impressions.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {row.clicks.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">{pct(row.ctr)}</td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {row.position > 0 ? row.position.toFixed(1) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {row.sessions != null ? row.sessions.toLocaleString() : '—'}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {row.conversions != null ? row.conversions.toLocaleString() : '—'}
              </td>
              <td className="px-4 py-2.5">
                <span
                  className={`inline-flex max-w-[12rem] truncate rounded-md px-2 py-0.5 text-xs font-medium ${tagClass(row.problemTag)}`}
                  title={row.note}
                >
                  {row.note}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
