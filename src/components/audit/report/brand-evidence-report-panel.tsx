'use client';

import { useState, type ReactNode } from 'react';
import type { SiteIdentity } from '@/lib/audit/site-identity';
import type {
  BrandAssociation,
  BrandClaim,
  BrandContradiction,
  BrandEvidenceReportView,
  CompanyDescription,
  KeyObservation,
  PromptRunObservation,
} from '@/lib/evidence/types';
import { AuditHeader, type ReportViewId } from '@/components/audit/evidence/audit-header';
import {
  EvidenceDrawer,
  type EvidenceDrawerPayload,
} from '@/components/audit/evidence/evidence-drawer';
import { ExecutiveView } from '@/components/audit/evidence/executive-view';
import {
  CompareView,
  EvidenceExplorer,
} from '@/components/audit/evidence/evidence-explorer';
import { ConnectedSourcesView } from '@/components/audit/evidence/connected-sources-view';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { ConnectedUpgradeBanner } from '@/components/audit/connected-upgrade-banner';

function associationPayload(a: BrandAssociation): EvidenceDrawerPayload {
  return {
    title: a.topic,
    subtitle: a.classification.replace(/_/g, ''),
    confidence: a.confidence,
    observedAt: a.last_observed_at ?? a.first_observed_at,
    meta: [
      { label: 'Website mentions', value: String(a.first_party_count) },
      { label: 'Third-party mentions', value: String(a.third_party_count) },
      { label: 'AI sample appearances', value: String(a.ai_appearance_count) },
    ],
    lists: [{ label: 'Supporting URLs', items: a.supporting_urls }],
  };
}

function claimPayload(c: BrandClaim): EvidenceDrawerPayload {
  return {
    title: c.claim_text,
    body: c.claiming_excerpt ?? undefined,
    sourceUrl: c.claiming_source_url,
    observedAt: c.observed_at,
    confidence: c.confidence,
    meta: [
      { label: 'Verification', value: c.verification_status.replace(/_/g, '') },
      { label: 'Corroborations', value: String(c.corroboration_count) },
      { label: 'Contradictions', value: String(c.contradiction_count) },
    ],
    lists: [
      {
        label: 'Evidence excerpts',
        items: c.evidence
          .map((e) => e.excerpt ?? e.source_url)
          .filter((x): x is string => Boolean(x)),
      },
    ],
  };
}

function observationPayload(o: KeyObservation): EvidenceDrawerPayload {
  return {
    title: o.title,
    body: [o.statement, o.evidence_text, o.limitation].filter(Boolean).join('\n\n'),
    sourceType: o.source_type,
    sourceUrl: o.source_url,
    observedAt: o.observed_at,
    confidence: o.confidence,
    meta: o.related_claim_or_topic
      ? [{ label: 'Related', value: o.related_claim_or_topic }]
      : undefined,
  };
}

function contradictionPayload(c: BrandContradiction): EvidenceDrawerPayload {
  return {
    title: c.subject.replace(/_/g, ''),
    subtitle: c.status.replace(/_/g, ''),
    body: `A: ${c.version_a}\n\nB: ${c.version_b}`,
    observedAt: c.observed_at,
    confidence: c.confidence,
    meta: [
      { label: 'Source A', value: c.source_a ?? '—' },
      { label: 'Source B', value: c.source_b ?? '—' },
    ],
    lists: [
      {
        label: 'Source URLs',
        items: [c.source_a_url, c.source_b_url].filter((x): x is string => Boolean(x)),
      },
    ],
  };
}

function descriptionPayload(d: CompanyDescription): EvidenceDrawerPayload {
  return {
    title: d.source_title ?? 'Company description',
    subtitle: d.source_type.replace(/_/g, ''),
    body: d.description_text,
    sourceType: d.source_type,
    sourceUrl: d.source_url,
    observedAt: d.observed_at,
    lists: [
      { label: 'Category terms', items: d.category_terms },
      { label: 'Audience terms', items: d.audience_terms },
      { label: 'Capability terms', items: d.capability_terms },
      { label: 'Flags', items: d.flags },
    ],
  };
}

function promptPayload(p: PromptRunObservation): EvidenceDrawerPayload {
  return {
    title: p.prompt,
    subtitle: `${p.ai_system} · ${p.prompt_category.replace(/_/g, '')}`,
    body: [p.answer_summary, p.brand_description, p.limitations].filter(Boolean).join('\n\n'),
    observedAt: p.run_at,
    confidence: p.confidence,
    meta: [
      { label: 'Brand mentioned', value: p.brand_mentioned ? 'Yes' : 'No' },
      { label: 'Company site cited', value: p.company_website_cited ? 'Yes' : 'No' },
      {
        label: 'Competitors mentioned',
        value: p.competitors_mentioned.join(',') || 'None',
      },
    ],
    lists: [
      { label: 'Associated topics', items: p.associated_topics },
      { label: 'External sources cited', items: p.external_sources_cited },
    ],
  };
}

export function BrandEvidenceReportPanel({
  view,
  previous,
  siteIdentity,
  projectId,
  showRerun,
  rerunSlot,
  connectedMetrics = null,
  showUpgradeBanner = false,
}: {
  view: BrandEvidenceReportView;
  previous?: BrandEvidenceReportView | null;
  siteIdentity: SiteIdentity;
  projectId: string;
  showRerun?: boolean;
  rerunSlot?: ReactNode;
  connectedMetrics?: ConnectedAuditMetrics | null;
  showUpgradeBanner?: boolean;
}) {
  const [activeView, setActiveView] = useState<ReportViewId>('executive');
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [payload, setPayload] = useState<EvidenceDrawerPayload | null>(null);

  const open = (next: EvidenceDrawerPayload) => {
    setPayload(next);
    setDrawerOpen(true);
  };

  const onViewChange = (id: ReportViewId) => {
    if (id === 'connected' && !connectedMetrics) return;
    setActiveView(id);
  };

  return (
    <div className="space-y-6">
      <AuditHeader
        siteIdentity={siteIdentity}
        view={view}
        activeView={activeView}
        onViewChange={onViewChange}
        showRerun={showRerun}
        rerunSlot={rerunSlot}
        showConnected={Boolean(connectedMetrics)}
      />

      {showUpgradeBanner ? <ConnectedUpgradeBanner className="print:hidden" /> : null}

      {activeView === 'executive' ? (
        <ExecutiveView
          view={view}
          previous={previous}
          onAssociation={(a) => open(associationPayload(a))}
          onObservation={(o) => open(observationPayload(o))}
          onContradiction={(c) => open(contradictionPayload(c))}
          onPrompt={(p) => open(promptPayload(p))}
        />
      ) : null}

      {activeView === 'explorer' ? (
        <EvidenceExplorer
          view={view}
          search={search}
          onSearchChange={setSearch}
          onClaim={(c) => open(claimPayload(c))}
          onDescription={(d) => open(descriptionPayload(d))}
          onAssociation={(a) => open(associationPayload(a))}
        />
      ) : null}

      {activeView === 'compare' ? <CompareView current={view} previous={previous ?? null} /> : null}

      {activeView === 'connected' && connectedMetrics ? (
        <ConnectedSourcesView data={connectedMetrics} projectId={projectId} />
      ) : null}

      <EvidenceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} payload={payload} />
    </div>
  );
}
