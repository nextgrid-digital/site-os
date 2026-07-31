'use client';

import { useMemo, useState } from 'react';
import type {
  BrandAssociation,
  BrandClaim,
  BrandEvidenceReportView,
  BuyerQuestionCoverage,
  CompanyDescription,
} from '@/lib/evidence/types';
import {
  EmptyState,
  MetricCard,
  SectionTitle,
  StatusChip,
} from '@/components/audit/evidence/ui';

const COVERAGE_TONES: Record<
  string,
  'strong' | 'weak' | 'conflict' | 'empty' | 'neutral'
> = {
  clearly_covered: 'strong',
  partially_covered: 'weak',
  indirectly_covered: 'neutral',
  conflicting_information: 'conflict',
  not_identified: 'empty',
};

export function EvidenceExplorer({
  view,
  search,
  onSearchChange,
  onClaim,
  onDescription,
  onAssociation,
}: {
  view: BrandEvidenceReportView;
  search: string;
  onSearchChange: (q: string) => void;
  onClaim: (c: BrandClaim) => void;
  onDescription: (d: CompanyDescription) => void;
  onAssociation: (a: BrandAssociation) => void;
}) {
  const [coverageGroup, setCoverageGroup] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [contentFilter, setContentFilter] = useState<string>('all');

  const q = search.trim().toLowerCase();

  const claims = useMemo(() => {
    return view.claims.filter((c) => {
      if (!q) return true;
      return (
        c.claim_text.toLowerCase().includes(q) ||
        (c.claiming_excerpt ?? '').toLowerCase().includes(q)
      );
    });
  }, [view.claims, q]);

  const descriptions = useMemo(() => {
    return view.descriptions.filter((d) => {
      if (sourceFilter !== 'all' && d.source_type !== sourceFilter) return false;
      if (!q) return true;
      return (
        d.description_text.toLowerCase().includes(q) ||
        d.category_terms.some((t) => t.includes(q))
      );
    });
  }, [view.descriptions, q, sourceFilter]);

  const buyer = useMemo(() => {
    return view.buyer_coverage.filter((b) => {
      if (coverageGroup !== 'all' && b.question_group !== coverageGroup) return false;
      if (!q) return true;
      return b.question.toLowerCase().includes(q) || (b.evidence_excerpt ?? '').toLowerCase().includes(q);
    });
  }, [view.buyer_coverage, coverageGroup, q]);

  const content = useMemo(() => {
    return view.content_coverage.filter((c) => {
      if (contentFilter === 'identified' && c.page_count === 0) return false;
      if (contentFilter === 'missing' && c.page_count > 0) return false;
      if (!q) return true;
      return c.content_type.includes(q) || c.urls.some((u) => u.toLowerCase().includes(q));
    });
  }, [view.content_coverage, contentFilter, q]);

  const groups = useMemo(
    () => [...new Set(view.buyer_coverage.map((b) => b.question_group))],
    [view.buyer_coverage]
  );

  const claimStats = useMemo(() => {
    const total = view.claims.length;
    const firstOnly = view.claims.filter((c) => c.verification_status === 'first_party_claim_only')
      .length;
    const corroborated = view.claims.filter((c) =>
      c.verification_status.includes('corroborat')
    ).length;
    const conflicting = view.claims.filter((c) => c.contradiction_count > 0).length;
    const unable = view.claims.filter((c) => c.verification_status.includes('unable')).length;
    return { total, firstOnly, corroborated, conflicting, unable };
  }, [view.claims]);

  const coverageCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of view.buyer_coverage) {
      map.set(b.coverage_status, (map.get(b.coverage_status) ?? 0) + 1);
    }
    return map;
  }, [view.buyer_coverage]);

  const sourceTypes = useMemo(
    () => [...new Set(view.descriptions.map((d) => d.source_type))],
    [view.descriptions]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search claims, topics, pages, descriptions…"
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none ring-zinc-300 placeholder:text-zinc-400 focus:bg-white focus:ring-2"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-700"
          >
            <option value="all">All description sources</option>
            {sourceTypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={contentFilter}
            onChange={(e) => setContentFilter(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-xs text-zinc-700"
          >
            <option value="all">All content types</option>
            <option value="identified">Identified only</option>
            <option value="missing">Not identified</option>
          </select>
        </div>
      </div>

      <nav className="hidden gap-2 overflow-x-auto lg:flex">
        {[
          'Identity',
          'Claims',
          'Descriptions',
          'Buyer coverage',
          'Evidence inventory',
          'Content',
          'Sources',
          'Technical',
          'History',
          'Methodology',
        ].map((label) => (
          <a
            key={label}
            href={`#explorer-${label.toLowerCase().replace(/\s+/g, '-')}`}
            className="shrink-0 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:text-zinc-950"
          >
            {label}
          </a>
        ))}
      </nav>

      <section id="explorer-identity" className="scroll-mt-28">
        <SectionTitle title="Company identity" lead="Identity fields extracted from observed sources." />
        {view.identity.length === 0 ? (
          <EmptyState title="No identity fields were identified during this audit." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Field</th>
                  <th className="px-3 py-2 font-medium">Value</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {view.identity.map((field) => (
                  <tr key={field.field_key}>
                    <td className="px-3 py-2 capitalize text-zinc-900">
                      {field.field_key.replace(/_/g, ' ')}
                    </td>
                    <td className="px-3 py-2 text-zinc-700">
                      {field.field_value ?? 'Not identified'}
                      {field.conflict_note ? (
                        <p className="mt-1 text-xs text-amber-700">{field.conflict_note}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-500">{field.source_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="explorer-claims" className="scroll-mt-28">
        <SectionTitle title="Claim and evidence" lead="Compact claim records from this audit." />
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <MetricCard label="Total claims" value={claimStats.total} />
          <MetricCard label="First-party only" value={claimStats.firstOnly} />
          <MetricCard label="Corroborated" value={claimStats.corroborated} />
          <MetricCard label="With contradictions" value={claimStats.conflicting} />
          <MetricCard label="Unable to verify" value={claimStats.unable} />
        </div>
        {claims.length === 0 ? (
          <EmptyState title="No claims match the current filters." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Claim</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">Corroboration</th>
                  <th className="px-3 py-2 font-medium">Contradictions</th>
                  <th className="px-3 py-2 font-medium">Observed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {claims.slice(0, 40).map((c, i) => (
                  <tr key={`${c.claim_text.slice(0, 20)}-${i}`} className="hover:bg-zinc-50/80">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => onClaim(c)}
                        className="max-w-md text-left font-medium text-zinc-900 underline-offset-2 hover:underline"
                      >
                        {c.claim_text}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <StatusChip>{c.verification_status.replace(/_/g, ' ')}</StatusChip>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-zinc-600">{c.corroboration_count}</td>
                    <td className="px-3 py-2 tabular-nums text-zinc-600">{c.contradiction_count}</td>
                    <td className="px-3 py-2 text-xs text-zinc-500">{c.observed_at.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section id="explorer-descriptions" className="scroll-mt-28">
        <SectionTitle title="Company description comparison" lead="Side-by-side observed descriptions." />
        {descriptions.length === 0 ? (
          <EmptyState title="No descriptions match the current filters." />
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {descriptions.map((d, i) => (
              <button
                key={`${d.source_type}-${i}`}
                type="button"
                onClick={() => onDescription(d)}
                className="w-72 shrink-0 rounded-2xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition hover:border-zinc-300"
              >
                <StatusChip>{d.source_type.replace(/_/g, ' ')}</StatusChip>
                <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-800">{d.description_text}</p>
                {d.category_terms.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {d.category_terms.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </section>

      <section id="explorer-buyer-coverage" className="scroll-mt-28">
        <SectionTitle title="Buyer information coverage" lead="Public coverage of buyer questions." />
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCoverageGroup('all')}
            className={
              coverageGroup === 'all'
                ? 'rounded-lg bg-zinc-950 px-2.5 py-1 text-xs text-white'
                : 'rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600'
            }
          >
            All
          </button>
          {groups.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setCoverageGroup(g)}
              className={
                coverageGroup === g
                  ? 'rounded-lg bg-zinc-950 px-2.5 py-1 text-xs text-white'
                  : 'rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600'
              }
            >
              {g.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {[...coverageCounts.entries()].map(([status, n]) => (
            <StatusChip key={status} tone={COVERAGE_TONES[status] ?? 'neutral'}>
              {status.replace(/_/g, ' ')} · {n}
            </StatusChip>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Question</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Sources</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {buyer.map((b: BuyerQuestionCoverage) => (
                <tr key={b.question}>
                  <td className="px-3 py-2 text-zinc-900">
                    <p>{b.question}</p>
                    {b.evidence_excerpt ? (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{b.evidence_excerpt}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">
                    <StatusChip tone={COVERAGE_TONES[b.coverage_status] ?? 'neutral'}>
                      {b.coverage_status.replace(/_/g, ' ')}
                    </StatusChip>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-zinc-600">{b.source_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="explorer-evidence-inventory" className="scroll-mt-28">
        <SectionTitle title="Public evidence inventory" lead="Counts by independence class." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ['First-party', view.evidence_inventory.first_party],
              ['Third-party', view.evidence_inventory.third_party],
              ['Customer', view.evidence_inventory.customer],
              ['Owned media', view.evidence_inventory.owned_media],
            ] as const
          ).map(([label, items]) => (
            <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">{label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-zinc-950">{items.length}</p>
              <ul className="mt-3 space-y-1">
                {items.slice(0, 3).map((e, i) => (
                  <li key={i} className="truncate text-xs text-zinc-600">
                    {e.object.slice(0, 80)}
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="text-xs text-zinc-400">None identified</li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="explorer-content" className="scroll-mt-28">
        <SectionTitle title="Public content coverage" lead="Content types identified in the crawl." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {content.map((c) => (
            <div
              key={c.content_type}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium capitalize text-zinc-900">
                  {c.content_type.replace(/_/g, ' ')}
                </p>
                <span
                  className={`h-2 w-2 rounded-full ${
                    c.page_count > 0 ? 'bg-emerald-500' : 'bg-zinc-300'
                  }`}
                />
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums text-zinc-950">{c.page_count}</p>
              <p className="mt-1 text-[11px] text-zinc-500">
                {c.evidence_strength === 'not_identified'
                  ? 'Not identified during this audit.'
                  : c.evidence_strength.replace(/_/g, ' ')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="explorer-sources" className="scroll-mt-28">
        <SectionTitle title="Source distribution" lead="Where information was observed." />
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Source group</th>
                <th className="px-3 py-2 font-medium">Count</th>
                <th className="px-3 py-2 font-medium">Independence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {view.source_distribution.map((s) => (
                <tr key={s.source_group}>
                  <td className="px-3 py-2 text-zinc-900">{s.source_group}</td>
                  <td className="px-3 py-2 tabular-nums text-zinc-700">{s.source_count}</td>
                  <td className="px-3 py-2 text-zinc-600">{s.independence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {view.associations.length > 0 ? (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              Topics (open association)
            </p>
            <div className="flex flex-wrap gap-2">
              {view.associations.slice(0, 12).map((a) => (
                <button
                  key={a.topic}
                  type="button"
                  onClick={() => onAssociation(a)}
                  className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 hover:border-zinc-400"
                >
                  {a.topic}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section id="explorer-technical" className="scroll-mt-28">
        <SectionTitle title="Technical accessibility" lead="Factual crawl and page signals." />
        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Observation</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {view.technical.map((t) => (
                <tr key={t.observation_key}>
                  <td className="px-3 py-2 font-medium text-zinc-900">{t.observation_key}</td>
                  <td className="px-3 py-2">
                    <StatusChip
                      tone={
                        t.status === 'detected' || t.status === 'allowed'
                          ? 'strong'
                          : t.status === 'not_detected' || t.status === 'disallowed'
                            ? 'empty'
                            : t.status === 'inconsistent'
                              ? 'conflict'
                              : 'neutral'
                      }
                    >
                      {t.status.replace(/_/g, ' ')}
                    </StatusChip>
                  </td>
                  <td className="px-3 py-2 text-xs text-zinc-600">{t.detail ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="explorer-history" className="scroll-mt-28">
        <SectionTitle title="Historical changes" lead="Event timeline vs prior record." />
        {view.historical_changes.length === 0 ? (
          <EmptyState title="No previous audit is available for historical comparison." />
        ) : (
          <ol className="space-y-3 border-l border-zinc-200 pl-4">
            {view.historical_changes.map((h, i) => (
              <li key={`${h.event_type}-${i}`} className="relative">
                <span className="absolute -left-[1.15rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-zinc-400" />
                <p className="text-sm font-medium capitalize text-zinc-900">
                  {h.event_type.replace(/_/g, ' ')}
                </p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  {h.previous_value ?? '—'} → {h.current_value ?? '—'}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-400">
                  {h.change_observed_at.slice(0, 10)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section id="explorer-methodology" className="scroll-mt-28">
        <SectionTitle title="Methodology and limitations" />
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-700 shadow-sm">
          <ul className="space-y-1">
            <li>Pages analyzed: {view.methodology.pages_analyzed}</li>
            <li>Sources searched: {view.methodology.sources_searched.join(', ') || 'None'}</li>
            <li>Prompts tested: {view.methodology.prompts_tested}</li>
            <li>Models used: {view.methodology.models_used.join(', ') || 'None in this audit'}</li>
          </ul>
          <p className="mt-4 text-xs text-zinc-500">{view.methodology.absence_disclaimer}</p>
        </div>
      </section>
    </div>
  );
}

export function CompareView({
  current,
  previous,
}: {
  current: BrandEvidenceReportView;
  previous: BrandEvidenceReportView | null;
}) {
  if (!previous) {
    return (
      <EmptyState
        title="No previous Brand Evidence Record"
        description="Compare becomes available after a second audit snapshot exists for this project."
      />
    );
  }

  const rows = [
    ['Pages analyzed', previous.executive.pages_analyzed, current.executive.pages_analyzed],
    ['Associations', previous.associations.length, current.associations.length],
    ['Claims', previous.claims.length, current.claims.length],
    ['Contradictions', previous.contradictions.length, current.contradictions.length],
    [
      'External sources',
      previous.executive.external_sources_identified,
      current.executive.external_sources_identified,
    ],
    [
      'Sampled prompts',
      previous.executive.sampled_prompts_tested,
      current.executive.sampled_prompts_tested,
    ],
    [
      'Content types found',
      previous.content_coverage.filter((c) => c.page_count > 0).length,
      current.content_coverage.filter((c) => c.page_count > 0).length,
    ],
  ] as const;

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Compare audits"
        lead={`${previous.executive.audit_date.slice(0, 10)} → ${current.executive.audit_date.slice(0, 10)}`}
      />
      <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Metric</th>
              <th className="px-3 py-2 font-medium">Previous</th>
              <th className="px-3 py-2 font-medium">Current</th>
              <th className="px-3 py-2 font-medium">Delta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {rows.map(([label, prev, curr]) => (
              <tr key={label}>
                <td className="px-3 py-2 text-zinc-900">{label}</td>
                <td className="px-3 py-2 tabular-nums text-zinc-600">{prev}</td>
                <td className="px-3 py-2 tabular-nums text-zinc-600">{curr}</td>
                <td className="px-3 py-2 tabular-nums text-zinc-800">
                  {curr - prev > 0 ? `+${curr - prev}` : String(curr - prev)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {current.historical_changes.length > 0 ? (
        <div>
          <SectionTitle title="Recorded change events" />
          <ul className="space-y-2">
            {current.historical_changes.slice(0, 20).map((h, i) => (
              <li
                key={`${h.event_type}-${i}`}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-medium capitalize text-zinc-900">
                  {h.event_type.replace(/_/g, ' ')}
                </span>
                <span className="text-zinc-600">
                  {' '}
                  · {h.previous_value ?? '—'} → {h.current_value ?? '—'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
