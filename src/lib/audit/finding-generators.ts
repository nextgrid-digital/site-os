import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { Ga4LandingPageRow } from '@/lib/google/ga4';
import type { GscPageRow, GscQueryRow } from '@/lib/google/search-console';
import type { FindingSeverity } from '@/lib/supabase/types';
import { expectedCtr } from '@/lib/audit/opportunity';
import { expectedPageKindsForCategory, type WebsiteCategory } from '@/lib/audit/site-classification';
import { normalizePath } from '@/lib/utils/urls';

export interface DraftFinding {
  type: string;
  category: string;
  severity: FindingSeverity;
  title: string;
  summary: string;
  page_path: string | null;
  evidence: Record<string, unknown>;
  buyer_moment: string;
  estimated_value: string;
}

const ARCHITECTURE_PAGE_PATTERNS = [
  { type: 'icp', label: 'ICP / audience page', patterns: [/icp/i, /audience/i, /who-we-serve/i, /industries/i] },
  { type: 'product', label: 'Product page', patterns: [/product/i, /platform/i, /features/i] },
  { type: 'solution', label: 'Solution page', patterns: [/solution/i, /use-case/i, /services/i] },
  { type: 'proof', label: 'Customer proof page', patterns: [/case-study/i, /customers/i, /testimonial/i, /results/i] },
  { type: 'pricing', label: 'Pricing page', patterns: [/pricing/i, /plans/i] },
];

/** Which crawl-inferred page kinds satisfy each architecture pattern for a given site category. */
const PATTERN_PAGE_KINDS: Record<string, string[]> = {
  product: ['product', 'shop'],
  solution: ['services'],
  proof: ['case_study'],
  pricing: ['pricing'],
};
const ICP_PAGE_CATEGORIES = new Set<WebsiteCategory>(['saas', 'app', 'service', 'agency']);

/** An audience/ICP page only makes sense for B2B-style offers; the rest depend on the category's expected pages. */
function patternExpected(patternType: string, category: WebsiteCategory | null | undefined) {
  if (!category || category === 'unknown' || category === 'hybrid') return true;
  if (patternType === 'icp') return ICP_PAGE_CATEGORIES.has(category);
  const expected = new Set(expectedPageKindsForCategory(category));
  return (PATTERN_PAGE_KINDS[patternType] ?? []).some((kind) => expected.has(kind));
}

/** Under-clicked relative to what this position normally earns, not a flat CTR cutoff. */
function underClicked(ctr: number, position: number) {
  const benchmark = expectedCtr(position);
  return benchmark > 0 && ctr < benchmark * 0.6;
}

function scoreOpportunity(impressions: number, ctr: number, position: number) {
  const ctrGap = Math.max(0, 0.03 - ctr);
  const positionGap = Math.max(0, position - 8);
  return impressions * 0.001 + ctrGap * 100 + positionGap * 2;
}

export function generateFindings(input: {
  crawledPages: CrawledPage[];
  gscQueries: GscQueryRow[];
  gscPages: GscPageRow[];
  ga4Pages: Ga4LandingPageRow[];
  /** Detected site category; when known, page-type gaps are limited to pages that category normally needs. */
  category?: WebsiteCategory | null;
  architectureNotes?: {
    icp?: string | null;
    product?: string | null;
    offer?: string | null;
    proof?: string | null;
  };
}): DraftFinding[] {
  const findings: DraftFinding[] = [];
  const pageByPath = new Map(input.crawledPages.map((page) => [normalizePath(page.path), page]));

  for (const row of input.gscQueries) {
    if (row.impressions < 100) continue;
    if (row.position <= 15 && underClicked(row.ctr, row.position)) {
      findings.push({
        type: 'search_ctr_gap',
        category: 'search',
        severity: row.impressions > 500 ? 'high' : 'medium',
        title: `Low CTR for query "${row.query}"`,
        summary: `The query has ${row.impressions} impressions but only ${(row.ctr * 100).toFixed(2)}% CTR at position ${row.position.toFixed(1)} (typical for that position: ~${(expectedCtr(row.position) * 100).toFixed(1)}%).`,
        page_path: normalizePath(row.page),
        evidence: { ...row, opportunityScore: scoreOpportunity(row.impressions, row.ctr, row.position) },
        buyer_moment: 'Problem-aware search',
        estimated_value: 'Improved qualified traffic and lead capture',
      });
    }

    if (row.impressions >= 200 && row.position > 10 && row.position <= 25) {
      findings.push({
        type: 'search_position_gap',
        category: 'search',
        severity: 'medium',
        title: `Ranking opportunity for "${row.query}"`,
        summary: `The query has demand (${row.impressions} impressions) but ranks at position ${row.position.toFixed(1)}.`,
        page_path: normalizePath(row.page),
        evidence: { ...row },
        buyer_moment: 'Comparing options',
        estimated_value: 'Incremental organic pipeline',
      });
    }
  }

  for (const row of input.gscPages) {
    const path = normalizePath(row.page);
    const page = pageByPath.get(path);
    if (row.impressions >= 150 && underClicked(row.ctr, row.position)) {
      findings.push({
        type: 'page_ctr_gap',
        category: 'search',
        severity: 'high',
        title: `Page underperforming in search: ${path}`,
        summary: `${path} has ${row.impressions} impressions at position ${row.position.toFixed(1)} but only ${(row.ctr * 100).toFixed(2)}% CTR (typical for that position: ~${(expectedCtr(row.position) * 100).toFixed(1)}%).`,
        page_path: path,
        evidence: { ...row, title: page?.title },
        buyer_moment: 'Landing from search',
        estimated_value: 'More clicks from existing demand',
      });
    }
  }

  for (const page of input.crawledPages) {
    if (!page.title || page.title.length < 15) {
      findings.push({
        type: 'weak_title',
        category: 'on_page',
        severity: 'medium',
        title: `Weak title tag on ${page.path}`,
        summary: page.title
          ? `Title is only ${page.title.length} chars, so it likely says too little about the page.`
          : 'Title tag is missing.',
        page_path: page.path,
        evidence: { title: page.title, length: page.title?.length ?? 0 },
        buyer_moment: 'First impression in SERP',
        estimated_value: 'Higher CTR and clearer positioning',
      });
    }

    if (!page.metaDescription || page.metaDescription.length < 70) {
      findings.push({
        type: 'weak_meta_description',
        category: 'on_page',
        // Google often rewrites snippets, so a short description matters less than a missing one.
        severity: page.metaDescription ? 'low' : 'medium',
        title: `Weak meta description on ${page.path}`,
        summary: page.metaDescription
          ? `Meta description is only ${page.metaDescription.length} chars; Google may write its own snippet instead.`
          : 'Meta description is missing, so Google will pull a snippet from page text.',
        page_path: page.path,
        evidence: { metaDescription: page.metaDescription, length: page.metaDescription?.length ?? 0 },
        buyer_moment: 'Evaluating relevance in SERP',
        estimated_value: 'Improved click-through from search',
      });
    }

    if (page.internalLinks.length < 3 && page.path !== '/') {
      findings.push({
        type: 'thin_internal_links',
        category: 'architecture',
        severity: 'low',
        title: `Thin internal linking on ${page.path}`,
        summary: `Only ${page.internalLinks.length} internal links were found on this page.`,
        page_path: page.path,
        evidence: { internalLinkCount: page.internalLinks.length },
        buyer_moment: 'Exploring the site',
        estimated_value: 'Better crawl depth and conversion paths',
      });
    }

    if (!page.hasFaq && !page.hasFaqSchema && (page.path === '/' || page.path.includes('pricing') || page.path.includes('service'))) {
      findings.push({
        type: 'missing_faq',
        category: 'on_page',
        severity: 'medium',
        title: `Missing FAQ support on ${page.path}`,
        summary: 'No FAQ section detected on a high-intent page. Answering real buyer objections on the page helps conversion; FAQ schema is optional.',
        page_path: page.path,
        evidence: { hasFaq: page.hasFaq, hasFaqSchema: page.hasFaqSchema },
        buyer_moment: 'Objection handling',
        estimated_value: 'Fewer unanswered objections before the visitor acts',
      });
    }
  }

  const crawledPaths = input.crawledPages.map((page) => page.path.toLowerCase());
  for (const pattern of ARCHITECTURE_PAGE_PATTERNS) {
    if (!patternExpected(pattern.type, input.category)) continue;
    const exists = crawledPaths.some((path) => pattern.patterns.some((regex) => regex.test(path)));
    if (!exists) {
      findings.push({
        type: 'missing_page_type',
        category: 'architecture',
        severity: pattern.type === 'proof' || pattern.type === 'pricing' ? 'high' : 'medium',
        title: `Missing ${pattern.label}`,
        summary: `No dedicated ${pattern.label.toLowerCase()} was found in the crawl.`,
        page_path: null,
        evidence: {
          pageType: pattern.type,
          notes: input.architectureNotes?.[pattern.type as keyof typeof input.architectureNotes] ?? null,
        },
        buyer_moment: pattern.type === 'proof' ? 'Trust validation' : 'Solution evaluation',
        estimated_value: 'Clearer buyer journey and conversion support',
      });
    }
  }

  for (const row of input.ga4Pages) {
    const path = normalizePath(row.landingPage);
    if (row.sessions >= 50 && row.engagedSessions / Math.max(row.sessions, 1) < 0.45) {
      findings.push({
        type: 'low_engagement_landing_page',
        category: 'conversion',
        severity: 'high',
        title: `Low engagement on ${path}`,
        summary: `${path} has ${row.sessions} sessions but weak engagement (${((row.engagedSessions / row.sessions) * 100).toFixed(1)}%).`,
        page_path: path,
        evidence: { ...row, engagementRate: row.engagedSessions / Math.max(row.sessions, 1) },
        buyer_moment: 'Landing from acquisition',
        estimated_value: 'Better conversion from paid and organic traffic',
      });
    }

    if (row.sessions >= 30 && row.conversions === 0) {
      findings.push({
        type: 'no_conversion_support',
        category: 'conversion',
        severity: 'medium',
        title: `Traffic without conversions on ${path}`,
        summary: `${path} received ${row.sessions} sessions via ${row.sourceMedium} with no tracked conversions. Confirm the conversion event is set up in GA4 before treating this as a page problem.`,
        page_path: path,
        evidence: { ...row },
        buyer_moment: 'Ready to act',
        estimated_value: 'Recovered pipeline from existing traffic',
      });
    }
  }

  const seen = new Set<string>();
  return findings.filter((finding) => {
    const key = `${finding.type}:${finding.page_path ?? 'global'}:${finding.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function generateArchitectureRecommendations(findings: DraftFinding[]) {
  return findings
    .filter((finding) => finding.category === 'architecture')
    .map((finding) => ({
      page_type: String(finding.evidence.pageType ?? finding.type),
      title: finding.title,
      rationale: finding.summary,
      priority: finding.severity === 'high' || finding.severity === 'critical' ? 'high' : 'medium',
      suggested_path:
        finding.type === 'missing_page_type'
          ? `/${String(finding.evidence.pageType ?? 'page')}`
          : finding.page_path,
    }));
}
