import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { Ga4LandingPageRow } from '@/lib/google/ga4';
import type { GscPageRow, GscQueryRow } from '@/lib/google/search-console';
import type { FindingSeverity } from '@/lib/supabase/types';
import { expectedCtr } from '@/lib/audit/opportunity';
import {
  buildCtrBenchmark,
  GSC_WINDOW_LABEL,
  detectProofSignals,
  hasDedicatedProofPage,
  kindForImpact,
  PROOF_KIND_LABELS,
  severityForImpact,
  summarizeProofSignals,
  type FindingCredibility,
  type FindingImpact,
} from '@/lib/audit/finding-credibility';
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
  { type: 'proof', label: 'dedicated customer proof page', patterns: [/case-study/i, /customers/i, /testimonial/i, /results/i] },
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

type CredibilityInput = Omit<FindingCredibility, 'kind'>;

function draft(
  base: Omit<DraftFinding, 'severity' | 'evidence'> & { evidence: Record<string, unknown> },
  cred: CredibilityInput
): DraftFinding {
  const impact: FindingImpact = cred.impact;
  return {
    ...base,
    severity: severityForImpact(impact),
    evidence: { ...base.evidence, credibility: { ...cred, kind: kindForImpact(impact) } },
  };
}

const CTR_TEST_WINDOW = 'after 28 days or 500 additional impressions, whichever comes first';

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
  const gscByPath = new Map(input.gscPages.map((row) => [normalizePath(row.page), row]));

  const ctrImpact = (benchmark: ReturnType<typeof buildCtrBenchmark>): FindingImpact => {
    if (!benchmark.statisticallyMeaningful) return 'unknown';
    return benchmark.impressions >= 500 ? 'high' : 'medium';
  };
  const ctrBasis = (b: ReturnType<typeof buildCtrBenchmark>) =>
    b.statisticallyMeaningful
      ? `${b.impressions} impressions, ${b.clicks} clicks vs ${b.expectedClicks} expected at benchmark (z = ${b.zScore}).`
      : null;

  for (const row of input.gscQueries) {
    if (row.impressions < 100) continue;
    if (row.position <= 15 && underClicked(row.ctr, row.position)) {
      const benchmark = buildCtrBenchmark(row);
      const impact = ctrImpact(benchmark);
      findings.push(
        draft(
          {
            type: 'search_ctr_gap',
            category: 'search',
            title: `CTR below benchmark estimate for query "${row.query}"`,
            summary: `Search Console (${benchmark.dateRange}): ${row.impressions} impressions, ${row.clicks} clicks, ${(row.ctr * 100).toFixed(2)}% CTR at average position ${row.position.toFixed(1)}. Benchmark estimate: ${(benchmark.benchmarkCtr * 100).toFixed(1)}%. ${benchmark.sampleNote}`,
            page_path: normalizePath(row.page),
            evidence: { ...row, opportunityScore: scoreOpportunity(row.impressions, row.ctr, row.position) },
            buyer_moment: 'Problem-aware search',
            estimated_value: 'Possible gain in qualified clicks if the benchmark applies to this query',
          },
          {
            confidence: 'assumed',
            impact,
            impactBasis: ctrBasis(benchmark),
            observed: `Search Console query "${row.query}" → ${row.page}: ${row.impressions} impressions, ${row.clicks} clicks, ${(row.ctr * 100).toFixed(2)}% CTR, position ${row.position.toFixed(1)}.`,
            alternativeEvidence:
              'Branded queries, SERP features (ads, AI answers, maps) and position averaging across days can all depress CTR without a snippet problem.',
            outcome: 'More clicks from impressions the page already earns.',
            experiment: {
              hypothesis: `A title/meta description that matches the intent of "${row.query}" will raise CTR.`,
              successMetric: `CTR for this query above ${(benchmark.benchmarkCtr * 100).toFixed(1)}% with position unchanged (±1).`,
              measureAfter: CTR_TEST_WINDOW,
            },
            benchmark,
          }
        )
      );
    }

    if (row.impressions >= 200 && row.position > 10 && row.position <= 25) {
      findings.push(
        draft(
          {
            type: 'search_position_gap',
            category: 'search',
            title: `Ranking opportunity to evaluate for "${row.query}"`,
            summary: `Search Console (${GSC_WINDOW_LABEL}): ${row.impressions} impressions at average position ${row.position.toFixed(1)}.`,
            page_path: normalizePath(row.page),
            evidence: { ...row },
            buyer_moment: 'Comparing options',
            estimated_value: 'Possible incremental organic traffic',
          },
          {
            confidence: 'inferred',
            impact: 'medium',
            impactBasis: `${row.impressions} impressions show measurable demand for this query; intent and commercial value are not confirmed.`,
            observed: `Search Console query "${row.query}": ${row.impressions} impressions, average position ${row.position.toFixed(1)}.`,
            alternativeEvidence: 'Position is an average and may swing between pages; the query may not be commercially relevant.',
            outcome: 'Organic visits from a query that already shows demand.',
            experiment: {
              hypothesis: `Strengthening the page's coverage of "${row.query}" will move it onto page one.`,
              successMetric: 'Average position ≤ 10 for this query.',
              measureAfter: 'after 28 days',
            },
          }
        )
      );
    }
  }

  for (const row of input.gscPages) {
    const path = normalizePath(row.page);
    const page = pageByPath.get(path);
    if (row.impressions >= 150 && underClicked(row.ctr, row.position)) {
      const benchmark = buildCtrBenchmark(row);
      findings.push(
        draft(
          {
            type: 'page_ctr_gap',
            category: 'search',
            title: `CTR below benchmark estimate: ${path}`,
            summary: `Search Console (${benchmark.dateRange}): ${path} has ${row.impressions} impressions, ${row.clicks} clicks, ${(row.ctr * 100).toFixed(2)}% CTR at position ${row.position.toFixed(1)}. Benchmark estimate: ${(benchmark.benchmarkCtr * 100).toFixed(1)}%. ${benchmark.sampleNote}`,
            page_path: path,
            evidence: { ...row, title: page?.title },
            buyer_moment: 'Landing from search',
            estimated_value: 'Possible gain in clicks from existing impressions',
          },
          {
            confidence: 'assumed',
            impact: ctrImpact(benchmark),
            impactBasis: ctrBasis(benchmark),
            observed: `Search Console page ${row.page}: ${row.impressions} impressions, ${row.clicks} clicks, ${(row.ctr * 100).toFixed(2)}% CTR, position ${row.position.toFixed(1)}. Current title: ${page?.title ? `"${page.title}"` : 'not captured'}.`,
            alternativeEvidence:
              'Page-level CTR mixes every query that surfaces the page; branded queries and SERP features can lower it.',
            outcome: 'More clicks from impressions the page already earns.',
            experiment: {
              hypothesis: `Rewriting the title and meta description for ${path} will raise CTR.`,
              successMetric: `Page CTR above ${(benchmark.benchmarkCtr * 100).toFixed(1)}% with position unchanged (±1).`,
              measureAfter: CTR_TEST_WINDOW,
            },
            benchmark,
          }
        )
      );
    }
  }

  for (const page of input.crawledPages) {
    const gsc = gscByPath.get(normalizePath(page.path));
    // A snippet issue is only measurable when the page already earns impressions.
    const snippetImpact: FindingImpact = gsc && gsc.impressions >= 100 ? 'medium' : 'unknown';
    const snippetBasis =
      snippetImpact === 'medium' && gsc
        ? `Page has ${gsc.impressions} impressions at position ${gsc.position.toFixed(1)} in Search Console.`
        : null;

    if (!page.title || page.title.length < 15) {
      findings.push(
        draft(
          {
            type: 'weak_title',
            category: 'on_page',
            title: page.title ? `Short title tag on ${page.path}` : `No title tag detected on ${page.path}`,
            summary: page.title
              ? `The <title> is ${page.title.length} characters ("${page.title}"). Short titles may say little about the page.`
              : 'No <title> element was detected in the crawled HTML.',
            page_path: page.path,
            evidence: { title: page.title, length: page.title?.length ?? 0 },
            buyer_moment: 'First impression in SERP',
            estimated_value: 'Possible CTR and positioning gain',
          },
          {
            confidence: 'verified',
            impact: snippetImpact,
            impactBasis: snippetBasis,
            observed: `<title> on ${page.url}: ${page.title ? `"${page.title}" (${page.title.length} chars)` : 'not present'}.`,
            alternativeEvidence: 'Google may rewrite titles in results, so the displayed title can differ from the tag.',
            outcome: 'Clearer relevance in search results.',
            experiment: {
              hypothesis: `A specific, descriptive title on ${page.path} will raise CTR.`,
              successMetric: 'Page CTR in Search Console vs the previous 28 days.',
              measureAfter: CTR_TEST_WINDOW,
            },
          }
        )
      );
    }

    if (!page.metaDescription || page.metaDescription.length < 70) {
      findings.push(
        draft(
          {
            type: 'weak_meta_description',
            category: 'on_page',
            title: page.metaDescription
              ? `Short meta description on ${page.path}`
              : `No meta description detected on ${page.path}`,
            summary: page.metaDescription
              ? `The meta description is ${page.metaDescription.length} characters; Google may write its own snippet instead.`
              : 'No meta description was detected; Google will pull a snippet from page text.',
            page_path: page.path,
            evidence: { metaDescription: page.metaDescription, length: page.metaDescription?.length ?? 0 },
            buyer_moment: 'Evaluating relevance in SERP',
            estimated_value: 'Possible CTR gain',
          },
          {
            confidence: 'verified',
            impact: page.metaDescription ? 'low' : snippetImpact,
            impactBasis: page.metaDescription ? null : snippetBasis,
            observed: `meta[name=description] on ${page.url}: ${page.metaDescription ? `${page.metaDescription.length} chars` : 'not present'}.`,
            alternativeEvidence: 'Google frequently replaces meta descriptions, so a short one often has little effect.',
            outcome: 'A more relevant snippet in search results.',
            experiment: {
              hypothesis: `A written meta description for ${page.path} will raise CTR.`,
              successMetric: 'Page CTR in Search Console vs the previous 28 days.',
              measureAfter: CTR_TEST_WINDOW,
            },
          }
        )
      );
    }

    if (page.internalLinks.length < 3 && page.path !== '/') {
      findings.push(
        draft(
          {
            type: 'thin_internal_links',
            category: 'architecture',
            title: `Few internal links detected on ${page.path}`,
            summary: `${page.internalLinks.length} internal link(s) were found in the crawled HTML of this page.`,
            page_path: page.path,
            evidence: { internalLinkCount: page.internalLinks.length },
            buyer_moment: 'Exploring the site',
            estimated_value: 'Possible crawl-depth and navigation gain',
          },
          {
            confidence: 'verified',
            impact: 'unknown',
            impactBasis: null,
            observed: `Anchor tags to same-domain URLs on ${page.url}: ${page.internalLinks.length}.`,
            alternativeEvidence: 'Links injected by JavaScript are not visible to this crawler; navigation menus are counted only when present in the HTML.',
            outcome: 'Easier discovery of related pages for visitors and crawlers.',
            experiment: {
              hypothesis: `Adding contextual links from ${page.path} to related pages will increase pages per session.`,
              successMetric: 'GA4 engaged sessions / pages per session for this page.',
              measureAfter: 'after 28 days',
            },
          }
        )
      );
    }

    if (!page.hasFaq && !page.hasFaqSchema && (page.path === '/' || page.path.includes('pricing') || page.path.includes('service'))) {
      findings.push(
        draft(
          {
            type: 'missing_faq',
            category: 'on_page',
            title: `No FAQ section detected on ${page.path}`,
            summary: 'No FAQ section or FAQ schema was detected on this page. Whether one is useful depends on the objections buyers actually raise.',
            page_path: page.path,
            evidence: { hasFaq: page.hasFaq, hasFaqSchema: page.hasFaqSchema },
            buyer_moment: 'Objection handling',
            estimated_value: 'Possible reduction in unanswered objections',
          },
          {
            confidence: 'verified',
            impact: 'unknown',
            impactBasis: null,
            observed: `FAQ markup/headings and FAQPage schema on ${page.url}: none detected.`,
            alternativeEvidence: 'Objections may already be answered in other sections or on other pages.',
            outcome: 'Fewer unanswered buyer questions before they act.',
            experiment: {
              hypothesis: `Answering the top sales objections on ${page.path} will raise conversion rate.`,
              successMetric: 'GA4 conversion rate for this page, or sales-call objection frequency.',
              measureAfter: 'after 28 days',
            },
          }
        )
      );
    }
  }

  const crawledPaths = input.crawledPages.map((page) => page.path.toLowerCase());
  const proofSignals = detectProofSignals(input.crawledPages);
  for (const pattern of ARCHITECTURE_PAGE_PATTERNS) {
    if (!patternExpected(pattern.type, input.category)) continue;
    const exists = crawledPaths.some((path) => pattern.patterns.some((regex) => regex.test(path)));
    if (exists) continue;
    const notes = input.architectureNotes?.[pattern.type as keyof typeof input.architectureNotes] ?? null;

    if (pattern.type === 'proof' && proofSignals.length > 0 && !hasDedicatedProofPage(input.crawledPages)) {
      const { kinds, paths } = summarizeProofSignals(proofSignals);
      findings.push(
        draft(
          {
            type: 'proof_not_consolidated',
            category: 'architecture',
            title: 'Proof present but not consolidated',
            summary: `No dedicated proof page was detected, but proof was found on ${paths.slice(0, 3).join(', ')}${paths.length > 3 ? ` and ${paths.length - 3} more pages` : ''}: ${kinds.map((kind) => PROOF_KIND_LABELS[kind].toLowerCase()).join('; ')}.`,
            page_path: null,
            evidence: {
              pageType: pattern.type,
              notes,
              proofSignals: proofSignals.slice(0, 12),
            },
            buyer_moment: 'Trust validation',
            estimated_value: 'Possible easier trust validation for buyers',
          },
          {
            confidence: 'inferred',
            impact: 'unknown',
            impactBasis: null,
            observed: `Crawled ${input.crawledPages.length} page(s); no URL matched a proof-page pattern, but ${proofSignals.length} proof signal(s) were found in page content.`,
            alternativeEvidence: `Existing proof on ${paths.slice(0, 8).join(', ')}${paths.length > 8 ? ` and ${paths.length - 8} more pages` : ''}.`,
            outcome: 'Buyers could validate claims without hunting across pages.',
            experiment: {
              hypothesis: 'Grouping existing proof into one linked section or page will increase visits to the primary conversion action.',
              successMetric: 'Click-through from proof to the primary CTA, or conversion rate of visitors who see it.',
              measureAfter: 'after 28 days',
            },
          }
        )
      );
      continue;
    }

    const hasSignals = pattern.type === 'proof' ? proofSignals.length > 0 : false;
    findings.push(
      draft(
        {
          type: 'missing_page_type',
          category: 'architecture',
          title: `No ${pattern.label} detected`,
          summary:
            pattern.type === 'proof'
              ? 'No dedicated proof page and no testimonials, client names or outcome metrics were detected in the crawled pages.'
              : `No page matching a ${pattern.label} URL pattern was detected in the crawl. This does not mean the content is absent.`,
          page_path: null,
          evidence: { pageType: pattern.type, notes },
          buyer_moment: pattern.type === 'proof' ? 'Trust validation' : 'Solution evaluation',
          estimated_value: 'Possible clearer buyer journey',
        },
        {
          confidence: hasSignals ? 'inferred' : 'needs_review',
          impact: 'unknown',
          impactBasis: null,
          observed: `${input.crawledPages.length} crawled URL path(s) checked against ${pattern.patterns.length} URL patterns for a ${pattern.label}.`,
          alternativeEvidence:
            'The crawl is limited and URL-pattern based; the content may live under a different URL, on another domain, or be intentionally absent.',
          outcome: 'A clearer path for buyers evaluating the offer.',
          experiment: {
            hypothesis: `Only if buyers ask for it: adding a ${pattern.label} will raise conversion for visitors who reach it.`,
            successMetric: 'Conversion rate or primary-CTA clicks from visitors who view the new page.',
            measureAfter: 'after 28 days or 200 visits to the page, whichever comes first',
          },
        }
      )
    );
  }

  for (const row of input.ga4Pages) {
    const path = normalizePath(row.landingPage);
    const engagement = row.engagedSessions / Math.max(row.sessions, 1);
    if (row.sessions >= 50 && engagement < 0.45) {
      findings.push(
        draft(
          {
            type: 'low_engagement_landing_page',
            category: 'conversion',
            title: `Low engagement rate on ${path}`,
            summary: `GA4: ${path} had ${row.sessions} sessions with a ${(engagement * 100).toFixed(1)}% engagement rate.`,
            page_path: path,
            evidence: { ...row, engagementRate: engagement },
            buyer_moment: 'Landing from acquisition',
            estimated_value: 'Possible better conversion from existing traffic',
          },
          {
            confidence: 'verified',
            impact: row.sessions >= 200 ? 'high' : 'medium',
            impactBasis: `GA4 measured ${row.engagedSessions} engaged of ${row.sessions} sessions (${(engagement * 100).toFixed(1)}%) from ${row.sourceMedium}; the 45% comparison threshold is a heuristic.`,
            observed: `GA4 landing page ${row.landingPage} (${row.sourceMedium}): ${row.sessions} sessions, ${row.engagedSessions} engaged.`,
            alternativeEvidence: 'Low engagement is normal for some page types (e.g. contact details, quick-answer pages) and some traffic sources.',
            outcome: 'More visitors continuing toward a conversion.',
            experiment: {
              hypothesis: `Aligning ${path} content with the intent of its ${row.sourceMedium} traffic will raise engagement.`,
              successMetric: 'GA4 engagement rate above 45% for this landing page.',
              measureAfter: 'after 28 days or 200 sessions, whichever comes first',
            },
          }
        )
      );
    }

    if (row.sessions >= 30 && row.conversions === 0) {
      findings.push(
        draft(
          {
            type: 'no_conversion_support',
            category: 'conversion',
            title: `No tracked conversions on ${path}`,
            summary: `GA4 recorded ${row.sessions} sessions via ${row.sourceMedium} and 0 conversions. Confirm the conversion event is configured before treating this as a page problem.`,
            page_path: path,
            evidence: { ...row },
            buyer_moment: 'Ready to act',
            estimated_value: 'Possible recovered pipeline if tracking is correct',
          },
          {
            confidence: 'needs_review',
            impact: 'unknown',
            impactBasis: null,
            observed: `GA4 landing page ${row.landingPage} (${row.sourceMedium}): ${row.sessions} sessions, ${row.conversions} conversions.`,
            alternativeEvidence: 'Conversions may be tracked on a different event, page or system (CRM, phone, email) that GA4 does not see.',
            outcome: 'Recovered conversions, once tracking is confirmed.',
            experiment: {
              hypothesis: 'After confirming the conversion event fires, a clearer primary CTA on this page will produce conversions.',
              successMetric: 'GA4 conversions for this landing page.',
              measureAfter: 'after 28 days or 100 sessions, whichever comes first',
            },
          }
        )
      );
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
