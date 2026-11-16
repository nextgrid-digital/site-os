import type { CrawledPage } from '@/lib/crawl/site-crawler';
import { expectedCtr } from '@/lib/audit/opportunity';
import type { FindingSeverity } from '@/lib/supabase/types';

/**
 * Credibility layer for audit findings. Every finding states what was observed,
 * how sure we are, why it might matter, and a testable next step. "High impact"
 * is only assigned when a measurable signal backs it.
 */

/** verified: seen in crawl/GSC/GA4. inferred: derived from a pattern. assumed: benchmark/heuristic. needs_review: needs owner context. */
export type FindingConfidence = 'verified' | 'inferred' | 'assumed' | 'needs_review';
export type FindingImpact = 'high' | 'medium' | 'low' | 'unknown';
/** "issue" has evidence behind it; "idea" is an opportunity to evaluate. */
export type FindingKind = 'issue' | 'idea';

export const CONFIDENCE_LABELS: Record<FindingConfidence, string> = {
  verified: 'Verified',
  inferred: 'Inferred',
  assumed: 'Assumption',
  needs_review: 'Needs review',
};

export interface CtrBenchmark {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  /** Search Console window, e.g. "last 28 days". */
  dateRange: string;
  benchmarkCtr: number;
  /** Clicks the benchmark would predict for this many impressions. */
  expectedClicks: number;
  source: string;
  method: string;
  comparable: string;
  /** One-sided z-test of observed clicks vs benchmark; true when z <= -1.64 (p < 0.05). */
  statisticallyMeaningful: boolean;
  zScore: number | null;
  sampleNote: string;
}

export interface FindingExperiment {
  hypothesis: string;
  successMetric: string;
  /** Measurement plan, e.g. "after 28 days or 500 impressions, whichever comes first". */
  measureAfter: string;
}

export interface FindingCredibility {
  kind: FindingKind;
  confidence: FindingConfidence;
  impact: FindingImpact;
  /** Evidence that justifies the impact rating; null when impact is unknown. */
  impactBasis: string | null;
  /** The exact element/metric checked. */
  observed: string;
  /** Other evidence that could explain or contradict the finding. */
  alternativeEvidence: string | null;
  /** The business or user outcome that could improve. */
  outcome: string;
  experiment: FindingExperiment;
  benchmark?: CtrBenchmark;
}

export const GSC_WINDOW_LABEL = 'last 28 days';
const BENCHMARK_SOURCE =
  'OpenAEX position-based CTR curve (industry-typical averages, not specific to this site)';
const BENCHMARK_METHOD =
  'Expected clicks = impressions × benchmark CTR for the rounded average position. A one-sided z-test checks whether observed clicks are below that expectation by more than chance.';

export function buildCtrBenchmark(row: {
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
}): CtrBenchmark {
  const benchmarkCtr = expectedCtr(row.position);
  const n = row.impressions;
  const expectedClicks = n * benchmarkCtr;
  const variance = n * benchmarkCtr * (1 - benchmarkCtr);
  const zScore = variance > 0 ? (row.clicks - expectedClicks) / Math.sqrt(variance) : null;
  const statisticallyMeaningful = zScore !== null && zScore <= -1.64;
  return {
    impressions: row.impressions,
    clicks: row.clicks,
    ctr: row.ctr,
    position: row.position,
    dateRange: GSC_WINDOW_LABEL,
    benchmarkCtr,
    expectedClicks: Math.round(expectedClicks * 10) / 10,
    source: BENCHMARK_SOURCE,
    method: BENCHMARK_METHOD,
    comparable: `Pages ranking near position ${Math.round(row.position)} (all sites, all intents; branded vs non-branded not separated).`,
    statisticallyMeaningful,
    zScore: zScore === null ? null : Math.round(zScore * 100) / 100,
    sampleNote: statisticallyMeaningful
      ? `${n} impressions is enough to distinguish this CTR from the benchmark.`
      : `${n} impressions is too few to tell this CTR apart from chance against the benchmark.`,
  };
}

/** Maps impact to stored severity: only evidenced "high" impact may be high or critical. */
export function severityForImpact(impact: FindingImpact): FindingSeverity {
  switch (impact) {
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    default:
      return 'low';
  }
}

export function kindForImpact(impact: FindingImpact): FindingKind {
  return impact === 'high' || impact === 'medium' ? 'issue' : 'idea';
}

export function readCredibility(evidence: unknown): FindingCredibility | null {
  if (!evidence || typeof evidence !== 'object') return null;
  const value = (evidence as Record<string, unknown>).credibility;
  if (!value || typeof value !== 'object') return null;
  const c = value as Partial<FindingCredibility>;
  if (!c.confidence || !c.impact || !c.observed) return null;
  return c as FindingCredibility;
}

// ---------------------------------------------------------------------------
// Proof detection
// ---------------------------------------------------------------------------

export type ProofSignalKind =
  | 'testimonial'
  | 'client_names'
  | 'logo_alt'
  | 'outcome_metric'
  | 'case_study_link'
  | 'press_or_acquisition'
  | 'named_engagement';

export interface ProofSignal {
  kind: ProofSignalKind;
  path: string;
  /** Short excerpt or link that triggered the signal. */
  detail: string;
}

export const PROOF_KIND_LABELS: Record<ProofSignalKind, string> = {
  testimonial: 'Testimonial with attribution',
  client_names: 'Client or customer names',
  logo_alt: 'Logo with alt text',
  outcome_metric: 'Outcome metric',
  case_study_link: 'Case-study link',
  press_or_acquisition: 'Acquisition, partnership or press mention',
  named_engagement: 'Named engagement with scope/result',
};

const CASE_LINK = /(case-stud|success-stor|customer-stor|\/customers?\b|\/clients?\b|\/work\b|\/portfolio|\/results?\b|testimonial)/i;
const CLIENT_NAMES = /\b(trusted by|clients? (?:include|like)|customers? (?:include|like)|worked with|our clients|selected work)\b/i;
const TESTIMONIAL = /(["“][^"”]{25,240}["”]\s*[-—–]\s*[A-Z][\w.' -]{2,40}(?:,|\s)|\btestimonials?\b|\bwhat (?:our )?(?:clients|customers) say\b)/i;
const OUTCOME =
  /(\b\d{1,4}(?:\.\d+)?\s?(?:%|x)\s?(?:increase|growth|lift|more|faster|reduction|uplift|improvement|conversion|revenue|traffic|leads)|\b(?:increased|grew|boosted|reduced|cut|saved|generated|delivered)\b[^.]{0,60}\b\d[\d,.]*\s?(?:%|x|k|m|hours?|days?|weeks?|leads|users|orders)|[$€£]\s?\d[\d,.]*\s?(?:k|m|million|revenue|saved|in)?)/i;
const PRESS = /\b(acquired by|acquisition|was acquired|featured (?:in|on)|as seen (?:in|on)|press|partner(?:ed|ship)? with|official partner)\b/i;
const ENGAGEMENT =
  /\b(?:we|helped|built|designed|launched|delivered|rebuilt|redesigned)\b[^.]{0,80}\bfor\s+[A-Z][\w&.-]+(?:\s+[A-Z][\w&.-]+){0,3}/;
const LOGO_ALT = /(logo|client|customer|partner|trusted)/i;

function snippet(text: string, match: RegExpMatchArray): string {
  const start = Math.max(0, (match.index ?? 0) - 30);
  return text.slice(start, start + 140).trim();
}

export function detectProofSignals(pages: CrawledPage[]): ProofSignal[] {
  const signals: ProofSignal[] = [];
  for (const page of pages) {
    const text = [page.h1, page.textExcerpt].filter(Boolean).join(' ');
    const add = (kind: ProofSignalKind, detail: string) => signals.push({ kind, path: page.path, detail });

    const checks: Array<[ProofSignalKind, RegExp]> = [
      ['testimonial', TESTIMONIAL],
      ['client_names', CLIENT_NAMES],
      ['outcome_metric', OUTCOME],
      ['press_or_acquisition', PRESS],
      ['named_engagement', ENGAGEMENT],
    ];
    for (const [kind, regex] of checks) {
      const match = text.match(regex);
      if (match) add(kind, snippet(text, match));
    }

    for (const alt of page.imageAlts ?? []) {
      if (LOGO_ALT.test(alt)) add('logo_alt', alt);
    }
    for (const link of page.internalLinks) {
      if (CASE_LINK.test(link)) add('case_study_link', link);
    }
  }
  return signals;
}

export function summarizeProofSignals(signals: ProofSignal[]) {
  const kinds = [...new Set(signals.map((s) => s.kind))];
  const paths = [...new Set(signals.map((s) => s.path))];
  return { kinds, paths };
}

/** A dedicated proof page exists when a crawled URL looks like one. */
export function hasDedicatedProofPage(pages: CrawledPage[]): boolean {
  return pages.some((page) => /case-stud|customers|testimonial|results|success-stor|portfolio/i.test(page.path));
}
