import type { AnalyticsBarRow, AnalyticsRowKind } from '@/lib/audit/connected-analytics';
import { AnalyticsRowIcon } from '@/components/audit/report/analytics/analytics-row-icon';

function BarList({
  rows,
  emptyLabel,
  kind,
}: {
  rows: AnalyticsBarRow[];
  emptyLabel: string;
  kind: AnalyticsRowKind;
}) {
  if (rows.length === 0) {
    return <p className="py-6 text-sm text-zinc-500">{emptyLabel}</p>;
  }
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="mt-3 space-y-2.5">
      {rows.map((row) => (
        <li key={row.label} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5">
          <AnalyticsRowIcon kind={row.kind ?? kind} label={row.label} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900">{row.label}</p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-zinc-900/80"
                style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-sm tabular-nums text-zinc-600">{row.display}</span>
        </li>
      ))}
    </ul>
  );
}

type Card = {
  title: string;
  rows: AnalyticsBarRow[];
  empty: string;
  kind: AnalyticsRowKind;
};

export function AnalyticsDimensionGrid({ cards }: { cards: Card[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-[14px] bg-white p-4 shadow-sm"
        >
          <p className="text-sm font-semibold text-zinc-950">{card.title}</p>
          <BarList rows={card.rows} emptyLabel={card.empty} kind={card.kind} />
        </div>
      ))}
    </div>
  );
}
