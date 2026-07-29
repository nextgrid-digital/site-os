import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectProgrammaticOpportunities } from '@/lib/graph/programmatic';
import { classifyQueryPatterns, demandForFamily } from '@/lib/graph/query-patterns';
import type { DraftGraphEntity, DraftGraphGap } from '@/lib/graph/types';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { ArchitectureInput } from '@/lib/supabase/types';

const pages: CrawledPage[] = [
  {
    url: 'https://example.com/',
    path: '/',
    title: 'Acme Analytics',
    metaDescription: 'Analytics for teams',
    h1: 'Acme',
    ogImageUrl: null,
      faviconUrl: null,
    internalLinks: [],
    hasFaq: false,
    hasFaqSchema: false,
    statusCode: 200,
    textExcerpt: 'We help B2B teams. Book a demo.',
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

function entity(
  partial: Pick<DraftGraphEntity, 'type' | 'label' | 'status'> & Partial<DraftGraphEntity>
): DraftGraphEntity {
  return {
    localId: `${partial.type}_${partial.label}`,
    source: 'test',
    confidence: 80,
    metadata: {},
    ...partial,
  };
}

describe('query pattern classifier', () => {
  it('classifies vs and alternatives queries', () => {
    const hits = classifyQueryPatterns([
      { query: 'acme vs competitorx', impressions: 400, clicks: 20 },
      { query: 'acme alternatives', impressions: 200, clicks: 10 },
      { query: 'what is acme analytics', impressions: 100, clicks: 5 },
    ]);
    assert.ok(hits.some((h) => h.family === 'comparisons'));
    assert.ok(hits.some((h) => h.family === 'glossary'));
    const demand = demandForFamily(hits, 'comparisons');
    assert.ok(demand.impressions >= 400);
  });
});

describe('programmatic opportunity detection', () => {
  it('emits audience pattern with unique-data guards when ICP + product exist', () => {
    const entities: DraftGraphEntity[] = [
      entity({ type: 'product', label: 'Acme Analytics', status: 'found' }),
      entity({ type: 'offer', label: 'Analytics platform', status: 'found' }),
      entity({ type: 'icp', label: 'B2B SaaS growth teams', status: 'found' }),
      entity({ type: 'icp', label: 'Agencies', status: 'found' }),
      entity({ type: 'cta', label: 'Book a demo', status: 'found' }),
    ];
    const gaps: DraftGraphGap[] = [
      {
        gap: 'ICP without page',
        gapType: 'icp_without_page',
        impact: 'x',
        fix: 'y',
        confidence: 70,
        entityLocalIds: [],
        revenueImpact: 80,
        buyerImportance: 80,
        urgency: 70,
        executionDifficulty: 50,
        aeoValue: 70,
        programmaticPotential: 80,
        priorityScore: 80,
      },
    ];

    const opps = detectProgrammaticOpportunities({
      entities,
      gaps,
      projectName: 'Acme',
      websiteUrl: 'https://example.com',
      pages,
      intake,
      queries: [],
      missingPageKinds: ['faq'],
      hasIntegrationsSignal: false,
    });

    const audience = opps.find((o) => o.patternFamily === 'profiles');
    assert.ok(audience);
    assert.ok(audience!.uniqueData.doNotTemplate.length > 0);
    assert.ok(audience!.uniqueData.whatMakesUnique.length > 0);
    assert.ok(audience!.firstRecommendedPages.some((p) => /for/i.test(p)));
    assert.ok(audience!.buyerPathSummary.includes('Page System'));
    assert.ok(audience!.aeoFlags.improvesAnswerability);
  });

  it('does not invent comparison pages without competitor evidence', () => {
    const entities: DraftGraphEntity[] = [
      entity({ type: 'product', label: 'Acme Analytics', status: 'found' }),
      entity({ type: 'icp', label: 'B2B SaaS growth teams', status: 'found' }),
    ];

    const opps = detectProgrammaticOpportunities({
      entities,
      gaps: [],
      projectName: 'Acme',
      websiteUrl: 'https://example.com',
      pages,
      intake,
      queries: [],
      missingPageKinds: [],
      hasIntegrationsSignal: false,
    });

    assert.equal(
      opps.some((o) => o.patternFamily === 'comparisons'),
      false
    );
  });

  it('emits comparisons when competitor entities exist and boosts demand from vs queries', () => {
    const entities: DraftGraphEntity[] = [
      entity({ type: 'product', label: 'Acme Analytics', status: 'found' }),
      entity({ type: 'competitor', label: 'CompetitorX', status: 'found' }),
      entity({ type: 'icp', label: 'Agencies', status: 'found' }),
    ];

    const opps = detectProgrammaticOpportunities({
      entities,
      gaps: [],
      projectName: 'Acme',
      websiteUrl: 'https://example.com',
      pages,
      intake,
      queries: [{ query: 'acme vs competitorx', impressions: 900, clicks: 40, page_path: null }],
      missingPageKinds: [],
      hasIntegrationsSignal: false,
    });

    const comparison = opps.find(
      (o) => o.patternFamily === 'comparisons' && o.exampleTemplate.includes('vs')
    );
    assert.ok(comparison);
    assert.ok(comparison!.searchDemand >= 50);
    assert.ok(comparison!.thinContentRisk >= 0);
    assert.match(comparison!.uniqueData.doNotTemplate, /invent/i);
  });
});
