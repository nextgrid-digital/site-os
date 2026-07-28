import type { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LeadFunnelSummary } from '@/components/operator/lead-funnel-summary';
import { UnlockFullBriefCta } from '@/components/operator/unlock-full-brief-cta';
import { shouldShowReportNextStep } from '@/lib/reports/report-next-step';
import { BriefStatusRail } from '@/components/operator/brief-status-rail';
import { BriefToc, type BriefTocItem } from '@/components/operator/brief-toc';
import {
  AgentPromptSection,
  GrowthMemoBody,
} from '@/components/operator/report/growth-memo-body';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { AuditReadiness } from '@/lib/audit/audit-readiness';
import { readinessLabel } from '@/lib/audit/audit-readiness';
import { buildAuditVerdict, type GrowthBrief } from '@/lib/reports/build-growth-brief';
import type {
  AeoAnalysisRow,
  AgentPrompt,
  ArchitectureInput,
  ArchitectureRecommendation,
  AuditMetrics,
  AuditRun,
  Finding,
  Ga4Property,
  PricingPlan,
  ProjectLeadReportingSummary,
  Project,
  QueryMetric,
  SearchConsoleProperty,
  Website,
} from '@/lib/supabase/types';

function normalizeBrief(
  brief: GrowthBrief,
  metrics: AuditMetrics,
  auditRun?: AuditRun | null,
  liveConnections?: { gscConnected: boolean; ga4Connected: boolean }
): GrowthBrief {
  const gscHasData = metrics.total_impressions >= 50;
  const ga4HasData = metrics.total_sessions >= 30;
  const readiness =
    brief.readiness ??
    auditRun?.audit_readiness ??
    (gscHasData && ga4HasData
      ? 'full_data'
      : gscHasData
        ? 'search_console_only'
        : ga4HasData
          ? 'ga4_only'
          : 'no_data');

  const baseAvailability = brief.dataAvailability ??
    auditRun?.data_availability ?? {
      gscConnected: metrics.total_impressions > 0 || gscHasData,
      ga4Connected: metrics.total_sessions > 0 || ga4HasData,
      gscHasData,
      ga4HasData,
      gscImpressions: metrics.total_impressions,
      ga4Sessions: metrics.total_sessions,
      basedOn: ['crawl' as const],
    };

  const gscConnected = Boolean(liveConnections?.gscConnected || baseAvailability.gscConnected);
  const ga4Connected = Boolean(liveConnections?.ga4Connected || baseAvailability.ga4Connected);

  const dataAvailability = {
    ...baseAvailability,
    gscConnected,
    ga4Connected,
    gscHasData: baseAvailability.gscHasData || gscHasData,
    ga4HasData: baseAvailability.ga4HasData || ga4HasData,
    gscImpressions: Math.max(baseAvailability.gscImpressions, metrics.total_impressions),
    ga4Sessions: Math.max(baseAvailability.ga4Sessions, metrics.total_sessions),
  };

  const needsGscRefresh =
    gscConnected &&
    (!dataAvailability.gscHasData ||
      !brief.dataSignals?.searchConsole ||
      /not connected/i.test(brief.dataSignals.searchConsole));
  const needsGa4Refresh =
    ga4Connected &&
    (!dataAvailability.ga4HasData ||
      !brief.dataSignals?.ga4 ||
      /not connected/i.test(brief.dataSignals.ga4));

  return {
    ...brief,
    readiness,
    readinessLabel: brief.readinessLabel ?? readinessLabel(readiness),
    confidenceScore: brief.confidenceScore ?? auditRun?.confidence_score ?? 40,
    dataAvailability,
    whatWeCanSee: {
      searchConsole: gscConnected
        ? dataAvailability.gscHasData
          ? 'Connected · enough data'
          : 'Connected · not enough data yet'
        : 'Not connected',
      ga4: ga4Connected
        ? dataAvailability.ga4HasData
          ? 'Connected · enough data'
          : 'Connected · not enough data yet'
        : 'Not connected',
      enoughData:
        readiness === 'full_data'
          ? 'Yes — search and engagement volume meet thresholds'
          : readiness === 'no_data'
            ? 'No — audit is primarily site + intake based'
            : 'Partial — one analytics source meets thresholds',
      basedOn:
        brief.whatWeCanSee?.basedOn ??
        (dataAvailability.basedOn.join(', ') || 'site crawl'),
    },
    siteOnlySummary: brief.siteOnlySummary ?? null,
    includeSearchSection: gscConnected,
    includeGa4Section: ga4Connected,
    dataSignals: {
      site: brief.dataSignals?.site ?? 'Site crawl metrics unavailable.',
      searchConsole: !gscConnected
        ? 'Not connected — audit based on site crawl and intake.'
        : needsGscRefresh
          ? dataAvailability.gscHasData
            ? `Connected · ${dataAvailability.gscImpressions} impressions. Re-run the audit to refresh Search Console evidence.`
            : `Connected but insufficient search volume (${dataAvailability.gscImpressions} impressions in window; need ≥50). Re-run the audit to pull Search Console evidence.`
          : brief.dataSignals.searchConsole,
      ga4: !ga4Connected
        ? 'Not connected — audit based on site crawl and intake.'
        : needsGa4Refresh
          ? dataAvailability.ga4HasData
            ? `Connected · ${dataAvailability.ga4Sessions} sessions. Re-run the audit to refresh GA4 evidence.`
            : `Connected but insufficient session volume (${dataAvailability.ga4Sessions} sessions in window; need ≥30). Re-run the audit to pull GA4 evidence.`
          : brief.dataSignals.ga4,
    },
    auditVerdict:
      brief.auditVerdict ??
      buildAuditVerdict({
        siteOnly: null,
        pagesCrawled: metrics.pages_crawled,
        dataAvailability,
        growthLeakTitle: null,
        architectureGapSummary: null,
      }),
    scorecard: {
      ...brief.scorecard,
      offerClarity: brief.scorecard.offerClarity ?? brief.scorecard.overallOpportunity,
      buyerClarity: brief.scorecard.buyerClarity ?? 50,
      trustProof: brief.scorecard.trustProof ?? brief.scorecard.architectureReadiness,
      ctaStrength: brief.scorecard.ctaStrength ?? brief.scorecard.conversionHealth,
      pageArchitecture: brief.scorecard.pageArchitecture ?? brief.scorecard.architectureReadiness,
      searchVisibility: brief.scorecard.searchVisibility ?? brief.scorecard.searchDemand,
      engagementQuality: brief.scorecard.engagementQuality ?? brief.scorecard.conversionHealth,
      presaleReadiness: brief.scorecard.presaleReadiness ?? brief.scorecard.overallOpportunity,
    },
    commercialGraph: brief.commercialGraph ?? null,
  };
}

function reportTypeLabel(readiness: AuditReadiness, isFullRun: boolean): string {
  if (isFullRun && readiness === 'full_data') return 'Presale Brief';
  if (isFullRun) return 'Presale Brief';
  switch (readiness) {
    case 'full_data':
      return 'Presale Brief';
    case 'search_console_only':
      return 'Presale Brief (search)';
    case 'ga4_only':
      return 'Presale Brief (engagement)';
    case 'no_data':
      return 'Presale Brief (site-only)';
    default: {
      const _exhaustive: never = readiness;
      return _exhaustive;
    }
  }
}

function EvidenceLabel({ children }: { children: ReactNode }) {
  return (
    <p className="not-typeset text-xs font-semibold tracking-wide text-white/45 uppercase">
      {children}
    </p>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p>
        <strong>{title}</strong>
      </p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function MemoField({ label, value }: { label: string; value?: string | null }) {
  if (!value?.trim()) return null;
  return (
    <p>
      <strong>{label}: </strong>
      {value}
    </p>
  );
}

function AeoPanel({ aeo }: { aeo: AeoAnalysisRow | null }) {
  if (!aeo) {
    return (
      <section id="aeo" className="scroll-mt-24">
        <h2>AI Interpretation</h2>
        <p>No AEO analysis for this run.</p>
      </section>
    );
  }

  const analysis = aeo.analysis as AeoAnalysis | null;

  return (
    <section id="aeo" className="scroll-mt-24">
      <h2>AI Interpretation</h2>
      <p>Separate from rule-based findings.</p>
      <div className="not-typeset mt-3 flex flex-wrap gap-2">
        <span className="score-pill bg-aeo text-aeo-foreground">AI inference</span>
        <Badge variant="outline">{aeo.status}</Badge>
      </div>
      {aeo.status !== 'completed' || !analysis ? (
        <p>{aeo.error_message ?? 'AEO analysis was not completed for this run.'}</p>
      ) : (
        <>
          <div>
            <EvidenceLabel>Observed facts</EvidenceLabel>
            <p>{analysis.observed_inputs_summary}</p>
          </div>
          <div>
            <EvidenceLabel>Inferred analysis</EvidenceLabel>
            <p>{analysis.business_summary}</p>
            <div className="not-typeset flex gap-4 text-sm text-white/70">
              <p>
                Clarity <span className="font-semibold text-white">{analysis.clarity_score}</span>
              </p>
              <p>
                Answerability{' '}
                <span className="font-semibold text-white">{analysis.answerability_score}</span>
              </p>
            </div>
            <ListBlock title="Ambiguities" items={analysis.risks_and_ambiguities} />
            <ListBlock title="Missing page types" items={analysis.missing_page_types} />
            <ListBlock title="FAQ opportunities" items={analysis.missing_faq_opportunities} />
          </div>
        </>
      )}
    </section>
  );
}

function buildReportIndex(input: {
  brief: GrowthBrief;
  isTeaser: boolean;
  hasPrompts: boolean;
  hasOperatorNotes: boolean;
  gscConnected: boolean;
  ga4Connected: boolean;
  lockDeepSections: boolean;
}): BriefTocItem[] {
  const {
    brief,
    isTeaser,
    hasPrompts,
    hasOperatorNotes,
    gscConnected,
    ga4Connected,
    lockDeepSections,
  } = input;
  const site = brief.siteOnlySummary;
  const items: BriefTocItem[] = [
    { id: 'audit-verdict', label: 'Presale verdict', status: 'available' },
    { id: 'business-context', label: 'Business context', status: 'available' },
  ];

  if (site) {
    items.push({ id: 'site-snapshot', label: 'Site snapshot', status: 'available' });
  }

  items.push({ id: 'scorecard', label: 'Presale readiness', status: 'available' });

  if (site) {
    items.push({ id: 'buyer-moments', label: 'Lead path moments', status: 'available' });
    items.push({ id: 'architecture-gaps', label: 'Page blockers', status: 'available' });
  }

  if (brief.commercialGraph) {
    items.push({ id: 'graph-executive-memo', label: 'Why leads are stuck', status: 'available' });
  }

  items.push({ id: 'lead-funnel', label: 'Lead funnel', status: 'available' });
  items.push({ id: 'priority-fixes', label: 'Top lead blockers', status: 'available' });

  if (brief.commercialGraph) {
    items.push({ id: 'execution-links', label: 'Where to execute', status: 'available' });
  }

  items.push({ id: 'presale-execution-brief', label: 'Presale execution brief', status: 'available' });
  items.push({ id: 'aeo', label: 'AI interpretation', status: 'available' });

  if (hasOperatorNotes) {
    items.push({ id: 'operator-intake', label: 'Operator intake', status: 'available' });
  }

  if (hasPrompts || !lockDeepSections) {
    items.push({ id: 'agent-prompts', label: 'Execution prompt', status: 'available' });
  }

  if (
    shouldShowReportNextStep({
      gscConnected,
      ga4Connected,
      isTeaser,
    })
  ) {
    items.push({ id: 'unlock-cta', label: 'Next step', status: 'available' });
  }

  return items;
}

export function ReportView({
  project,
  website,
  metrics,
  findings,
  prompts,
  pricing: _pricing,
  architecture: _architecture,
  queryMetrics: _queryMetrics,
  aeo,
  operatorNotes,
  auditRun,
  growthBrief,
  fullBriefUnlocked = false,
  leadReporting,
}: {
  project: Project & {
    gsc_property?: SearchConsoleProperty | null;
    ga4_property?: Ga4Property | null;
  };
  website: Website;
  metrics: AuditMetrics;
  findings: Finding[];
  prompts: AgentPrompt[];
  pricing: PricingPlan | null;
  architecture: ArchitectureRecommendation[];
  queryMetrics: QueryMetric[];
  aeo?: AeoAnalysisRow | null;
  operatorNotes?: ArchitectureInput | null;
  auditRun?: AuditRun | null;
  growthBrief?: GrowthBrief | null;
  fullBriefUnlocked?: boolean;
  leadReporting: ProjectLeadReportingSummary;
}) {
  const isTeaser = auditRun?.run_type === 'mini' || growthBrief?.reportType === 'teaser';
  const brief = growthBrief
    ? normalizeBrief(growthBrief, metrics, auditRun, {
        gscConnected: Boolean(project.gsc_property),
        ga4Connected: Boolean(project.ga4_property),
      })
    : null;
  const isFullRun = !isTeaser;
  const gscConnected =
    Boolean(project.gsc_property) || Boolean(brief?.dataAvailability.gscConnected);
  const ga4Connected =
    Boolean(project.ga4_property) || Boolean(brief?.dataAvailability.ga4Connected);
  const analyticsConnected = gscConnected && ga4Connected;
  const lockDeepSections = Boolean(isTeaser) && !analyticsConnected;
  const showNextStep = shouldShowReportNextStep({
    gscConnected,
    ga4Connected,
    isTeaser: Boolean(isTeaser),
  });
  const headline =
    brief?.headline ??
    (brief ? reportTypeLabel(brief.readiness, isFullRun) : isTeaser ? 'Site-only audit' : 'Full audit');

  const hasOperatorNotes = Boolean(
    operatorNotes &&
      [
        operatorNotes.business_type,
        operatorNotes.site_type,
        operatorNotes.primary_offer,
        operatorNotes.secondary_offers,
        operatorNotes.primary_icp,
        operatorNotes.secondary_icps,
        operatorNotes.conversion_goal,
        operatorNotes.trust_proof_assets,
        operatorNotes.nextgrid_notes,
        operatorNotes.pricing_context,
        operatorNotes.engagement_interest,
        operatorNotes.icp_notes,
        operatorNotes.product_notes,
        operatorNotes.offer_notes,
        operatorNotes.proof_notes,
      ].some((value) => typeof value === 'string' && value.trim().length > 0)
  );

  const hasPrompts = prompts.length > 0 || (!lockDeepSections && findings.length > 0);
  const tocItems = brief
    ? buildReportIndex({
        brief,
        isTeaser: Boolean(isTeaser),
        hasPrompts,
        hasOperatorNotes,
        gscConnected,
        ga4Connected,
        lockDeepSections,
      })
    : [];

  const firstPrompt = prompts[0] ?? null;
  const nextStepCta = (
    <UnlockFullBriefCta
      projectId={project.id}
      projectName={project.name}
      alreadyUnlocked={fullBriefUnlocked}
      executionPrompt={firstPrompt?.full_prompt ?? null}
      gscConnected={gscConnected}
      ga4Connected={ga4Connected}
      isTeaser={Boolean(isTeaser)}
    />
  );

  return (
    <div className="grid w-full gap-8 print:shadow-none xl:grid-cols-[180px_minmax(0,1fr)_280px]">
      <div className="hidden min-h-0 xl:block xl:self-stretch">
        <BriefToc items={tocItems} />
      </div>

      {brief ? (
        <div className="order-1 min-h-0 xl:order-3 xl:self-stretch">
          <BriefStatusRail
            brief={brief}
            isFullRun={isFullRun}
            projectId={project.id}
            fullBriefUnlocked={fullBriefUnlocked}
            findingsCount={metrics.findings_count}
            pagesCrawled={metrics.pages_crawled}
          />
        </div>
      ) : null}

      <div className="order-2 flex min-w-0 flex-col xl:order-2">
        <div className="typeset typeset-docs mx-auto w-full max-w-[90ch]">
          <header className="space-y-3">
            <div>
              <h1>
                {headline}
                <span className="not-typeset text-white/45"> · {project.name}</span>
              </h1>
              <p>{website.url}</p>
              {brief ? (
                <p className="not-typeset mt-1 text-xs text-white/45">
                  Data status: {brief.whatWeCanSee.basedOn}
                  {' · '}
                  GSC {brief.dataAvailability.gscConnected ? 'connected' : 'not connected'}
                  {' · '}
                  GA4 {brief.dataAvailability.ga4Connected ? 'connected' : 'not connected'}
                  {' · '}
                  Confidence {brief.confidenceScore}
                </p>
              ) : null}
            </div>
            <div className="not-typeset flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
              <p>
                <span className="text-white/45">Findings </span>
                <span className="font-semibold text-white tabular-nums">{metrics.findings_count}</span>
              </p>
              <p>
                <span className="text-white/45">Pages </span>
                <span className="font-semibold text-white tabular-nums">{metrics.pages_crawled}</span>
              </p>
              {brief?.includeSearchSection || metrics.total_impressions > 0 ? (
                <>
                  <p>
                    <span className="text-white/45">Clicks </span>
                    <span className="font-semibold text-white tabular-nums">
                      {metrics.total_clicks}
                    </span>
                  </p>
                  <p>
                    <span className="text-white/45">Impressions </span>
                    <span className="font-semibold text-white tabular-nums">
                      {metrics.total_impressions}
                    </span>
                  </p>
                </>
              ) : null}
              {brief?.includeGa4Section || metrics.total_sessions > 0 ? (
                <p>
                  <span className="text-white/45">Sessions </span>
                  <span className="font-semibold text-white tabular-nums">
                    {metrics.total_sessions}
                  </span>
                </p>
              ) : null}
            </div>
          </header>

          {brief ? (
            <GrowthMemoBody
              brief={brief}
              isTeaser={Boolean(isTeaser)}
              lockDeepSections={lockDeepSections}
              projectId={project.id}
              operatorNotes={operatorNotes}
              findings={findings}
              firstPrompt={firstPrompt}
            />
          ) : null}

          <section id="lead-funnel" className="scroll-mt-24">
            <LeadFunnelSummary
              projectId={project.id}
              reporting={leadReporting}
              title="Lead funnel snapshot"
              description="Current channel traffic, lead gain, and funnel status across the tracked pipeline."
            />
          </section>

          <AeoPanel aeo={aeo ?? null} />

          {hasOperatorNotes ? (
            <section id="operator-intake" className="scroll-mt-24">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2>Operator intake</h2>
                <Badge className="not-typeset" variant="outline">
                  Operator notes
                </Badge>
              </div>
              <MemoField label="Business type" value={operatorNotes?.business_type} />
              <MemoField label="Site type" value={operatorNotes?.site_type} />
              <MemoField label="Primary offer" value={operatorNotes?.primary_offer} />
              <MemoField label="Secondary offers" value={operatorNotes?.secondary_offers} />
              <MemoField label="Primary ICP" value={operatorNotes?.primary_icp} />
              <MemoField label="Secondary ICPs" value={operatorNotes?.secondary_icps} />
              <MemoField label="Conversion goal" value={operatorNotes?.conversion_goal} />
              <MemoField label="Trust / proof" value={operatorNotes?.trust_proof_assets} />
              <MemoField label="Engagement interest" value={operatorNotes?.engagement_interest} />
              <MemoField label="Pricing context" value={operatorNotes?.pricing_context} />
              <MemoField label="Operator notes" value={operatorNotes?.nextgrid_notes} />
              <MemoField label="ICP notes" value={operatorNotes?.icp_notes} />
              <MemoField label="Product notes" value={operatorNotes?.product_notes} />
              <MemoField label="Offer notes" value={operatorNotes?.offer_notes} />
              <MemoField label="Proof notes" value={operatorNotes?.proof_notes} />
            </section>
          ) : null}

          <div id="agent-prompts" className="scroll-mt-24 space-y-4">
            <AgentPromptSection
              prompt={firstPrompt}
              locked={lockDeepSections && !firstPrompt}
            />
            <div className="not-typeset flex flex-wrap gap-2">
              <Button render={<Link href={`/operator/projects/${project.id}/work-orders`} />}>
                Open Fix Queue
              </Button>
              <Button
                variant="outline"
                render={<Link href={`/operator/projects/${project.id}/findings`} />}
              >
                Findings queue
              </Button>
            </div>
          </div>

          {showNextStep ? (
            <div id="unlock-cta" className="not-typeset scroll-mt-24">
              {nextStepCta}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
