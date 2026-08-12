'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BrandAssociation } from '@/lib/evidence/types';
import { EmptyState, SectionTitle, StatusChip } from '@/components/audit/evidence/ui';

function intensityClass(count: number) {
  if (count <= 0) return 'bg-zinc-50 text-zinc-400';
  if (count === 1) return 'bg-emerald-50 text-emerald-800';
  if (count === 2) return 'bg-emerald-100 text-emerald-900';
  return 'bg-emerald-200 text-emerald-950';
}

export function AssociationMatrix({
  associations,
  onSelect,
}: {
  associations: BrandAssociation[];
  onSelect: (a: BrandAssociation) => void;
}) {
  if (associations.length === 0) {
    return (
      <EmptyState
        title="No brand associations identified"
        description="No topic associations were extracted from the selected audit scope."
      />
    );
  }

  return (
    <div>
      <SectionTitle
        title="Brand association matrix"
        lead="Topic × source type counts from this audit."
      />
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
            <tr>
              <th className="px-3 py-2.5 font-medium">Topic</th>
              <th className="px-3 py-2.5 font-medium">Website</th>
              <th className="px-3 py-2.5 font-medium">Third-party</th>
              <th className="px-3 py-2.5 font-medium">AI sample</th>
              <th className="px-3 py-2.5 font-medium">Classification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {associations.map((a) => (
              <tr key={a.topic} className="hover:bg-zinc-50/80">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onSelect(a)}
                    className="text-left font-medium text-zinc-900 underline-offset-2 hover:underline"
                  >
                    {a.topic}
                  </button>
                </td>
                {[a.first_party_count, a.third_party_count, a.ai_appearance_count].map((count, i) => (
                  <td key={i} className="px-3 py-2">
                    <span
                      className={`inline-flex min-w-[2rem] items-center justify-center rounded-md px-2 py-1 text-xs font-semibold tabular-nums ${intensityClass(count)}`}
                    >
                      {count}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-2">
                  <StatusChip
                    tone={
                      a.classification.includes('conflict')
                        ? 'conflict'
                        : a.classification.includes('weak') || a.classification === 'not_identified'
                          ? 'weak'
                          : a.classification.includes('independently') ||
                              a.classification.includes('consistently')
                            ? 'strong'
                            : 'neutral'
                    }
                  >
                    {a.classification.replace(/_/g, '')}
                  </StatusChip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AssociationBarChart({ associations }: { associations: BrandAssociation[] }) {
  if (associations.length === 0) return null;
  const data = associations.slice(0, 8).map((a) => ({
    topic: a.topic.length > 18 ? `${a.topic.slice(0, 18)}…` : a.topic,
    first: a.first_party_count,
    third: a.third_party_count,
    ai: a.ai_appearance_count,
  }));

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-950">Association source counts</p>
      <p className="mt-0.5 text-xs text-zinc-500">First-party, third-party, and AI sample appearances</p>
      <div className="mt-3 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
            <XAxis
              dataKey="topic"
              tick={{ fontSize: 10, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }}
            />
            <Bar dataKey="first" name="First-party" stackId="a" fill="#18181b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="third" name="Third-party" stackId="a" fill="#a1a1aa" />
            <Bar dataKey="ai" name="AI sample" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function EvidenceBalanceBar({
  firstParty,
  thirdParty,
  customer,
  conflicting,
}: {
  firstParty: number;
  thirdParty: number;
  customer: number;
  conflicting: number;
}) {
  const total = firstParty + thirdParty + customer + conflicting;
  if (total === 0) {
    return (
      <EmptyState
        title="No evidence items to balance"
        description="Evidence inventory is empty for this audit scope."
      />
    );
  }
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`;
  const segments = [
    { label: 'First-party', n: firstParty, color: 'bg-zinc-950' },
    { label: 'Third-party', n: thirdParty, color: 'bg-zinc-400' },
    { label: 'Customer', n: customer, color: 'bg-emerald-500' },
    { label: 'Conflicting', n: conflicting, color: 'bg-red-400' },
  ].filter((s) => s.n > 0);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-950">Evidence balance</p>
      <p className="mt-0.5 text-xs text-zinc-500">Share of evidence items by independence</p>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-zinc-100">
        {segments.map((s) => (
          <div key={s.label} className={s.color} style={{ width: pct(s.n) }} title={`${s.label}: ${s.n}`} />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-600">
        {segments.map((s) => (
          <li key={s.label} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            {s.label} · {s.n} ({pct(s.n)})
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SourceDistributionChart({
  rows,
}: {
  rows: Array<{ source_group: string; source_count: number }>;
}) {
  const data = rows.filter((r) => r.source_count > 0);
  if (data.length === 0) {
    return (
      <EmptyState
        title="No source distribution"
        description="No source groups with counts were identified."
      />
    );
  }
  const colors = ['#18181b', '#71717a', '#10b981', '#a1a1aa'];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-zinc-950">Source distribution</p>
      <div className="mt-3 h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="source_group"
              width={110}
              tick={{ fontSize: 11, fill: '#52525b' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }} />
            <Bar dataKey="source_count" name="Count" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
