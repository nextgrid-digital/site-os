import type { AnalyticsTableRow } from '@/lib/audit/connected-analytics';
import { AnalyticsRowIcon } from '@/components/audit/report/analytics/analytics-row-icon';

function TableCard({
  title,
  rows,
  secondaryLabel = 'Conv.',
}: {
  title: string;
  rows: AnalyticsTableRow[];
  secondaryLabel?: string;
}) {
  return (
    <div className="rounded-[14px] bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-950">{title}</p>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">No data for this dimension yet.</p>
      ) : (
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-zinc-400">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 text-right font-medium">Views</th>
              <th className="pb-2 text-right font-medium">Share</th>
              {rows.some((r) => r.secondary) ? (
                <th className="pb-2 text-right font-medium">{secondaryLabel}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-zinc-100">
                <td className="max-w-[12rem] py-2 pr-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <AnalyticsRowIcon kind={row.kind} label={row.label} />
                    <span className="truncate font-medium text-zinc-900">{row.label}</span>
                  </span>
                </td>
                <td className="py-2 text-right tabular-nums text-zinc-700">{row.views}</td>
                <td className="py-2 text-right tabular-nums text-zinc-500">{row.share}</td>
                {rows.some((r) => r.secondary) ? (
                  <td className="py-2 text-right tabular-nums text-zinc-700">
                    {row.secondary ?? '—'}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function AnalyticsDetailTables({
  sources,
  countries,
  devices,
  browsers,
  pages,
  events,
}: {
  sources: AnalyticsTableRow[];
  countries: AnalyticsTableRow[];
  devices: AnalyticsTableRow[];
  browsers: AnalyticsTableRow[];
  pages: AnalyticsTableRow[];
  events: AnalyticsTableRow[];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <TableCard title="Top sources" rows={sources} />
      <TableCard title="Top countries" rows={countries} />
      <TableCard title="Devices" rows={devices} />
      <TableCard title="Browsers" rows={browsers} />
      <TableCard title="Top pages" rows={pages} />
      <TableCard title="Top events (by count)" rows={events} secondaryLabel="Conv." />
    </div>
  );
}
