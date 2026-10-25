import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import { extractAeoSignals, scoreAeoPage } from '@/lib/aeo/page-scanner';

const answer =
  'Site-OS audits your website and connected analytics to show which pages AI answer engines can quote, and which fixes would earn you more citations this month.';

function scan(path: string, html: string) {
  return scoreAeoPage(path, extractAeoSignals(cheerio.load(html)));
}

test('well-structured article scores high and applies article checks', () => {
  const html = `<html><head>
    <script type="application/ld+json">{"@graph":[{"@type":"Article","author":{"@type":"Person"},"datePublished":"2026-01-01","dateModified":"2026-02-01"},{"@type":"FAQPage"}]}</script>
    <meta name="author" content="Jo"></head><body><main>
    <h1>AEO guide</h1><p>${answer}</p>
    <h2>What is AEO?</h2><p>${'word '.repeat(150)}</p>
    <h2>How do I start?</h2><ul><li>a</li><li>b</li><li>c</li></ul><p>${'word '.repeat(150)}</p>
    <h2>FAQ</h2></main></body></html>`;
  const result = scan('/blog/aeo', html);
  assert.equal(result.kind, 'article');
  assert.ok(result.score >= 90, `expected high score, got ${result.score}`);
  assert.ok(result.checks.find((c) => c.id === 'freshness')?.passed);
});

test('bare page fails schema and direct answer, skips article-only checks', () => {
  const result = scan('/pricing', '<html><body><h1>Pricing</h1><p>Buy now.</p></body></html>');
  assert.equal(result.kind, 'page');
  const byId = Object.fromEntries(result.checks.map((c) => [c.id, c]));
  assert.equal(byId.structured_data.passed, false);
  assert.equal(byId.direct_answer.passed, false);
  assert.equal(byId.authorship.applicable, false);
  assert.equal(byId.entity_schema.applicable, false);
  assert.ok(result.score < 20);
});

test('faq content without FAQPage schema is flagged; invalid JSON-LD is counted', () => {
  const result = scan(
    '/faq',
    `<html><head><script type="application/ld+json">{bad json</script></head>
     <body><h2>Frequently asked questions</h2><h3>Is it free?</h3></body></html>`
  );
  const byId = Object.fromEntries(result.checks.map((c) => [c.id, c]));
  assert.equal(result.signals.jsonLdParseErrors, 1);
  assert.equal(byId.structured_data.passed, false);
  assert.equal(byId.faq_schema.applicable, true);
  assert.equal(byId.faq_schema.passed, false);
});

test('homepage requires an entity schema', () => {
  const withOrg = scan(
    '/',
    '<html><head><script type="application/ld+json">{"@type":"Organization"}</script></head><body><p>x</p></body></html>'
  );
  const without = scan('/', '<html><body><p>x</p></body></html>');
  assert.equal(withOrg.checks.find((c) => c.id === 'entity_schema')?.passed, true);
  assert.equal(without.checks.find((c) => c.id === 'entity_schema')?.passed, false);
});
