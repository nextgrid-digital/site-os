import assert from 'node:assert/strict';
import test from 'node:test';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import { generateFindings } from '@/lib/audit/finding-generators';
import { buildCtrBenchmark, detectProofSignals, readCredibility } from '@/lib/audit/finding-credibility';

function page(over: Partial<CrawledPage>): CrawledPage {
  return {
    url: 'https://example.com/',
    path: '/',
    title: 'A sufficiently descriptive homepage title',
    metaDescription: 'A sufficiently long meta description that passes the minimum length threshold for audits ok.',
    h1: 'Home',
    ogImageUrl: null,
    faviconUrl: null,
    internalLinks: ['https://example.com/a', 'https://example.com/b', 'https://example.com/c'],
    hasFaq: true,
    hasFaqSchema: true,
    statusCode: 200,
    textExcerpt: null,
    ...over,
  };
}

test('CTR benchmark is not statistically meaningful on tiny samples', () => {
  const small = buildCtrBenchmark({ impressions: 100, clicks: 0, ctr: 0, position: 9.9 });
  assert.equal(small.statisticallyMeaningful, false);
  const large = buildCtrBenchmark({ impressions: 2000, clicks: 10, ctr: 0.005, position: 3 });
  assert.equal(large.statisticallyMeaningful, true);
});

test('CTR finding at 0% on few impressions is not high impact', () => {
  const findings = generateFindings({
    crawledPages: [page({})],
    gscQueries: [],
    gscPages: [{ page: 'https://example.com/', clicks: 0, impressions: 160, ctr: 0, position: 9.9 }],
    ga4Pages: [],
  });
  const f = findings.find((x) => x.type === 'page_ctr_gap');
  assert.ok(f);
  const c = readCredibility(f.evidence);
  assert.ok(c?.benchmark);
  assert.notEqual(c.impact, 'high');
  assert.notEqual(f.severity, 'high');
  assert.doesNotMatch(f.title, /underperform/i);
});

test('page absence alone never produces high impact', () => {
  const findings = generateFindings({ crawledPages: [page({})], gscQueries: [], gscPages: [], ga4Pages: [] });
  for (const f of findings.filter((x) => x.category === 'architecture')) {
    assert.equal(readCredibility(f.evidence)?.impact, 'unknown');
    assert.equal(f.severity, 'low');
  }
});

test('proof on the homepage is classified as present but not consolidated', () => {
  const home = page({
    textExcerpt:
      'Trusted by Acme and Globex. We helped rebuild the storefront for Initech and increased conversion by 32%. Acquired by BigCo.',
    imageAlts: ['Acme logo'],
  });
  assert.ok(detectProofSignals([home]).length >= 3);
  const findings = generateFindings({ crawledPages: [home], gscQueries: [], gscPages: [], ga4Pages: [] });
  assert.ok(findings.some((f) => f.type === 'proof_not_consolidated'));
  assert.ok(!findings.some((f) => f.type === 'missing_page_type' && f.evidence.pageType === 'proof'));
});
