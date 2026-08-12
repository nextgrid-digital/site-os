'use client';

import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import { MetricCard, SectionTitle, StatusChip } from '@/components/audit/evidence/ui';
import {
  AssociationBarChart,
  AssociationMatrix,
  EvidenceBalanceBar,
  SourceDistributionChart,
} from '@/components/audit/evidence/association-visuals';
import type {
  BrandAssociation,
  BrandContradiction,
  KeyObservation,
  PromptRunObservation,
} from '@/lib/evidence/types';
import { EmptyState } from '@/components/audit/evidence/ui';
import { PromptHeatmap } from '@/components/audit/evidence/prompt-heatmap';
import { CompetitorSection } from '@/components/audit/evidence/competitor-section';

function deltaLabel(current: number, previous: number | undefined) {
  if (previous == null) return null;
  const d = current - previous;
  if (d === 0) return 'Unchanged vs prior audit';
  return `${d > 0 ? '+' : ''}${d} vs prior audit`;
}

export function ExecutiveView({
  view,
  previous,
  onAssociation,
  onObservation,
  onContradiction,
  onPrompt,
}: {
  view: BrandEvidenceReportView;
  previous?: BrandEvidenceReportView | null;
  onAssociation: (a: BrandAssociation) => void;
  onObservation: (o: KeyObservation) => void;
  onContradiction: (c: BrandContradiction) => void;
  onPrompt: (p: PromptRunObservation) => void;
}) {
  const ex = view.executive;
  const firstPartyClaims = view.claims.filter((c) =>
    c.verification_status.includes('first_party')
  ).length;
  const contentFound = view.content_coverage.filter((c) => c.page_count > 0).length;
  const brandMentions = view.sampled_ai.filter((p) => p.brand_mentioned).length;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-5">
          <p className="text-[11px] font-medium tracking-[0.14em] text-zinc-400 uppercase">
            Brand summary
          </p>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs text-zinc-500">Strongest supported association</dt>
              <dd className="mt-0.5 text-sm font-semibold text-zinc-950">
                {ex.strongest_supported_association ?? 'Not identified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Intended association</dt>
              <dd className="mt-0.5 text-sm text-zinc-800">
                {ex.weakest_intended_association ?? 'Not provided'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Largest description inconsistency</dt>
              <dd className="mt-0.5 text-sm text-zinc-800">
                {ex.largest_description_inconsistency ?? 'None identified'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Major data limitation</dt>
              <dd className="mt-0.5 text-xs leading-5 text-zinc-600">{ex.major_data_limitation}</dd>
            </div>
          </dl>
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-medium text-zinc-500 hover:text-zinc-800">
              Read full summary
            </summary>
            <p className="mt-2 text-sm leading-6 text-zinc-700">{ex.narrative}</p>
          </details>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-7">
          <MetricCard
            label="Pages analyzed"
            value={ex.pages_analyzed}
            caption="Crawl sample"
            delta={deltaLabel(ex.pages_analyzed, previous?.executive.pages_analyzed)}
          />
          <MetricCard
            label="Sampled prompts"
            value={ex.sampled_prompts_tested}
            caption="AI sample size"
            delta={deltaLabel(ex.sampled_prompts_tested, previous?.executive.sampled_prompts_tested)}
          />
          <MetricCard
            label="Brand appearances"
            value={brandMentions}
            caption="In sampled prompts"
          />
          <MetricCard
            label="External sources"
            value={ex.external_sources_identified}
            caption="Third-party identified"
            delta={deltaLabel(
              ex.external_sources_identified,
              previous?.executive.external_sources_identified
            )}
          />
          <MetricCard
            label="Associations"
            value={view.associations.length}
            caption="Topics detected"
          />
          <MetricCard
            label="First-party claims"
            value={firstPartyClaims}
            caption="Claim records"
          />
          <MetricCard
            label="Contradictions"
            value={view.contradictions.length}
            caption="Unresolved or noted"
            delta={deltaLabel(view.contradictions.length, previous?.contradictions.length)}
          />
          <MetricCard
            label="Content types"
            value={contentFound}
            caption="With pages identified"
          />
          <MetricCard
            label="Competitors"
            value={view.competitors.length}
            caption="In sample"
          />
        </div>
      </div>

      {view.key_observations.length > 0 ? (
        <div>
          <SectionTitle title="Key observations" lead="Factual highlights from this audit." />
          <div className="grid gap-3 md:grid-cols-2">
            {view.key_observations.slice(0, 4).map((o) => (
              <button
                key={o.title}
                type="button"
                onClick={() => onObservation(o)}
                className="rounded-2xl bg-white p-4 text-left shadow-sm transition"
              >
                <p className="text-sm font-semibold text-zinc-950">{o.title}</p>
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-zinc-600">{o.statement}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AssociationMatrix associations={view.associations} onSelect={onAssociation} />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <AssociationBarChart associations={view.associations} />
          <EvidenceBalanceBar
            firstParty={view.evidence_inventory.first_party.length}
            thirdParty={view.evidence_inventory.third_party.length}
            customer={view.evidence_inventory.customer.length}
            conflicting={view.contradictions.length}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SourceDistributionChart rows={view.source_distribution} />
        <div>
          <SectionTitle title="Contradictions" lead="Conflicting values across sources." />
          {view.contradictions.length === 0 ? (
            <EmptyState title="No contradictions identified" />
          ) : (
            <ul className="space-y-3">
              {view.contradictions.slice(0, 4).map((c, i) => (
                <li key={`${c.subject}-${i}`}>
                  <button
                    type="button"
                    onClick={() => onContradiction(c)}
                    className="w-full rounded-2xl bg-white p-4 text-left shadow-sm transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold capitalize text-zinc-950">
                        {c.subject.replace(/_/g, '')}
                      </p>
                      <StatusChip tone="conflict">{c.status.replace(/_/g, '')}</StatusChip>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                      <div className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                        {c.version_a}
                      </div>
                      <span className="text-center text-[10px] font-semibold tracking-wide text-zinc-400 uppercase">
                        vs
                      </span>
                      <div className="rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
                        {c.version_b}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <PromptHeatmap
        runs={view.sampled_ai}
        disclaimer={view.ai_sample_disclaimer}
        onSelect={onPrompt}
      />
      <CompetitorSection
        competitors={view.competitors}
        brandName={ex.company_name}
        brandPromptAppearances={brandMentions}
      />

      <div>
        <SectionTitle title="Historical changes" lead="Events vs the previous Brand Evidence Record." />
        {view.historical_changes.length === 0 ? (
          <EmptyState title="No previous audit is available for historical comparison." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {summarizeHistory(view.historical_changes).map((card) => (
              <MetricCard key={card.label} label={card.label} value={card.value} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function summarizeHistory(
  events: BrandEvidenceReportView['historical_changes']
): Array<{ label: string; value: number }> {
  const count = (prefix: string) => events.filter((e) => e.event_type.includes(prefix)).length;
  return [
    { label: 'Categories added', value: count('category_added') },
    { label: 'Categories removed', value: count('category_removed') },
    { label: 'Claims added', value: count('claim_added') },
    { label: 'Claims removed', value: count('claim_removed') },
    { label: 'Content added', value: count('content_type_added') },
    { label: 'Content removed', value: count('content_type_removed') },
    { label: 'Page count changes', value: count('pages_analyzed') },
    { label: 'AI sample changes', value: count('ai_mentions') },
  ];
}
