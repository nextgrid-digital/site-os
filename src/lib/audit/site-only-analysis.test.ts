import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildSiteOnlyAnalysisSync } from '@/lib/audit/site-only-analysis';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { ArchitectureInput } from '@/lib/supabase/types';

function page(overrides: Partial<CrawledPage> & { path: string }): CrawledPage {
  return {
    url: `https://example.com${overrides.path}`,
    path: overrides.path,
    title: overrides.title ?? 'A reasonably long page title here',
    metaDescription:
      overrides.metaDescription ??
      'A meta description that is long enough to pass the clarity threshold for audits.',
    h1: overrides.h1 ?? 'Heading',
    ogImageUrl: overrides.ogImageUrl ?? null,
    internalLinks: overrides.internalLinks ?? ['/', '/about'],
    hasFaq: overrides.hasFaq ?? false,
    hasFaqSchema: overrides.hasFaqSchema ?? false,
    statusCode: 200,
    textExcerpt: overrides.textExcerpt ?? 'Body text',
  };
}

test('buildSiteOnlyAnalysisSync flags missing FAQ and proof pages', () => {
  const analysis = buildSiteOnlyAnalysisSync({
    pages: [
      page({ path: '/', title: 'Home for Example Co services and consulting' }),
      page({ path: '/about', title: 'About Example Co and our team story' }),
      page({ path: '/services', title: 'Services we offer to growing teams today' }),
    ],
    intake: {
      id: '1',
      project_id: 'p1',
      icp_notes: null,
      product_notes: null,
      offer_notes: null,
      proof_notes: null,
      business_type: 'Agency',
      primary_offer: 'Website audits',
      secondary_offers: null,
      primary_icp: 'Founders',
      secondary_icps: null,
      conversion_goal: 'Book a call',
      trust_proof_assets: '3 case studies on Drive',
      site_type: 'Marketing site',
      nextgrid_notes: null,
      pricing_context: null,
      engagement_interest: null,
      created_at: '',
      updated_at: '',
    } satisfies ArchitectureInput,
  });

  assert.ok(analysis.architectureGaps.some((gap) => /faq/i.test(gap)));
  assert.ok(analysis.architectureGaps.some((gap) => /case study|proof/i.test(gap)));
  assert.ok(analysis.proofGaps.length > 0);
  assert.ok(analysis.buyerMoments.some((moment) => /Book a call/i.test(moment)));
  assert.ok(analysis.whatTheSiteSays.some((line) => /Homepage title/i.test(line)));
  assert.ok(analysis.recommendedNextSteps.length > 0);
  assert.equal(analysis.ogImageUrl, null);
});

test('buildSiteOnlyAnalysisSync surfaces homepage ogImageUrl', () => {
  const analysis = buildSiteOnlyAnalysisSync({
    pages: [
      page({
        path: '/',
        ogImageUrl: 'https://cdn.example.com/og.png',
        title: 'Home for Example Co services and consulting',
      }),
      page({ path: '/about', title: 'About Example Co and our team story' }),
    ],
    intake: null,
  });

  assert.equal(analysis.ogImageUrl, 'https://cdn.example.com/og.png');
});

test('buildSiteOnlyAnalysisSync reports messaging gaps on thin titles', () => {
  const analysis = buildSiteOnlyAnalysisSync({
    pages: [
      page({ path: '/', title: 'Hi', metaDescription: 'Short' }),
      page({ path: '/faq', title: 'FAQ', h1: null }),
    ],
    intake: null,
  });

  assert.ok(analysis.messagingClarity.some((line) => /title/i.test(line)));
  assert.ok(analysis.pageInventory.find((item) => item.kind === 'faq')?.present);
});
