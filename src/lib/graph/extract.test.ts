import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { analyzeCommercialGraph } from '@/lib/graph/analyze';
import { extractCommercialGraph } from '@/lib/graph/extract';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { ArchitectureInput } from '@/lib/supabase/types';

const pages: CrawledPage[] = [
  {
    url: 'https://example.com/',
    path: '/',
    title: 'Acme Analytics — We help B2B teams',
    metaDescription: 'Trusted by operators. Book a demo today.',
    h1: 'Analytics for growth teams',
    ogImageUrl: null,
    internalLinks: ['/pricing', '/customers'],
    hasFaq: false,
    hasFaqSchema: false,
    statusCode: 200,
    textExcerpt: 'We help B2B SaaS teams. Book a demo. Trusted by operators.',
  },
  {
    url: 'https://example.com/pricing',
    path: '/pricing',
    title: 'Pricing',
    metaDescription: 'Plans for teams',
    h1: 'Pricing',
    ogImageUrl: null,
    internalLinks: ['/'],
    hasFaq: false,
    hasFaqSchema: false,
    statusCode: 200,
    textExcerpt: 'Get started with Acme.',
  },
];

const intake = {
  id: '1',
  project_id: 'p1',
  icp_notes: null,
  product_notes: 'Acme Analytics',
  offer_notes: null,
  proof_notes: null,
  business_type: 'saas',
  primary_offer: 'Analytics platform',
  secondary_offers: null,
  primary_icp: 'B2B SaaS growth teams',
  secondary_icps: 'Agencies',
  conversion_goal: 'Book demo',
  trust_proof_assets: null,
  site_type: 'marketing',
  nextgrid_notes: null,
  pricing_context: null,
  engagement_interest: null,
  created_at: '',
  updated_at: '',
} satisfies ArchitectureInput;

describe('commercial graph extract', () => {
  it('extracts pages, ICPs, offers, CTAs, and claims from crawl + intake', () => {
    const { entities } = extractCommercialGraph({
      projectName: 'Acme',
      websiteUrl: 'https://example.com',
      pages,
      intake,
      aeo: null,
      siteOnly: null,
      queries: [{ query: 'acme analytics', impressions: 1200, clicks: 40, page_path: '/' }],
      ga4Landings: [{ path: '/', sessions: 300 }],
    });

    assert.ok(entities.some((e) => e.type === 'page' && e.label === '/'));
    assert.ok(entities.some((e) => e.type === 'icp' && e.label.includes('B2B')));
    assert.ok(entities.some((e) => e.type === 'offer'));
    assert.ok(entities.some((e) => e.type === 'cta'));
    assert.ok(entities.some((e) => e.type === 'query'));
  });
});

describe('commercial graph analyze', () => {
  it('detects ICP without page gaps and scores completeness', () => {
    const artifact = analyzeCommercialGraph({
      projectName: 'Acme',
      websiteUrl: 'https://example.com',
      pages,
      intake,
      aeo: null,
      siteOnly: {
        pageInventory: [
          { kind: 'home', paths: ['/'], present: true },
          { kind: 'case_study', paths: [], present: false },
          { kind: 'faq', paths: [], present: false },
        ],
        messagingClarity: [],
        architectureGaps: [],
        weakLinkHubs: [],
        buyerMoments: ['Evaluation'],
        proofGaps: ['Missing case studies'],
        recommendedNextSteps: [],
        whatTheSiteSays: ['Acme sells analytics'],
        ogImageUrl: null,
        labels: { observed: 'observed', inferred: 'inferred' },
      },
      queries: [
        { query: 'analytics for agencies', impressions: 800, clicks: 10, page_path: null },
      ],
      ga4Landings: [{ path: '/', sessions: 200 }],
    });

    assert.ok(artifact.gaps.some((g) => g.gapType === 'icp_without_page'));
    assert.ok(artifact.scores.completenessScore >= 0);
    assert.ok(artifact.workOrders.length > 0);
    assert.ok(artifact.executiveMemo.whatTheGraphShows.includes('Coverage score'));
    assert.equal(artifact.entities.some((e) => e.label === 'Fake Competitor X'), false);
  });
});
