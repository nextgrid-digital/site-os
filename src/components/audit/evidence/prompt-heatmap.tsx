'use client';

import type { PromptRunObservation } from '@/lib/evidence/types';
import { EmptyState, SectionTitle, StatusChip } from '@/components/audit/evidence/ui';
import { useMemo, useState } from 'react';

export function PromptHeatmap({
  runs,
  disclaimer,
  onSelect,
}: {
  runs: PromptRunObservation[];
  disclaimer: string;
  onSelect?: (run: PromptRunObservation) => void;
}) {
  const systems = useMemo(
    () => [...new Set(runs.map((r) => r.ai_system))].toSorted(),
    [runs]
  );
  const [active, setActive] = useState<string | 'all'>('all');

  const filtered = active === 'all' ? runs : runs.filter((r) => r.ai_system === active);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of runs) {
      map.set(r.prompt_category, (map.get(r.prompt_category) ?? 0) + 1);
    }
    return [...map.entries()];
  }, [runs]);

  return (
    <div>
      <SectionTitle
        title="Sampled AI visibility"
        lead="Sampled observations across monitored systems — not rankings."
      />
      <p className="mb-4 text-xs leading-5 text-zinc-500">{disclaimer}</p>

      {runs.length === 0 ? (
        <EmptyState
          title="No AI prompt runs available"
          description="No sampled AI prompt runs were executed in this audit scope. Platform tabs and heatmaps appear when prompt observations are collected."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActive('all')}
              className={
                active === 'all'
                  ? 'rounded-lg bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white'
                  : 'rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-zinc-600'
              }
            >
              All systems
            </button>
            {systems.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setActive(s)}
                className={
                  active === s
                    ? 'rounded-lg bg-zinc-950 px-2.5 py-1 text-xs font-medium text-white'
                    : 'rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-zinc-600'
                }
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map(([cat, n]) => (
              <div key={cat} className="rounded-xl bg-white px-3 py-3 shadow-sm">
                <p className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                  {cat.replace(/_/g, '')}
                </p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-zinc-950">{n}</p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Prompt</th>
                  <th className="px-3 py-2 font-medium">System</th>
                  <th className="px-3 py-2 font-medium">Brand</th>
                  <th className="px-3 py-2 font-medium">Competitors</th>
                  <th className="px-3 py-2 font-medium">Cited site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((r, i) => (
                  <tr key={`${r.prompt.slice(0, 24)}-${i}`} className="hover:bg-zinc-50/80">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onSelect?.(r)}
                        className="max-w-xs truncate text-left font-medium text-zinc-900 underline-offset-2 hover:underline"
                        title={r.prompt}
                      >
                        {r.prompt}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-zinc-600">{r.ai_system}</td>
                    <td className="px-3 py-2">
                      <StatusChip tone={r.brand_mentioned ? 'strong' : 'empty'}>
                        {r.brand_mentioned ? 'mentioned' : 'not mentioned'}
                      </StatusChip>
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-600">
                      {r.competitors_mentioned.length
                        ? r.competitors_mentioned.join(',')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <StatusChip tone={r.company_website_cited ? 'strong' : 'empty'}>
                        {r.company_website_cited ? 'cited' : 'not cited'}
                      </StatusChip>
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
