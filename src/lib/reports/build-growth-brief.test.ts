import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildGrowthBrief } from '@/lib/reports/build-growth-brief';
import type { ScoredFinding } from '@/lib/audit/score-findings';
import { buildSiteOnlyAnalysisSync } from '@/lib/audit/site-only-analysis';
import type { CrawledPage } from '@/lib/crawl/site-crawler';

function scored(overrides: Partial<ScoredFinding>): ScoredFinding {
  return {
    type: 'search_ctr_gap',
    category: 'search',
    severity: 'high',
    title: 'Leak',
    summary: 'Demand without clicks',
    page_path: '/',
    evidence: {},
    buyer_moment: 'Search',
    estimated_value: 'Traffic',
    revenue_impact: 80,
    buyer_importance: 70,
    urgency: 75,
    execution_difficulty: 40,
    confidence: 80,
    aeo_value: 60,
    priority_score: 78,
    ...overrides,
  };
}

function page(path: string, title: string): CrawledPage {
  return {
    url: `https://acme.test${path}`,
    path,
    title,
    metaDescription: 'A meta description that is long enough to pass thresholds in site analysis.',
    h1: title,
    ogImageUrl: null,
    internalLinks: ['/'],
    hasFaq: false,
    hasFaqSchema: false,
    statusCode: 200,
    textExcerpt: 'Body',
  };
}

test('buildGrowthBrief teaser mode exposes one leak gap aeo and next step', () => {
  const brief = buildGrowthBrief({
    runType: 'mini',
    projectName: 'Acme',
    websiteUrl: 'https://acme.test',
    intake: null,
    findings: [
      scored({}),
      scored({
        type: 'missing_page_type',
        category: 'architecture',
        title: 'Missing proof',
        priority_score: 70,
      }),
    ],
    metrics: {
      total_clicks: 10,
      total_impressions: 1000,
      avg_ctr: 0.01,
      avg_position: 12,
      total_sessions: 50,
      total_engaged_sessions: 20,
      total_conversions: 0,
      pages_crawled: 5,
      findings_count: 2,
      high_severity_count: 1,
    },
    queryMetrics: [],
    aeoResult: {
      status: 'skipped',
      model: null,
      error_message: 'AI provider is not configured.',
      analysis: null,
    },
    pricing: {
      recommended_tier: 'Site audit',
      price_range: '$0',
      rationale: 'Site audit',
      included_items: [],
    },
    readiness: 'full_data',
    dataAvailability: {
      gscConnected: true,
      ga4Connected: true,
      gscHasData: true,
      ga4HasData: true,
      gscImpressions: 1000,
      ga4Sessions: 50,
      basedOn: ['crawl', 'search_console', 'ga4'],
    },
    confidenceScore: 80,
  });

  assert.equal(brief.reportType, 'teaser');
  assert.ok(brief.teaser);
  assert.equal(brief.teaser?.growthLeak?.title, 'Leak');
  assert.equal(brief.teaser?.architectureGap?.title, 'Missing proof');
  assert.match(brief.teaser?.aeoInsight ?? '', /AEO skipped|AI provider|Site structure/i);
  assert.match(brief.teaser?.nextStep ?? '', /full audit/i);
  assert.equal(brief.includeSearchSection, true);
  assert.equal(brief.includeGa4Section, true);
});

test('buildGrowthBrief no_data teaser works without traffic and avoids zero metrics copy', () => {
  const siteOnly = buildSiteOnlyAnalysisSync({
    pages: [
      page('/', 'Acme homepage for product marketing teams'),
      page('/about', 'About Acme and how we work with clients'),
    ],
    intake: null,
  });

  const brief = buildGrowthBrief({
    runType: 'mini',
    projectName: 'Acme',
    websiteUrl: 'https://acme.test',
    intake: null,
    findings: [
      scored({
        type: 'weak_title',
        category: 'on_page',
        title: 'Weak title on /pricing',
        summary: 'Title too short',
        priority_score: 55,
      }),
    ],
    metrics: {
      total_clicks: 0,
      total_impressions: 0,
      avg_ctr: 0,
      avg_position: 0,
      total_sessions: 0,
      total_engaged_sessions: 0,
      total_conversions: 0,
      pages_crawled: 2,
      findings_count: 1,
      high_severity_count: 0,
    },
    queryMetrics: [],
    aeoResult: {
      status: 'skipped',
      model: null,
      error_message: 'AI provider is not configured.',
      analysis: null,
    },
    pricing: {
      recommended_tier: 'Site audit',
      price_range: '$0',
      rationale: 'Site audit',
      included_items: [],
    },
    readiness: 'no_data',
    dataAvailability: {
      gscConnected: false,
      ga4Connected: false,
      gscHasData: false,
      ga4HasData: false,
      gscImpressions: 0,
      ga4Sessions: 0,
      basedOn: ['crawl'],
    },
    siteOnlyAnalysis: siteOnly,
    confidenceScore: 35,
  });

  assert.equal(brief.readiness, 'no_data');
  assert.equal(brief.includeSearchSection, false);
  assert.equal(brief.includeGa4Section, false);
  assert.match(brief.dataSignals.searchConsole, /Not connected/i);
  assert.match(brief.dataSignals.ga4, /Not connected/i);
  assert.doesNotMatch(brief.dataSignals.searchConsole, /^0 impressions/);
  assert.ok(brief.teaser?.growthLeak);
  assert.ok(brief.teaser?.architectureGap || brief.siteOnlySummary?.architectureGaps.length);
  assert.ok(brief.teaser?.aeoInsight);
  assert.ok(brief.teaser?.nextStep);
  assert.ok(brief.siteOnlySummary);
  assert.equal(brief.siteOnlySummary?.ogImageUrl, null);
  assert.match(brief.whatWeCanSee.basedOn, /crawl/i);
  assert.ok(brief.auditVerdict.verdict);
  assert.match(brief.auditVerdict.why, /crawl|proof|ICP|page|Search Console|GA4/i);
  assert.match(brief.auditVerdict.why, /site crawl and intake only/i);
  assert.doesNotMatch(brief.teaser?.nextStep ?? '', /\$700/);
});

test('buildGrowthBrief includes GSC/GA4 sections when connected even below volume thresholds', () => {
  const brief = buildGrowthBrief({
    runType: 'mini',
    projectName: 'Acme',
    websiteUrl: 'https://acme.test',
    intake: null,
    findings: [],
    metrics: {
      total_clicks: 0,
      total_impressions: 12,
      avg_ctr: 0,
      avg_position: 0,
      total_sessions: 8,
      total_engaged_sessions: 2,
      total_conversions: 0,
      pages_crawled: 3,
      findings_count: 0,
      high_severity_count: 0,
    },
    queryMetrics: [],
    aeoResult: {
      status: 'skipped',
      model: null,
      error_message: null,
      analysis: null,
    },
    pricing: {
      recommended_tier: 'Site audit',
      price_range: '$0',
      rationale: 'Site audit',
      included_items: [],
    },
    readiness: 'no_data',
    dataAvailability: {
      gscConnected: true,
      ga4Connected: true,
      gscHasData: false,
      ga4HasData: false,
      gscImpressions: 12,
      ga4Sessions: 8,
      basedOn: ['crawl'],
    },
    confidenceScore: 40,
  });

  assert.equal(brief.includeSearchSection, true);
  assert.equal(brief.includeGa4Section, true);
  assert.match(brief.dataSignals.searchConsole, /insufficient|Connected/i);
  assert.match(brief.dataSignals.ga4, /insufficient|Connected/i);
  assert.equal(brief.scorecard.searchDemand, 35);
});

test('buildAuditVerdict highlights thin footprint and proof gaps', () => {
  const siteOnly = buildSiteOnlyAnalysisSync({
    pages: [
      page('/', 'Acme homepage for product marketing teams'),
      page('/about', 'About Acme and how we work with clients'),
    ],
    intake: null,
  });

  const brief = buildGrowthBrief({
    runType: 'mini',
    projectName: 'Acme',
    websiteUrl: 'https://acme.test',
    intake: null,
    findings: [],
    metrics: {
      total_clicks: 0,
      total_impressions: 0,
      avg_ctr: 0,
      avg_position: 0,
      total_sessions: 0,
      total_engaged_sessions: 0,
      total_conversions: 0,
      pages_crawled: 2,
      findings_count: 0,
      high_severity_count: 0,
    },
    queryMetrics: [],
    aeoResult: {
      status: 'skipped',
      model: null,
      error_message: null,
      analysis: null,
    },
    pricing: {
      recommended_tier: 'Site audit',
      price_range: '$0',
      rationale: 'Site audit',
      included_items: [],
    },
    readiness: 'no_data',
    dataAvailability: {
      gscConnected: false,
      ga4Connected: false,
      gscHasData: false,
      ga4HasData: false,
      gscImpressions: 0,
      ga4Sessions: 0,
      basedOn: ['crawl'],
    },
    siteOnlyAnalysis: siteOnly,
    confidenceScore: 35,
  });

  assert.match(brief.auditVerdict.why, /thin page footprint/i);
  assert.match(brief.auditVerdict.why, /proof|customer/i);
  assert.match(brief.auditVerdict.mainIssue, /homepage|ICP|proof/i);
});

test('buildGrowthBrief maps homepage ogImageUrl into siteOnlySummary', () => {
  const siteOnly = buildSiteOnlyAnalysisSync({
    pages: [
      {
        ...page('/', 'Acme homepage for product marketing teams'),
        ogImageUrl: 'https://cdn.acme.test/share.png',
      },
    ],
    intake: null,
  });

  const brief = buildGrowthBrief({
    runType: 'mini',
    projectName: 'Acme',
    websiteUrl: 'https://acme.test',
    intake: null,
    findings: [],
    metrics: null,
    queryMetrics: [],
    aeoResult: {
      status: 'skipped',
      model: null,
      error_message: null,
      analysis: null,
    },
    pricing: {
      recommended_tier: 'Site audit',
      price_range: '$0',
      rationale: 'Site audit',
      included_items: [],
    },
    readiness: 'no_data',
    dataAvailability: {
      gscConnected: false,
      ga4Connected: false,
      gscHasData: false,
      ga4HasData: false,
      gscImpressions: 0,
      ga4Sessions: 0,
      basedOn: ['crawl'],
    },
    siteOnlyAnalysis: siteOnly,
    confidenceScore: 35,
  });

  assert.equal(brief.siteOnlySummary?.ogImageUrl, 'https://cdn.acme.test/share.png');
});

test('buildGrowthBrief full mode includes priority stack and execution briefs', () => {
  const brief = buildGrowthBrief({
    runType: 'full',
    projectName: 'Acme',
    websiteUrl: 'https://acme.test',
    intake: null,
    findings: [scored({})],
    metrics: null,
    queryMetrics: [],
    aeoResult: {
      status: 'completed',
      model: 'gemini-3.1-flash-lite',
      error_message: null,
      analysis: {
        observed_inputs_summary: 'Inputs',
        business_summary: 'Sells software',
        inferred_icps: ['Ops leaders'],
        inferred_primary_offer: 'Platform',
        inferred_secondary_offers: [],
        clarity_score: 55,
        answerability_score: 50,
        entity_clarity_notes: [],
        missing_faq_opportunities: ['Pricing FAQ'],
        missing_proof_opportunities: [],
        missing_page_types: ['Case studies'],
        suggested_aeo_rewrites: [],
        risks_and_ambiguities: ['Vague homepage'],
        confidence_notes: 'Medium',
      },
    },
    pricing: {
      recommended_tier: 'Full audit',
      price_range: '~$700',
      rationale: 'Brief',
      included_items: ['Priority stack'],
    },
  });

  assert.equal(brief.reportType, 'growth_brief');
  assert.equal(brief.teaser, null);
  assert.equal(brief.priorityStack.length, 1);
  assert.equal(brief.executionBriefs.length, 1);
  assert.equal(brief.aeoUnderstanding.businessSummary, 'Sells software');
});
