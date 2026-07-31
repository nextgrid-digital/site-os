'use client';

import type { CompetitorObservation } from '@/lib/evidence/types';
import { EmptyState, MetricCard, SectionTitle } from '@/components/audit/evidence/ui';

export function CompetitorSection({
  competitors,
  brandName,
  brandPromptAppearances,
}: {
  competitors: CompetitorObservation[];
  brandName: string;
  brandPromptAppearances: number;
}) {
  return (
    <div>
      <SectionTitle
        title="Competitor presence"
        lead="Evidence differences in the selected prompt sample only."
      />
      {competitors.length === 0 ? (
        <EmptyState
          title="No competitor appearances identified"
          description="No competitor observations were recorded in the selected prompt sample."
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={brandName} value={brandPromptAppearances} caption="Prompt appearances" />
            {competitors.slice(0, 3).map((c) => (
              <MetricCard
                key={c.competitor_name}
                label={c.competitor_name}
                value={c.prompt_appearances}
                caption={
                  c.associated_categories[0]
                    ? `Assoc. ${c.associated_categories[0]}`
                    : `${c.cited_sources.length} cited sources`
                }
              />
            ))}
          </div>
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Entity</th>
                  <th className="px-3 py-2 font-medium">Prompt appearances</th>
                  <th className="px-3 py-2 font-medium">Cited sources</th>
                  <th className="px-3 py-2 font-medium">Categories</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="px-3 py-2 font-medium text-zinc-950">{brandName}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-700">{brandPromptAppearances}</td>
                  <td className="px-3 py-2 text-zinc-500">—</td>
                  <td className="px-3 py-2 text-zinc-500">—</td>
                </tr>
                {competitors.map((c) => (
                  <tr key={c.competitor_name}>
                    <td className="px-3 py-2 font-medium text-zinc-950">{c.competitor_name}</td>
                    <td className="px-3 py-2 tabular-nums text-zinc-700">{c.prompt_appearances}</td>
                    <td className="px-3 py-2 tabular-nums text-zinc-700">{c.cited_sources.length}</td>
                    <td className="px-3 py-2 text-xs text-zinc-600">
                      {c.associated_categories.join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
