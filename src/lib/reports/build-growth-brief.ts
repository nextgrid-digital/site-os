import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { AeoRunResult } from '@/lib/aeo/run-aeo-analysis';
import {
  readinessLabel,
  type AuditReadiness,
  type DataAvailability,
} from '@/lib/audit/audit-readiness';
import { generatePromptForFinding } from '@/lib/audit/prompt-generator';
import type { PricingRecommendation } from '@/lib/audit/pricing';
import type { ScoredFinding } from '@/lib/audit/score-findings';
import type { SiteOnlyAnalysis, SiteOnlyPageInventoryItem } from '@/lib/audit/site-only-analysis';
import type { CommercialGraphBriefSlice } from '@/lib/graph/types';
import type {
  ArchitectureInput,
  AuditMetrics,
  AuditRunType,
  QueryMetric,
  ReportType,
} from '@/lib/supabase/types';

export interface GrowthBriefPriorityItem {
  title: string;
  summary: string;
  page_path: string | null;
  category: string;
  type: string;
  priority_score: number;
  revenue_impact: number;
  buyer_importance: number;
  urgency: number;
  execution_difficulty: number;
  confidence: number;
  aeo_value: number;
  whyFirst: string;
  buyer_moment: string;
  estimated_value: string;
}

export interface GrowthBriefExecutionItem {
  title: string;
  page_path: string | null;
  whatToChange: string;
  recommendedRewrite: string;
  internalLinks: string;
  faqQuestions: string;
  schemaSuggestions: string;
  expectedEffect: string;
  nextgridShouldImplement: boolean;
  priority_score: number;
  findingType: string;
}

export interface GrowthBriefTeaser {
  growthLeak: GrowthBriefPriorityItem | null;
  architectureGap: GrowthBriefPriorityItem | null;
  aeoInsight: string | null;
  nextStep: string;
}

export interface GrowthBriefAuditVerdict {
  verdict: string;
  mainIssue: string;
  firstFix: string;
  why: string;
}

export interface GrowthBrief {
  reportType: ReportType;
  headline: string;
  readiness: AuditReadiness;
  readinessLabel: string;
  confidenceScore: number;
  dataAvailability: DataAvailability;
  whatWeCanSee: {
    searchConsole: string;
    ga4: string;
    enoughData: string;
    basedOn: string;
  };
  auditVerdict: GrowthBriefAuditVerdict;
  businessInterpretation: string;
  icpAlignment: string;
  offerClarity: string;
  dataSignals: {
    site: string;
    searchConsole: string;
    ga4: string;
  };
  siteOnlySummary: {
    whatTheSiteSays: string[];
    messagingClarity: string[];
    architectureGaps: string[];
    proofGaps: string[];
    buyerMoments: string[];
    recommendedNextSteps: string[];
    inferredBusinessAppearance: string | null;
    labels: { observed: string; inferred: string };
    pageInventory: SiteOnlyPageInventoryItem[];
    pagesCrawled: number;
    metaIssues: number;
    missingPageKinds: number;
    criticalFindings: number;
    ogImageUrl: string | null;
  } | null;
  aeoUnderstanding: {
    status: AeoRunResult['status'];
    draftDisclaimer: string;
    businessSummary: string | null;
    clarityScore: number | null;
    answerabilityScore: number | null;
    ambiguities: string[];
    missingEntities: string[];
    missingProof: string[];
    missingPageTypes: string[];
    faqOpportunities: string[];
  };
  scorecard: {
    overallOpportunity: number;
    searchDemand: number;
    conversionHealth: number;
    architectureReadiness: number;
    aeoClarity: number;
    offerClarity: number;
    buyerClarity: number;
    trustProof: number;
    ctaStrength: number;
    pageArchitecture: number;
    searchVisibility: number;
    engagementQuality: number;
    presaleReadiness: number;
  };
  includeSearchSection: boolean;
  includeGa4Section: boolean;
  priorityStack: GrowthBriefPriorityItem[];
  executionBriefs: GrowthBriefExecutionItem[];
  offerRecommendation: {
    tier: string;
    priceRange: string;
    rationale: string;
    includedItems: string[];
    nextgridAction: string;
  };
  teaser: GrowthBriefTeaser | null;
  comparison: Array<{ feature: string; teaser: string; growthBrief: string }>;
  commercialGraph: CommercialGraphBriefSlice | null;
}

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function toPriorityItem(finding: ScoredFinding): GrowthBriefPriorityItem {
  const whyFirst = [
    `Revenue impact ${finding.revenue_impact}/100`,
    `buyer importance ${finding.buyer_importance}/100`,
    `urgency ${finding.urgency}/100`,
    `AEO value ${finding.aeo_value}/100`,
    `difficulty ${finding.execution_difficulty}/100`,
  ].join('; ');

  return {
    title: finding.title,
    summary: finding.summary,
    page_path: finding.page_path,
    category: finding.category,
    type: finding.type,
    priority_score: finding.priority_score,
    revenue_impact: finding.revenue_impact,
    buyer_importance: finding.buyer_importance,
    urgency: finding.urgency,
    execution_difficulty: finding.execution_difficulty,
    confidence: finding.confidence,
    aeo_value: finding.aeo_value,
    whyFirst: `Prioritized first because ${whyFirst}. ${finding.estimated_value}.`,
    buyer_moment: finding.buyer_moment,
    estimated_value: finding.estimated_value,
  };
}

function siteGapToPriorityItem(
  title: string,
  summary: string,
  type: string
): GrowthBriefPriorityItem {
  return {
    title,
    summary,
    page_path: null,
    category: 'architecture',
    type,
    priority_score: 65,
    revenue_impact: 55,
    buyer_importance: 60,
    urgency: 55,
    execution_difficulty: 40,
    confidence: 70,
    aeo_value: 50,
    whyFirst: 'Prioritized from site structure analysis when traffic data is limited.',
    buyer_moment: 'Evaluation',
    estimated_value: 'Clearer buyer journey',
  };
}

function buildExecutionBrief(
  finding: ScoredFinding,
  projectName: string,
  websiteUrl: string
): GrowthBriefExecutionItem {
  const prompt = generatePromptForFinding(finding, projectName, websiteUrl);
  const nextgridShouldImplement =
    (finding.severity === 'high' || finding.severity === 'critical') &&
    finding.execution_difficulty <= 65 &&
    finding.priority_score >= 60;

  return {
    title: finding.title,
    page_path: finding.page_path,
    whatToChange: prompt.exact_change,
    recommendedRewrite: prompt.copy_guidance,
    internalLinks: prompt.internal_links,
    faqQuestions: prompt.faq_schema_guidance,
    schemaSuggestions: prompt.faq_schema_guidance,
    expectedEffect: finding.estimated_value,
    nextgridShouldImplement,
    priority_score: finding.priority_score,
    findingType: finding.type,
  };
}

function buildBusinessInterpretation(intake: ArchitectureInput | null, aeo: AeoAnalysis | null) {
  const parts: string[] = [];
  if (intake?.business_type) parts.push(`Business type: ${intake.business_type}.`);
  if (intake?.primary_offer) parts.push(`Primary offer: ${intake.primary_offer}.`);
  if (intake?.conversion_goal) parts.push(`Conversion goal: ${intake.conversion_goal}.`);
  if (aeo?.business_summary) {
    parts.push(`AI inference: ${aeo.business_summary}`);
  } else if (parts.length === 0) {
    return 'Business context is thin. Fill project intake so recommendations map to offers and buyers.';
  } else {
    parts.push('No AEO summary available; interpretation is intake-only.');
  }
  return parts.join(' ');
}

function buildIcpAlignment(intake: ArchitectureInput | null, aeo: AeoAnalysis | null) {
  const stated = [intake?.primary_icp, intake?.secondary_icps, intake?.icp_notes]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' | ');
  const inferred = aeo?.inferred_icps?.join(', ') ?? '';
  if (!stated && !inferred) {
    return 'No ICP stated in intake and no inferred ICPs from AEO. Buyer targeting is ambiguous.';
  }
  if (stated && inferred) {
    return `Operator ICP: ${stated}. AI inference ICPs: ${inferred}. Align pages and proof to the overlap first.`;
  }
  return stated
    ? `Operator ICP: ${stated}. Use this to prioritize missing pages and proof.`
    : `AI inference ICPs: ${inferred}.`;
}

function buildOfferClarity(intake: ArchitectureInput | null, aeo: AeoAnalysis | null) {
  const primary = intake?.primary_offer || aeo?.inferred_primary_offer || null;
  const secondary =
    intake?.secondary_offers ||
    (aeo?.inferred_secondary_offers?.length ? aeo.inferred_secondary_offers.join(', ') : null);
  const clarity = aeo?.clarity_score;
  if (!primary) {
    return 'Primary offer is unclear from intake and AEO. Offer pages and CTAs will underperform until this is explicit.';
  }
  return [
    `Primary offer: ${primary}.`,
    secondary ? `Secondary offers: ${secondary}.` : null,
    clarity != null ? `AEO clarity score: ${clarity}/100.` : null,
  ]
    .filter(Boolean)
    .join(' ');
}

export function buildAuditVerdict(input: {
  siteOnly: SiteOnlyAnalysis | null;
  pagesCrawled: number;
  dataAvailability: DataAvailability;
  growthLeakTitle: string | null;
  architectureGapSummary: string | null;
}): GrowthBriefAuditVerdict {
  const inventory = input.siteOnly?.pageInventory ?? [];
  const present = new Set(inventory.filter((item) => item.present).map((item) => item.kind));
  const missingIcp =
    !present.has('services') && !present.has('product') && !present.has('about');
  const missingProof = !present.has('case_study') || (input.siteOnly?.proofGaps.length ?? 0) > 0;
  const thinFootprint = input.pagesCrawled > 0 && input.pagesCrawled <= 5;
  const crawlOnly = !input.dataAvailability.gscConnected || !input.dataAvailability.ga4Connected;

  const whyParts: string[] = [];
  if (thinFootprint) {
    whyParts.push(`thin page footprint (${input.pagesCrawled} pages crawled)`);
  }
  if (missingIcp || inventory.some((i) => !i.present && (i.kind === 'services' || i.kind === 'product'))) {
    whyParts.push('missing ICP / use-case pages');
  }
  if (missingProof) {
    whyParts.push('missing customer / proof pages');
  }
  if (input.siteOnly?.architectureGaps[0]) {
    whyParts.push('weak conversion routing across page types');
  }
  if (whyParts.length === 0) {
    whyParts.push('crawl and intake signals that still leave buyer trust incomplete');
  }
  if (crawlOnly) {
    whyParts.push('report based on site crawl and intake only (Search Console / GA4 not fully connected)');
  }

  const hasProductSignal =
    Boolean(input.siteOnly?.whatTheSiteSays.some((line) => /title|H1|meta/i.test(line))) ||
    present.has('home');

  const verdict = hasProductSignal
    ? 'The site explains the product, but does not yet create enough buyer-specific trust.'
    : 'The site does not yet make the offer and buyer path clear enough to create trust.';

  const mainIssue =
    thinFootprint || missingIcp || missingProof
      ? 'The homepage is doing too much alone. The site needs separate ICP, use-case, integration, and proof pages.'
      : input.architectureGapSummary ??
        input.siteOnly?.architectureGaps[0] ??
        'Key buyer moments lack dedicated pages, so trust and conversion stay thin.';

  const firstFix =
    input.siteOnly?.recommendedNextSteps[0] ??
    (missingIcp && missingProof
      ? 'Create one high-intent ICP page and one customer/proof page before changing the homepage again.'
      : missingProof
        ? 'Add a dedicated customer/proof page before another homepage rewrite.'
        : missingIcp
          ? 'Create one high-intent ICP or use-case page before changing the homepage again.'
          : input.growthLeakTitle
            ? `Address “${input.growthLeakTitle}” first.`
            : 'Fix the highest-impact architecture gap before another homepage rewrite.');

  return {
    verdict,
    mainIssue,
    firstFix,
    why: `The crawl shows ${whyParts.join(', ')}.`,
  };
}

function formatSearchConsoleSignal(
  metrics: {
    total_impressions: number;
    total_clicks: number;
    avg_ctr: number;
    avg_position: number;
  } | null,
  dataAvailability: DataAvailability,
  topQueries: string[]
) {
  if (!dataAvailability.gscConnected) {
    return 'Not connected — audit based on site crawl and intake.';
  }
  if (!dataAvailability.gscHasData) {
    return `Connected but insufficient search volume (${dataAvailability.gscImpressions} impressions in window; need ≥50). Site structure and AEO still analyzed.`;
  }
  if (!metrics) return 'Search Console metrics unavailable.';
  return `${metrics.total_impressions} impressions, ${metrics.total_clicks} clicks, avg CTR ${(metrics.avg_ctr * 100).toFixed(2)}%, avg position ${metrics.avg_position.toFixed(1)}.${topQueries.length ? ` Top opportunity queries: ${topQueries.join('; ')}.` : ''}`;
}

function formatGa4Signal(
  metrics: {
    total_sessions: number;
    total_engaged_sessions: number;
    total_conversions: number;
  } | null,
  dataAvailability: DataAvailability
) {
  if (!dataAvailability.ga4Connected) {
    return 'Not connected — audit based on site crawl and intake.';
  }
  if (!dataAvailability.ga4HasData) {
    return `Connected but insufficient session volume (${dataAvailability.ga4Sessions} sessions in window; need ≥30). Site structure and AEO still analyzed.`;
  }
  if (!metrics) return 'GA4 metrics unavailable.';
  return `${metrics.total_sessions} sessions, ${metrics.total_engaged_sessions} engaged, ${metrics.total_conversions} conversions.`;
}

type GrowthBriefInput = {
  runType: AuditRunType;
  projectName: string;
  websiteUrl: string;
  intake: ArchitectureInput | null;
  findings: ScoredFinding[];
  metrics: Pick<
    AuditMetrics,
    | 'total_clicks'
    | 'total_impressions'
    | 'avg_ctr'
    | 'avg_position'
    | 'total_sessions'
    | 'total_engaged_sessions'
    | 'total_conversions'
    | 'pages_crawled'
    | 'findings_count'
    | 'high_severity_count'
  > | null;
  queryMetrics: Array<Pick<QueryMetric, 'query' | 'impressions' | 'clicks' | 'opportunity_score'>>;
  aeoResult: AeoRunResult;
  pricing: PricingRecommendation;
  readiness?: AuditReadiness;
  dataAvailability?: DataAvailability;
  siteOnlyAnalysis?: SiteOnlyAnalysis | null;
  confidenceScore?: number;
  commercialGraph?: CommercialGraphBriefSlice | null;
};

const DEFAULT_AVAILABILITY: DataAvailability = {
  gscConnected: false,
  ga4Connected: false,
  adsConnected: false,
  gscHasData: false,
  ga4HasData: false,
  adsHasData: false,
  gscImpressions: 0,
  ga4Sessions: 0,
  adsSpend: 0,
  basedOn: ['crawl'],
};

export function buildGrowthBrief(input: GrowthBriefInput): GrowthBrief {
  const reportType: ReportType = input.runType === 'mini' ? 'teaser' : 'growth_brief';
  const aeo = input.aeoResult.analysis;
  const dataAvailability = input.dataAvailability ?? DEFAULT_AVAILABILITY;
  const readiness = input.readiness ?? 'no_data';
  const confidenceScore = input.confidenceScore ?? 40;
  const siteOnly = input.siteOnlyAnalysis ?? null;

  const priorityStack = input.findings.slice(0, 10).map(toPriorityItem);
  const executionBriefs = input.findings
    .slice(0, 5)
    .map((finding) => buildExecutionBrief(finding, input.projectName, input.websiteUrl));

  const searchFindings = input.findings.filter((f) => f.category === 'search');
  const conversionFindings = input.findings.filter((f) => f.category === 'conversion');
  const architectureFindings = input.findings.filter((f) => f.category === 'architecture');
  const onPageFindings = input.findings.filter((f) => f.category === 'on_page');

  const topQueries = input.queryMetrics
    .toSorted((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, 3)
    .map((row) => row.query);

  const growthLeakFinding =
    input.findings.find((f) => f.category === 'search' || f.category === 'conversion') ??
    onPageFindings[0] ??
    input.findings[0] ??
    null;

  const architectureGapFinding =
    architectureFindings[0] ??
    null;

  const architectureGapItem = architectureGapFinding
    ? toPriorityItem(architectureGapFinding)
    : siteOnly?.architectureGaps[0]
      ? siteGapToPriorityItem(
          'Architecture gap from site crawl',
          siteOnly.architectureGaps[0],
          'site_architecture_gap'
        )
      : siteOnly?.proofGaps[0]
        ? siteGapToPriorityItem('Proof gap from site crawl', siteOnly.proofGaps[0], 'site_proof_gap')
        : null;

  const growthLeakItem = growthLeakFinding
    ? toPriorityItem(growthLeakFinding)
    : siteOnly?.messagingClarity[0]
      ? siteGapToPriorityItem(
          'Messaging clarity gap',
          siteOnly.messagingClarity[0],
          'site_messaging_gap'
        )
      : architectureGapItem;

  const aeoInsight =
    aeo?.business_summary ||
    aeo?.risks_and_ambiguities?.[0] ||
    aeo?.missing_page_types?.[0] ||
    siteOnly?.inferred?.businessAppearance ||
    siteOnly?.inferred?.aiUnderstandingGaps?.[0] ||
    siteOnly?.architectureGaps?.[0] ||
    (input.aeoResult.status === 'skipped'
      ? 'AEO skipped (AI provider not configured). Site structure still analyzed from crawl.'
      : input.aeoResult.error_message) ||
    'Site structure and messaging were analyzed from the crawl; configure an AI provider for deeper AEO.';

  const teaserNextStep =
    siteOnly?.recommendedNextSteps[0] ??
    (reportType === 'teaser'
      ? 'Connect Search Console and GA4, then run a full audit for the scored priority stack, execution briefs, and implementation recommendation.'
      : 'Prioritize the top architecture and messaging gaps, then connect Search Console / GA4 when available.');

  const teaser: GrowthBriefTeaser | null =
    reportType === 'teaser'
      ? {
          growthLeak: growthLeakItem,
          architectureGap: architectureGapItem,
          aeoInsight,
          nextStep:
            readiness === 'no_data'
              ? `${teaserNextStep} A full audit adds the scored stack and execution path.`
              : 'Connect data sources and run a full audit for the scored priority stack, execution briefs, and implementation recommendation.',
        }
      : null;

  const pagesCrawled =
    input.metrics?.pages_crawled ??
    siteOnly?.pageInventory.reduce((sum, item) => sum + item.paths.length, 0) ??
    0;

  const auditVerdict = buildAuditVerdict({
    siteOnly,
    pagesCrawled,
    dataAvailability,
    growthLeakTitle: growthLeakItem?.title ?? null,
    architectureGapSummary: architectureGapItem?.summary ?? null,
  });

  const nextgridAction =
    input.pricing.recommended_tier === 'Implementation sprint'
      ? 'Review the full audit, then book an implementation sprint on the top execution briefs marked should-implement.'
      : reportType === 'teaser'
        ? 'Use this site audit to frame the gaps; unlock full audit access before implementation.'
        : readiness === 'no_data'
          ? 'Execute site-structure and AEO fixes first; reconnect Google data later to validate demand.'
          : 'Review priority stack with the client, then propose implementation on items marked should-implement.';

  const includeSearchSection = dataAvailability.gscConnected;
  const includeGa4Section = dataAvailability.ga4Connected;

  const basedOnLabel =
    dataAvailability.basedOn.length > 0
      ? dataAvailability.basedOn
          .map((source) => {
            switch (source) {
              case 'crawl':
                return 'site crawl';
              case 'intake':
                return 'operator intake';
              case 'search_console':
                return 'Search Console';
              case 'ga4':
                return 'GA4';
              case 'google_ads':
                return 'Google Ads';
              case 'gemini':
                return 'AI inference';
              default: {
                const _exhaustive: never = source;
                return _exhaustive;
              }
            }
          })
          .join(', ')
      : 'site crawl';

  return {
    reportType,
    headline: reportType === 'teaser' ? 'Presale Brief (site-only)' : 'Presale Brief',
    readiness,
    readinessLabel: readinessLabel(readiness),
    confidenceScore,
    dataAvailability,
    whatWeCanSee: {
      searchConsole: dataAvailability.gscConnected
        ? dataAvailability.gscHasData
          ? 'Connected · enough data'
          : 'Connected · not enough data yet'
        : 'Not connected',
      ga4: dataAvailability.ga4Connected
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
      basedOn: basedOnLabel,
    },
    auditVerdict,
    businessInterpretation: buildBusinessInterpretation(input.intake, aeo),
    icpAlignment: buildIcpAlignment(input.intake, aeo),
    offerClarity: buildOfferClarity(input.intake, aeo),
    dataSignals: {
      site: input.metrics
        ? `Crawled ${input.metrics.pages_crawled} pages; ${input.metrics.findings_count} findings (${input.metrics.high_severity_count} high/critical).`
        : 'Site crawl metrics unavailable.',
      searchConsole: formatSearchConsoleSignal(input.metrics, dataAvailability, topQueries),
      ga4: formatGa4Signal(input.metrics, dataAvailability),
    },
    siteOnlySummary: siteOnly
      ? {
          whatTheSiteSays: siteOnly.whatTheSiteSays,
          messagingClarity: siteOnly.messagingClarity,
          architectureGaps: siteOnly.architectureGaps,
          proofGaps: siteOnly.proofGaps,
          buyerMoments: siteOnly.buyerMoments,
          recommendedNextSteps: siteOnly.recommendedNextSteps,
          inferredBusinessAppearance: siteOnly.inferred?.businessAppearance ?? null,
          labels: siteOnly.labels,
          pageInventory: siteOnly.pageInventory,
          pagesCrawled: input.metrics?.pages_crawled ?? siteOnly.pageInventory.reduce((sum, item) => sum + item.paths.length, 0),
          metaIssues: siteOnly.messagingClarity.filter((line) => /meta|title|H1/i.test(line)).length,
          missingPageKinds: siteOnly.pageInventory.filter(
            (item) =>
              !item.present &&
              item.kind !== 'other' &&
              item.kind !== 'home' &&
              (item.expectedForCategory !== false)
          ).length,
          criticalFindings: input.metrics?.high_severity_count ?? 0,
          ogImageUrl: siteOnly.ogImageUrl,
        }
      : null,
    aeoUnderstanding: {
      status: input.aeoResult.status,
      draftDisclaimer: 'AI inference',
      businessSummary: aeo?.business_summary ?? null,
      clarityScore: aeo?.clarity_score ?? null,
      answerabilityScore: aeo?.answerability_score ?? null,
      ambiguities: aeo?.risks_and_ambiguities ?? [],
      missingEntities: aeo?.entity_clarity_notes ?? [],
      missingProof: aeo?.missing_proof_opportunities ?? [],
      missingPageTypes: aeo?.missing_page_types ?? [],
      faqOpportunities: aeo?.missing_faq_opportunities ?? [],
    },
    scorecard: (() => {
      const searchDemand = dataAvailability.gscHasData
        ? avg(searchFindings.map((f) => f.priority_score)) ||
          Math.min(100, (input.metrics?.total_impressions ?? 0) / 100)
        : dataAvailability.gscConnected
          ? 35
          : 20;
      const conversionHealth = dataAvailability.ga4HasData
        ? conversionFindings.length
          ? 100 - avg(conversionFindings.map((f) => f.priority_score))
          : input.metrics && input.metrics.total_sessions > 0
            ? clampPercent((input.metrics.total_conversions / input.metrics.total_sessions) * 1000)
            : 50
        : architectureFindings.length
          ? 100 - avg(architectureFindings.map((f) => f.priority_score))
          : 55;
      const architectureReadiness = architectureFindings.length
        ? 100 - avg(architectureFindings.map((f) => f.priority_score))
        : siteOnly?.architectureGaps.length
          ? Math.max(20, 80 - siteOnly.architectureGaps.length * 12)
          : 70;
      const aeoClarity = aeo?.clarity_score ?? (input.aeoResult.status === 'completed' ? 50 : 40);
      const offerClarity = clampPercent(
        (input.intake?.primary_offer ? 55 : 25) +
          (aeo?.inferred_primary_offer ? 20 : 0) +
          (siteOnly?.messagingClarity.length ? Math.max(0, 25 - siteOnly.messagingClarity.length * 5) : 15)
      );
      const buyerClarity = clampPercent(
        (input.intake?.primary_icp ? 55 : 25) +
          (aeo?.inferred_icps?.length ? 20 : 0) +
          (siteOnly?.buyerMoments.length ? 15 : 0)
      );
      const trustProof = clampPercent(
        architectureReadiness * 0.4 +
          (siteOnly?.proofGaps.length
            ? Math.max(15, 70 - siteOnly.proofGaps.length * 12)
            : 60) *
            0.4 +
          (input.intake?.trust_proof_assets ? 20 : 0)
      );
      const ctaStrength = clampPercent(
        conversionFindings.some((f) => f.type === 'no_conversion_support')
          ? 30
          : conversionHealth * 0.7 + 20
      );
      const pageArchitecture = architectureReadiness;
      const searchVisibility = searchDemand;
      const engagementQuality = dataAvailability.ga4HasData
        ? conversionHealth
        : clampPercent(50 + (input.metrics?.pages_crawled ?? 0));
      const graphCta = input.commercialGraph?.scores.ctaCoverage;
      const graphProof = input.commercialGraph?.scores.proofDensity;
      const blendedCta = graphCta != null ? Math.round((ctaStrength + graphCta) / 2) : ctaStrength;
      const blendedTrust = graphProof != null ? Math.round((trustProof + graphProof) / 2) : trustProof;
      const overallOpportunity =
        avg(input.findings.map((f) => f.priority_score)) || confidenceScore;
      const presaleReadiness = clampPercent(
        offerClarity * 0.14 +
          buyerClarity * 0.14 +
          blendedTrust * 0.14 +
          blendedCta * 0.14 +
          pageArchitecture * 0.12 +
          searchVisibility * 0.1 +
          engagementQuality * 0.1 +
          aeoClarity * 0.12
      );

      return {
        overallOpportunity: presaleReadiness || overallOpportunity,
        searchDemand: searchVisibility,
        conversionHealth: blendedCta,
        architectureReadiness: pageArchitecture,
        aeoClarity,
        offerClarity,
        buyerClarity,
        trustProof: blendedTrust,
        ctaStrength: blendedCta,
        pageArchitecture,
        searchVisibility,
        engagementQuality,
        presaleReadiness,
      };
    })(),
    includeSearchSection,
    includeGa4Section,
    priorityStack,
    executionBriefs,
    offerRecommendation: {
      tier: input.pricing.recommended_tier,
      priceRange: input.pricing.price_range,
      rationale: input.pricing.rationale,
      includedItems: input.pricing.included_items,
      nextgridAction,
    },
    teaser,
    comparison: [
      {
        feature: 'Growth leak diagnosis',
        teaser: 'Top priority fixes from crawl (works without traffic)',
        growthBrief: 'Full scored priority stack',
      },
      {
        feature: 'Architecture gaps',
        teaser: 'Missing-page and proof gaps from site snapshot',
        growthBrief: 'Full architecture + site analysis',
      },
      {
        feature: 'AEO / AI understanding',
        teaser: 'Insight when available',
        growthBrief: 'Full AEO panel + entity/FAQ/proof gaps',
      },
      {
        feature: 'Execution briefs + prompts',
        teaser: 'One agent prompt when available',
        growthBrief: 'Top findings with rewrites, links, FAQ, schema, prompts',
      },
      {
        feature: 'Implementation path',
        teaser: 'Locked until full audit',
        growthBrief: 'Should-implement flags + sprint recommendation',
      },
    ],
    commercialGraph: input.commercialGraph ?? null,
  };
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
