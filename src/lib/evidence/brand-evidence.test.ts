import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildBrandEvidenceRecord } from '@/lib/evidence/build-brand-evidence-record';
import { diffBrandEvidenceRecords } from '@/lib/evidence/historical';
import {
  assertNoPrescriptiveLanguage,
  collectReportTexts,
  findPrescriptiveLanguage,
} from '@/lib/evidence/language-guard';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';

const page = (overrides: Partial<CrawledPage> = {}): CrawledPage => ({
  url: 'https://example.com/',
  path: '/',
  title: 'Example Studio',
  metaDescription: 'A design and product studio.',
  h1: 'Example',
  ogImageUrl: null,
  faviconUrl: null,
  internalLinks: [],
  hasFaq: false,
  hasFaqSchema: false,
  statusCode: 200,
  textExcerpt: 'We help startups ship products. Trusted by teams worldwide.',
  ...overrides,
});

const siteOnlyStub = (): SiteOnlyAnalysis =>
  ({
    pageInventory: [
      { kind: 'home', paths: ['/'], present: true },
      { kind: 'services', paths: ['/services'], present: true },
      { kind: 'case_study', paths: [], present: false },
    ],
    messagingClarity: [],
    architectureGaps: [],
    weakLinkHubs: [],
    buyerMoments: [],
    proofGaps: [],
    conversionBlockers: [],
    recommendedNextSteps: [],
    whatTheSiteSays: ['We are a design and product studio.'],
    programmaticSuggestions: [],
    ogImageUrl: null,
    homepageTitle: 'Example Studio',
    homepageMetaDescription: 'A design and product studio.',
    faviconUrl: null,
    classification: {
      category: 'agency',
      categoryConfidence: 70,
      categoryEvidence: ['design and product studio'],
      categoryNotes: null,
      fallbackCategory: 'unknown',
      businessModel: 'service_lead_gen',
      businessModelConfidence: 60,
      conversionGoal: 'contact',
      conversionGoalConfidence: 50,
    },
    labels: { observed: 'observed', inferred: 'inferred' },
  });

test('findPrescriptiveLanguage detects banned phrases', () => {
  assert.ok(findPrescriptiveLanguage('You should improve authority').length > 0);
  assert.equal(findPrescriptiveLanguage('Three testimonials were identified.').length, 0);
});

test('buildBrandEvidenceRecord produces first-party observations without recommendations', () => {
  const view = buildBrandEvidenceRecord({
    projectId: 'p1',
    companyName: 'Example Studio',
    domain: 'example.com',
    websiteUrl: 'https://example.com',
    crawledPages: [
      page(),
      page({
        url: 'https://example.com/services',
        path: '/services',
        title: 'Services',
        metaDescription: 'Product development services',
        textExcerpt: 'We provide product development for startups.',
      }),
    ],
    siteOnly: siteOnlyStub(),
    aeo: null,
    sitemapFound: true,
    crawlErrors: [],
  });

  assert.equal(view.schema_version, 1);
  assert.ok(view.executive.pages_analyzed >= 2);
  assert.ok(view.identity.some((f) => f.field_key === 'domain'));
  assert.ok(view.content_coverage.some((c) => c.content_type === 'homepage' && c.page_count > 0));
  assert.ok(view.buyer_coverage.length > 0);
  assert.equal(view.sampled_ai.length, 0);
  assert.equal(view.external_sources.length, 0);
  assert.match(view.methodology.absence_disclaimer, /does not prove/i);

  assertNoPrescriptiveLanguage(collectReportTexts(view));
});

test('every key observation includes a factual statement', () => {
  const view = buildBrandEvidenceRecord({
    projectId: 'p1',
    companyName: 'Example Studio',
    domain: 'example.com',
    websiteUrl: 'https://example.com',
    crawledPages: [page()],
    siteOnly: siteOnlyStub(),
    aeo: null,
    sitemapFound: false,
    crawlErrors: ['No sitemap.xml found at https://example.com/sitemap.xml'],
  });

  for (const obs of view.key_observations) {
    assert.ok(obs.statement.length > 0);
    assert.ok(obs.observed_at);
    assert.ok(obs.confidence >= 0 && obs.confidence <= 1);
  }
});

test('diffBrandEvidenceRecords emits category changes', () => {
  const first = buildBrandEvidenceRecord({
    projectId: 'p1',
    companyName: 'Example Studio',
    domain: 'example.com',
    websiteUrl: 'https://example.com',
    crawledPages: [page()],
    siteOnly: siteOnlyStub(),
    aeo: null,
    sitemapFound: true,
    crawlErrors: [],
  });
  const second = {
    ...first,
    associations: [
      ...first.associations,
      {
        topic: 'ai implementation',
        first_party_count: 2,
        third_party_count: 0,
        ai_appearance_count: 0,
        supporting_urls: ['https://example.com/'],
        first_observed_at: first.generated_at,
        last_observed_at: first.generated_at,
        confidence: 0.6,
        classification: 'primarily_first_party' as const,
      },
    ],
  };
  const changes = diffBrandEvidenceRecords(first, second, 'run-1');
  assert.ok(changes.some((c) => c.event_type === 'category_added'));
});
