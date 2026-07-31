'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import '@/components/marketing/site-os/site-os-home.css';
import { HeroDemoDashboard } from '@/components/marketing/site-os/demo/hero-demo-dashboard';
import {
  EvidenceDrawer,
  type EvidenceDrawerPayload,
} from '@/components/audit/evidence/evidence-drawer';
import { ConnectedUpgradeBanner } from '@/components/audit/connected-upgrade-banner';
import { AnalyticsConversionPeak } from '@/components/audit/report/analytics/analytics-conversion-peak';
import { AnalyticsDetailTables } from '@/components/audit/report/analytics/analytics-detail-tables';
import { AnalyticsDimensionGrid } from '@/components/audit/report/analytics/analytics-dimension-grid';
import { AnalyticsKpiRow } from '@/components/audit/report/analytics/analytics-kpi-row';
import { AnalyticsPathFunnel } from '@/components/audit/report/analytics/analytics-path-funnel';
import { AnalyticsPerformanceEmpty } from '@/components/audit/report/analytics/analytics-performance-empty';
import { SectionHeading } from '@/components/audit/report/section-heading';
import {
  buildAnalyticsKpiTiles,
  buildConversionPeakCells,
  buildDetailTables,
  buildDevicesBarRows,
  buildEventsBarRows,
  buildLocationsBarRows,
  buildPagesBarRows,
  buildPathFunnelView,
  buildSearchBarRows,
  buildSourcesBarRows,
  hasAnyTrafficData,
} from '@/lib/audit/connected-analytics';
import {
  buildHeroDashboardFromConnected,
  buildKeywordsHeroDashboard,
} from '@/lib/audit/connected-hero-dashboard';
import type { SiteIdentity } from '@/lib/audit/site-identity';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type {
  BrandAssociation,
  BrandClaim,
  BrandContradiction,
  BrandEvidenceReportView,
  KeyObservation,
} from '@/lib/evidence/types';

const REPORT_FAQ = [
  {
    q: 'What is this Brand Evidence Record?',
    a: 'A source-backed snapshot of how your brand appears on the public website and in sampled AI answers. It records observations — it does not recommend fixes or invent scores.',
  },
  {
    q: 'Where is the joined Search → visit → outcome view?',
    a: 'Open the Journey tab in this workspace. That view joins Search Console and GA4 on the same pages. Evidence keeps the Brand Evidence Record and traffic overview.',
  },
  {
    q: 'Why are Search Console and GA4 empty?',
    a: 'Properties may be selected while the Google token is expired or revoked. Reconnect Google on the Connect page, then re-run a full audit to store query, page, and channel rows.',
  },
  {
    q: 'Do I need Google to see crawl evidence?',
    a: 'No. Free crawl evidence (pages, claims, associations, prompts) does not require Search Console or GA4. Connected sources add search and traffic observations beside the crawl.',
  },
  {
    q: 'How do I refresh the data?',
    a: 'Use Re-run in the report header. Free re-runs refresh the crawl; full re-runs also pull connected Google metrics when the token is valid.',
  },
];

function claimPayload(c: BrandClaim): EvidenceDrawerPayload {
  return {
    title: c.claim_text,
    body: c.claiming_excerpt ?? undefined,
    sourceUrl: c.claiming_source_url,
    observedAt: c.observed_at,
    confidence: c.confidence,
    meta: [
      { label: 'Verification', value: c.verification_status.replace(/_/g, ' ') },
      { label: 'Corroborations', value: String(c.corroboration_count) },
      { label: 'Contradictions', value: String(c.contradiction_count) },
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
  };
}

function associationPayload(a: BrandAssociation): EvidenceDrawerPayload {
  return {
    title: a.topic,
    subtitle: a.classification.replace(/_/g, ' '),
    confidence: a.confidence,
    meta: [
      { label: 'Website mentions', value: String(a.first_party_count) },
      { label: 'Third-party mentions', value: String(a.third_party_count) },
      { label: 'AI sample appearances', value: String(a.ai_appearance_count) },
    ],
    lists: [{ label: 'Supporting URLs', items: a.supporting_urls }],
  };
}

function contradictionPayload(c: BrandContradiction): EvidenceDrawerPayload {
  return {
    title: c.subject.replace(/_/g, ' '),
    subtitle: c.status.replace(/_/g, ' '),
    body: `A: ${c.version_a}\n\nB: ${c.version_b}`,
    observedAt: c.observed_at,
    confidence: c.confidence,
  };
}

function Heatmap({ intensities }: { intensities: number[] }) {
  if (intensities.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        No page intensity data yet for this audit run.
      </p>
    );
  }
  return (
    <div
      className="mt-4 grid gap-1"
      style={{ gridTemplateColumns: 'repeat(21, minmax(0, 1fr))' }}
    >
      {intensities.slice(0, 84).map((v, i) => (
        <div
          key={i}
          className="aspect-square min-h-3 rounded-sm border border-border"
          style={{
            background:
              v <= 0
                ? 'var(--surface-5, #f4f4f5)'
                : `color-mix(in oklab, oklch(0.45 0.1 164) ${Math.round(v * 100)}%, transparent)`,
            opacity: v <= 0 ? 1 : 0.35 + v * 0.65,
          }}
          title={`Intensity ${Math.round(v * 100)}%`}
        />
      ))}
    </div>
  );
}

export function KobbeAuditReport({
  view,
  siteIdentity: _siteIdentity,
  projectId,
  connectedMetrics = null,
  showUpgradeBanner = true,
}: {
  view: BrandEvidenceReportView;
  siteIdentity: SiteIdentity;
  projectId: string;
  connectedMetrics?: ConnectedAuditMetrics | null;
  showUpgradeBanner?: boolean;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [payload, setPayload] = useState<EvidenceDrawerPayload | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [secondaryTab, setSecondaryTab] = useState<'keywords' | 'channels'>('keywords');

  const open = (next: EvidenceDrawerPayload) => {
    setPayload(next);
    setDrawerOpen(true);
  };

  const heroData = useMemo(
    () => buildHeroDashboardFromConnected(connectedMetrics, view),
    [connectedMetrics, view]
  );
  const keywordsData = useMemo(
    () => buildKeywordsHeroDashboard(connectedMetrics),
    [connectedMetrics]
  );

  const hasGoogleRows = useMemo(() => {
    return hasAnyTrafficData(connectedMetrics ?? null);
  }, [connectedMetrics]);

  const analyticsKpis = useMemo(
    () => buildAnalyticsKpiTiles(connectedMetrics ?? null),
    [connectedMetrics]
  );
  const detailTables = useMemo(
    () => buildDetailTables(connectedMetrics ?? null),
    [connectedMetrics]
  );
  const peakCells = useMemo(
    () => buildConversionPeakCells(connectedMetrics?.ga4ConversionPeak),
    [connectedMetrics]
  );
  const funnelSteps = useMemo(
    () => buildPathFunnelView(connectedMetrics?.ga4FunnelSteps),
    [connectedMetrics]
  );
  const dimensionCards = useMemo(
    () => [
      {
        title: 'Pages',
        kind: 'page' as const,
        rows: buildPagesBarRows(connectedMetrics ?? null),
        empty: 'No page traffic in this audit yet.',
      },
      {
        title: 'Sources',
        kind: 'source' as const,
        rows: buildSourcesBarRows(connectedMetrics ?? null),
        empty: 'No channel traffic in this audit yet.',
      },
      {
        title: 'Locations',
        kind: 'country' as const,
        rows: buildLocationsBarRows(connectedMetrics ?? null),
        empty: 'No country breakdown yet. Re-run full audit with GA4.',
      },
      {
        title: 'Devices',
        kind: 'device' as const,
        rows: buildDevicesBarRows(connectedMetrics ?? null),
        empty: 'No device breakdown yet. Re-run full audit with GA4.',
      },
      {
        title: 'Google Search',
        kind: 'search' as const,
        rows: buildSearchBarRows(connectedMetrics ?? null),
        empty: 'No Search Console queries in this audit yet.',
      },
      {
        title: 'Events',
        kind: 'event' as const,
        rows: buildEventsBarRows(connectedMetrics ?? null),
        empty: 'No event breakdown yet. Re-run full audit with GA4.',
      },
    ],
    [connectedMetrics]
  );

  const gridCards = useMemo(() => {
    const fromAssoc = view.associations.slice(0, 6).map((a) => ({
      title: a.topic,
      stat: String(a.first_party_count + a.third_party_count + a.ai_appearance_count),
      description: a.classification.replace(/_/g, ' '),
      onClick: () => open(associationPayload(a)),
    }));
    const fromCoverage = view.content_coverage.slice(0, 3).map((c) => ({
      title: c.content_type.replace(/_/g, ' '),
      stat: String(c.page_count),
      description: c.evidence_strength.replace(/_/g, ' '),
      onClick: undefined as (() => void) | undefined,
    }));
    const cards = [...fromAssoc, ...fromCoverage].slice(0, 9);
    while (cards.length < 9) {
      cards.push({
        title: 'No module yet',
        stat: '—',
        description: 'More evidence appears as the crawl and samples grow.',
        onClick: undefined,
      });
    }
    return cards;
  }, [view]);

  const pageRows = useMemo(() => {
    const pages = connectedMetrics?.pageMetrics ?? [];
    return [...pages]
      .filter((p) => p.ga_sessions > 0 || p.gsc_impressions > 0 || p.path)
      .toSorted(
        (a, b) =>
          (b.ga_sessions || b.gsc_impressions) - (a.ga_sessions || a.gsc_impressions)
      )
      .slice(0, 12);
  }, [connectedMetrics]);

  const heatmap = useMemo(() => {
    if (pageRows.length === 0) return [];
    const max = Math.max(
      ...pageRows.map((p) => p.ga_sessions || p.gsc_impressions || 1),
      1
    );
    const base = pageRows.map((p) => (p.ga_sessions || p.gsc_impressions || 0) / max);
    const out: number[] = [];
    for (let i = 0; i < 84; i++) out.push(base[i % base.length] ?? 0);
    return out;
  }, [pageRows]);

  const checklist = useMemo(() => {
    const claimRows = view.claims.slice(0, 8).map((c) => ({
      id: c.claim_text,
      label: c.claim_text,
      ok:
        c.verification_status === 'independently_corroborated' ||
        c.verification_status === 'directly_observed' ||
        c.verification_status === 'supported_by_customer_evidence',
      meta: c.verification_status.replace(/_/g, ' '),
      onClick: () => open(claimPayload(c)),
    }));
    const contraRows = view.contradictions.slice(0, 4).map((c) => ({
      id: c.subject,
      label: c.subject.replace(/_/g, ' '),
      ok: c.status !== 'unresolved',
      meta: c.status.replace(/_/g, ' '),
      onClick: () => open(contradictionPayload(c)),
    }));
    return [...claimRows, ...contraRows];
  }, [view]);

  const ex = view.executive;

  return (
    <div className="site-os-home site-os-home--flush -mx-8">
      {showUpgradeBanner ? (
        <div className="mx-auto max-w-280 px-8 pt-4 print:hidden">
          <ConnectedUpgradeBanner />
        </div>
      ) : null}

      {/* Hero dashboard */}
      <section className="block">
        <div className="mx-auto max-w-280 px-8 pb-12 pt-2">
          {connectedMetrics?.googleConnected && !hasGoogleRows ? (
            <p className="mx-auto mb-6 max-w-xl text-center text-xs text-muted-foreground">
              Properties are selected, but this audit stored no Google rows. Reconnect Google on the{' '}
              <Link
                href={`/audit/${projectId}/connect`}
                className="underline underline-offset-2 hover:text-foreground"
              >
                Connect page
              </Link>
              , then re-run the full audit.
            </p>
          ) : null}

          <HeroDemoDashboard data={heroData} />
        </div>
      </section>

      {/* Connected analytics long-scroll */}
      <section className="block pt-4">
        <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
          <SectionHeading
            title="Traffic and search evidence"
            lead="Real GA4 and Search Console numbers from this audit run. For the joined Search → visit → outcome story, open the Journey tab."
          />
          <AnalyticsKpiRow tiles={analyticsKpis} />
          <AnalyticsDimensionGrid cards={dimensionCards} />
          <AnalyticsDetailTables
            sources={detailTables.sources}
            countries={detailTables.countries}
            devices={detailTables.devices}
            browsers={detailTables.browsers}
            pages={detailTables.pages}
            events={detailTables.events}
          />
          <AnalyticsConversionPeak cells={peakCells} />
          <AnalyticsPathFunnel steps={funnelSteps} />
          <AnalyticsPerformanceEmpty />
        </div>
      </section>

      {/* 3x3 evidence grid */}
      <section className="block pt-8">
        <div className="mx-auto max-w-280 px-8 py-16">
          <SectionHeading
            title="Evidence modules on this site"
            lead="Associations and content coverage observed in this audit — factual counts only."
          />
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gridCards.map((card, i) => (
              <button
                key={`${card.title}-${i}`}
                type="button"
                disabled={!card.onClick}
                onClick={card.onClick}
                className="flex min-h-[11rem] flex-col rounded-[14px] border border-solid border-surface bg-surface-3 p-4 text-left transition hover:border-zinc-300 disabled:cursor-default disabled:opacity-80"
              >
                <div className="flex h-24 items-center justify-center rounded-xl bg-surface-5 text-2xl font-semibold text-zinc-400">
                  {card.stat}
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">{card.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Pages table + heatmap */}
      <section className="block pt-8">
        <div className="mx-auto max-w-280 px-8 py-16">
          <SectionHeading
            title="See where traffic and search land"
            lead="Pages from this audit run with Search Console and GA4 columns when available."
          />
          <div className="mt-10 overflow-x-auto rounded-[14px] border border-solid border-surface bg-surface-3">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="border-b border-surface-6 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Path</th>
                  <th className="px-4 py-3 font-medium">GSC clicks</th>
                  <th className="px-4 py-3 font-medium">GSC impr.</th>
                  <th className="px-4 py-3 font-medium">GA sessions</th>
                  <th className="px-4 py-3 font-medium">Engaged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-6">
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No page rows with Google signals in this run.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => (
                    <tr key={row.id}>
                      <td className="max-w-[16rem] truncate px-4 py-2.5 font-medium">
                        {row.path || '/'}
                      </td>
                      <td className="px-4 py-2.5 tabular-nums">{row.gsc_clicks}</td>
                      <td className="px-4 py-2.5 tabular-nums">{row.gsc_impressions}</td>
                      <td className="px-4 py-2.5 tabular-nums">{row.ga_sessions}</td>
                      <td className="px-4 py-2.5 tabular-nums">{row.ga_engaged_sessions}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-6 text-xs font-medium text-muted-foreground">Activity intensity</p>
          <Heatmap intensities={heatmap} />
        </div>
      </section>

      {/* Insights */}
      <section className="block pt-8">
        <div className="mx-auto max-w-280 px-8 py-16">
          <SectionHeading
            title="Main observations from this audit"
            lead={ex.narrative || 'Key factual observations recorded in the evidence record.'}
          />
          <ol className="mx-auto mt-10 max-w-2xl space-y-2">
            {view.key_observations.length === 0 ? (
              <li className="rounded-[14px] border border-surface bg-surface-3 px-4 py-6 text-center text-sm text-muted-foreground">
                No key observations in this record yet.
              </li>
            ) : (
              view.key_observations.slice(0, 10).map((o, i) => (
                <li key={`${o.title}-${i}`}>
                  <button
                    type="button"
                    onClick={() => open(observationPayload(o))}
                    className="flex w-full items-start gap-3 rounded-[14px] border border-surface bg-surface-3 px-4 py-3 text-left transition hover:border-zinc-300"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-medium text-surface-3">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{o.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-2">
                        {o.statement}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ol>
        </div>
      </section>

      {/* Checklist */}
      <section className="block pt-8">
        <div className="mx-auto max-w-280 px-8 py-16">
          <SectionHeading
            title="Claims and contradictions to review"
            lead="Verification statuses from the evidence record — not a scored SEO checklist."
          />
          <ul className="mx-auto mt-10 max-w-2xl space-y-2">
            {checklist.length === 0 ? (
              <li className="rounded-[14px] border border-surface bg-surface-3 px-4 py-6 text-center text-sm text-muted-foreground">
                No claims or contradictions recorded yet.
              </li>
            ) : (
              checklist.map((row) => (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={row.onClick}
                    className="flex w-full items-center gap-3 rounded-[14px] border border-surface bg-surface-3 px-4 py-3 text-left transition hover:border-zinc-300"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                        row.ok
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-zinc-300 bg-zinc-50 text-zinc-500'
                      }`}
                      aria-hidden
                    >
                      {row.ok ? '✓' : '·'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{row.label}</span>
                      <span className="text-xs text-muted-foreground">{row.meta}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {/* Secondary GSC/GA dashboard */}
      <section className="block pt-8">
        <div className="mx-auto max-w-280 px-8 py-16">
          <SectionHeading
            title="More connected search and traffic data"
            lead="Switch between Search Console keywords and channel-oriented views."
          />
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {(
              [
                { id: 'keywords' as const, label: 'Keywords' },
                { id: 'channels' as const, label: 'Channels' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSecondaryTab(tab.id)}
                className={
                  secondaryTab === tab.id
                    ? 'rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-surface-3'
                    : 'rounded-lg border border-surface bg-surface-3 px-3 py-1.5 text-xs font-medium text-muted-foreground'
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="mt-8">
            <HeroDemoDashboard data={secondaryTab === 'keywords' ? keywordsData : heroData} />
          </div>
        </div>
      </section>

      {/* Personalized summary — factual counts only */}
      <section className="block pt-8">
        <div className="mx-auto max-w-280 px-8 py-16">
          <SectionHeading title="Your site evidence summary" />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[14px] border border-surface bg-surface-3 p-6">
              <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
                Record counts
              </p>
              <dl className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Pages analyzed</dt>
                  <dd className="text-2xl font-semibold">{ex.pages_analyzed}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Claims</dt>
                  <dd className="text-2xl font-semibold">{view.claims.length}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Prompts sampled</dt>
                  <dd className="text-2xl font-semibold">{ex.sampled_prompts_tested}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">External sources</dt>
                  <dd className="text-2xl font-semibold">{ex.external_sources_identified}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-5 text-muted-foreground">{ex.major_data_limitation}</p>
            </div>
            <div className="flex flex-col justify-center rounded-[14px] border border-dashed border-surface bg-surface-5 p-6">
              <p className="text-sm font-medium">Strongest supported association</p>
              <p className="mt-2 text-lg [font-family:LTRemark,_Georgia,_serif]">
                {ex.strongest_supported_association || 'Not identified in this run'}
              </p>
              <p className="mt-4 text-sm font-medium">Largest description inconsistency</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {ex.largest_description_inconsistency || 'None flagged'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="block pt-8 pb-20">
        <div className="mx-auto max-w-280 px-8 py-16">
          <SectionHeading title="FAQ" lead="About this evidence report and connected sources." />
          <div className="mx-auto mt-10 max-w-2xl divide-y divide-surface-6 rounded-[14px] border border-surface bg-surface-3">
            {REPORT_FAQ.map((item, i) => {
              const openFaq = faqOpen === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-medium"
                    onClick={() => setFaqOpen(openFaq ? null : i)}
                    aria-expanded={openFaq}
                  >
                    {item.q}
                    <span className="text-muted-foreground" aria-hidden>
                      {openFaq ? '−' : '+'}
                    </span>
                  </button>
                  {openFaq ? (
                    <p className="px-4 pb-4 text-sm leading-6 text-muted-foreground">{item.a}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <EvidenceDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} payload={payload} />
    </div>
  );
}
