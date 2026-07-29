import type { AeoAnalysis } from '@/lib/aeo/schema';
import {
  buildAskAiWidget,
  type AskAiWidgetModel,
} from '@/lib/audit/ask-ai-widget';
import {
  businessModelLabel,
  categoryLabel,
  conversionGoalLabel,
  reportSectionHeadings,
  type SiteClassification,
} from '@/lib/audit/site-classification';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import type { Finding } from '@/lib/supabase/types';

export type StoryStepStatus = 'strong' | 'weak' | 'missing';

export interface StoryFlowStep {
  key: 'problem' | 'promise' | 'solution' | 'proof' | 'action';
  label: string;
  status: StoryStepStatus;
  detail: string;
}

export interface HumanVerdict {
  verdict: string;
  mainBlocker: string;
  firstFix: string;
}

export interface ScoreStripItem {
  id: string;
  label: string;
  value: string;
}

export interface FreeReportViewModel {
  classification: SiteClassification | null;
  categoryLabel: string;
  businessModelLabel: string;
  conversionGoalLabel: string;
  sectionHeadings: { clarity: string; conversion: string; trust: string };
  humanBlurb: string | null;
  humanBullets: string[];
  humanVerdict: HumanVerdict;
  aiSummary: string | null;
  aiBullets: string[];
  aiScores: { clarity: number | null; answerability: number | null };
  machineBullets: string[];
  storyFlow: StoryFlowStep[];
  presentPages: Array<{ kind: string; paths: string[] }>;
  missingPages: Array<{ kind: string }>;
  gaps: string[];
  blockers: string[];
  layeredRecs: { page: string[]; story: string[]; sitemap: string[]; aeo: string[] };
  programmatic: string[];
  priorityFindings: Finding[];
  uncertain: boolean;
  scoreStrip: ScoreStripItem[];
  askAi: AskAiWidgetModel;
}

function storyStatus(ok: boolean, partial: boolean): StoryStepStatus {
  if (ok) return 'strong';
  if (partial) return 'weak';
  return 'missing';
}

function kindLabel(kind: string): string {
  return kind.replace(/_/g, ' ');
}

function resolveFirstFix(layered: {
  page: string[];
  story: string[];
  sitemap: string[];
}): string | null {
  return layered.page[0] ?? layered.story[0] ?? layered.sitemap[0] ?? null;
}

export function buildFreeReportView(input: {
  siteOnly: SiteOnlyAnalysis | null;
  aeo: AeoAnalysis | null;
  findings: Finding[];
  domain?: string;
  title?: string | null;
}): FreeReportViewModel {
  const siteOnly = input.siteOnly;
  const classification = siteOnly?.classification ?? null;
  const category = classification?.category ?? 'unknown';
  const headings = reportSectionHeadings(category);
  const inventory = siteOnly?.pageInventory ?? [];
  const present = new Set(inventory.filter((i) => i.present).map((i) => i.kind));

  const humanBlurb =
    siteOnly?.inferred?.businessAppearance ??
    input.aeo?.business_summary ??
    siteOnly?.whatTheSiteSays?.[0] ??
    null;

  const humanBullets = [
    ...(siteOnly?.whatTheSiteSays?.slice(0, 4) ?? []),
    ...(siteOnly?.messagingClarity?.slice(0, 3) ?? []),
  ].slice(0, 6);

  const aiBullets = [
    ...(input.aeo?.inferred_icps?.map((icp) => `Likely audience: ${icp}`) ?? []),
    ...(input.aeo?.inferred_primary_offer
      ? [`Primary offer: ${input.aeo.inferred_primary_offer}`]
      : []),
    ...(input.aeo?.entity_clarity_notes?.slice(0, 3) ?? []),
    ...(siteOnly?.inferred?.aiUnderstandingGaps?.slice(0, 3) ?? []),
  ].slice(0, 8);

  const machineBullets = [
    ...(siteOnly?.messagingClarity ?? []),
    ...(siteOnly?.weakLinkHubs?.slice(0, 3) ?? []),
    `Pages crawled across ${inventory.filter((i) => i.present).length} page types.`,
  ].slice(0, 8);

  const storyFlow: StoryFlowStep[] = [
    {
      key: 'problem',
      label: 'Problem',
      status: storyStatus(
        Boolean(input.aeo?.business_summary || siteOnly?.whatTheSiteSays?.length),
        Boolean(siteOnly?.messagingClarity?.length)
      ),
      detail: 'Whether the site makes the visitor problem clear early.',
    },
    {
      key: 'promise',
      label: 'Promise',
      status: storyStatus(
        Boolean(input.aeo?.inferred_primary_offer || present.has('product') || present.has('services')),
        Boolean(siteOnly?.whatTheSiteSays?.length)
      ),
      detail: 'Whether the promise / offer is easy to understand.',
    },
    {
      key: 'solution',
      label: 'Solution',
      status: storyStatus(
        present.has('product') || present.has('services') || present.has('curriculum') || present.has('shop'),
        present.has('about')
      ),
      detail: 'Whether solution / offer pages exist.',
    },
    {
      key: 'proof',
      label: 'Proof',
      status: storyStatus(present.has('case_study'), (siteOnly?.proofGaps?.length ?? 0) === 0),
      detail: 'Whether proof / trust pages support the claim.',
    },
    {
      key: 'action',
      label: 'Action',
      status: storyStatus(
        present.has('contact') || present.has('pricing') || present.has('cart') || present.has('donate'),
        (siteOnly?.conversionBlockers?.length ?? 0) === 0
      ),
      detail: 'Whether the next action is obvious.',
    },
  ];

  const presentPages = inventory
    .filter((i) => i.present && i.kind !== 'other')
    .map((i) => ({ kind: i.kind, paths: i.paths.slice(0, 6) }));

  const missingPages = inventory
    .filter((i) => i.expectedForCategory && !i.present && i.kind !== 'other' && i.kind !== 'home')
    .map((i) => ({ kind: i.kind }));

  const layeredRecs = {
    page: (siteOnly?.recommendedNextSteps ?? []).filter((s) => /page|title|meta|H1|on-page/i.test(s)).slice(0, 3),
    story: storyFlow
      .filter((s) => s.status !== 'strong')
      .map((s) => `Strengthen ${s.label.toLowerCase()}: ${s.detail}`)
      .slice(0, 3),
    sitemap: (siteOnly?.architectureGaps ?? []).slice(0, 3),
    aeo: [
      ...(siteOnly?.inferred?.aeoImprovements ?? []),
      ...(input.aeo?.suggested_aeo_rewrites?.map((r) => r.change) ?? []),
    ].slice(0, 3),
  };

  if (layeredRecs.page.length === 0) {
    layeredRecs.page = (siteOnly?.recommendedNextSteps ?? []).slice(0, 2);
  }

  const blockers = siteOnly?.conversionBlockers ?? [];
  const gaps = siteOnly?.architectureGaps ?? [];
  const priorityFindings = input.findings.slice(0, 8);
  const clarity = input.aeo?.clarity_score ?? null;
  const answerability = input.aeo?.answerability_score ?? null;
  const pagesFound = presentPages.length;
  const confidence = classification?.categoryConfidence ?? null;

  const uncertain =
    !classification ||
    classification.category === 'hybrid' ||
    classification.category === 'unknown' ||
    classification.categoryConfidence < 50;

  const catLabel = classification ? categoryLabel(classification.category) : 'Unclear';
  const goalLabel = classification
    ? conversionGoalLabel(classification.conversionGoal)
    : 'Unclear conversion';

  const weakStory = storyFlow.find((s) => s.status !== 'strong');
  const topFinding = priorityFindings[0];
  const mainBlocker =
    blockers[0] ??
    (missingPages[0] ? `Missing ${kindLabel(missingPages[0].kind)} page` : null) ??
    (weakStory ? `${weakStory.label} step is ${weakStory.status}` : null) ??
    topFinding?.title ??
    'No critical blockers flagged yet';

  const firstFix =
    resolveFirstFix(layeredRecs) ??
    topFinding?.title ??
    (missingPages[0] ? `Add a clear ${kindLabel(missingPages[0].kind)} page` : null) ??
    (weakStory ? `Strengthen the ${weakStory.label.toLowerCase()} step` : 'Re-run after the next content pass');

  const humanVerdict: HumanVerdict = {
    verdict: uncertain
      ? `This looks like a ${catLabel.toLowerCase()} site aimed at ${goalLabel.toLowerCase()}, but classification is still uncertain — treat the structure and messaging gaps below as the working brief.`
      : `As a ${catLabel.toLowerCase()} site oriented toward ${goalLabel.toLowerCase()}, the biggest human-facing risk right now is: ${mainBlocker}.`,
    mainBlocker,
    firstFix,
  };

  const highPlus = input.findings.filter(
    (f) => f.severity === 'critical' || f.severity === 'high'
  ).length;

  const scoreStrip: ScoreStripItem[] = [
    {
      id: 'confidence',
      label: 'Confidence',
      value: confidence != null ? `${Math.round(confidence)}%` : '—',
    },
    {
      id: 'clarity',
      label: 'Clarity',
      value: clarity != null ? String(Math.round(clarity)) : '—',
    },
    {
      id: 'answerability',
      label: 'Answerability',
      value: answerability != null ? String(Math.round(answerability)) : '—',
    },
    {
      id: 'pages',
      label: 'Pages',
      value: String(pagesFound),
    },
    {
      id: 'blockers',
      label: 'Blockers',
      value: String(blockers.length),
    },
    {
      id: 'findings',
      label: 'Findings',
      value: highPlus > 0 ? `${input.findings.length} (${highPlus} high+)` : String(input.findings.length),
    },
  ];

  const askAi = buildAskAiWidget({
    domain: input.domain ?? 'example.com',
    title: input.title ?? siteOnly?.homepageTitle ?? null,
    aeo: input.aeo,
    siteOnly,
    categoryLabel: catLabel,
    conversionGoalLabel: goalLabel,
  });

  return {
    classification,
    categoryLabel: catLabel,
    businessModelLabel: classification
      ? businessModelLabel(classification.businessModel)
      : 'Unclear model',
    conversionGoalLabel: goalLabel,
    sectionHeadings: headings,
    humanBlurb,
    humanBullets,
    humanVerdict,
    aiSummary: input.aeo?.business_summary ?? siteOnly?.inferred?.businessAppearance ?? null,
    aiBullets,
    aiScores: {
      clarity,
      answerability,
    },
    machineBullets,
    storyFlow,
    presentPages,
    missingPages,
    gaps,
    blockers,
    layeredRecs,
    programmatic: siteOnly?.programmaticSuggestions ?? [],
    priorityFindings,
    uncertain,
    scoreStrip,
    askAi,
  };
}
