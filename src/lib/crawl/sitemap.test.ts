import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import {
  extractLocValues,
  fetchSitemapUrls,
  isSitemapIndex,
} from '@/lib/crawl/sitemap';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('extractLocValues reads loc entries from a urlset', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>https://example.com/</loc></url>
      <url><loc>https://example.com/about</loc></url>
      <url><loc>https://example.com/pricing</loc></url>
    </urlset>`;
  assert.deepEqual(extractLocValues(xml), [
    'https://example.com/',
    'https://example.com/about',
    'https://example.com/pricing',
  ]);
});

test('extractLocValues returns empty for malformed or empty input', () => {
  assert.deepEqual(extractLocValues(''), []);
  assert.deepEqual(extractLocValues('<urlset></urlset>'), []);
  assert.deepEqual(extractLocValues('not xml at all'), []);
});

test('isSitemapIndex detects sitemapindex documents', () => {
  assert.equal(
    isSitemapIndex('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'),
    true
  );
  assert.equal(isSitemapIndex('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), false);
});

test('fetchSitemapUrls returns same-domain page URLs from a urlset', async () => {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    assert.equal(url, 'https://example.com/sitemap.xml');
    return new Response(
      `<?xml version="1.0"?>
      <urlset>
        <url><loc>https://example.com/about</loc></url>
        <url><loc>https://other.com/away</loc></url>
        <url><loc>https://example.com/pricing/</loc></url>
      </urlset>`,
      { status: 200 }
    );
  }) as typeof fetch;

  const result = await fetchSitemapUrls('https://example.com');
  assert.deepEqual(result.urls, [
    'https://example.com/about',
    'https://example.com/pricing',
  ]);
  assert.equal(result.notes.length, 0);
});

test('fetchSitemapUrls follows sitemap index children and merges locs', async () => {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === 'https://example.com/sitemap.xml') {
      return new Response(
        `<?xml version="1.0"?>
        <sitemapindex>
          <sitemap><loc>https://example.com/sitemap-pages.xml</loc></sitemap>
          <sitemap><loc>https://example.com/sitemap-blog.xml</loc></sitemap>
        </sitemapindex>`,
        { status: 200 }
      );
    }
    if (url === 'https://example.com/sitemap-pages.xml') {
      return new Response(
        `<urlset>
          <url><loc>https://example.com/services</loc></url>
        </urlset>`,
        { status: 200 }
      );
    }
    if (url === 'https://example.com/sitemap-blog.xml') {
      return new Response(
        `<urlset>
          <url><loc>https://example.com/blog/post-1</loc></url>
        </urlset>`,
        { status: 200 }
      );
    }
    return new Response('not found', { status: 404 });
  }) as typeof fetch;

  const result = await fetchSitemapUrls('https://example.com/');
  assert.deepEqual(result.urls, [
    'https://example.com/services',
    'https://example.com/blog/post-1',
  ]);
});

test('fetchSitemapUrls soft-fails when sitemap is missing', async () => {
  globalThis.fetch = (async () => new Response('gone', { status: 404 })) as typeof fetch;

  const result = await fetchSitemapUrls('https://example.com');
  assert.deepEqual(result.urls, []);
  assert.ok(result.notes.some((n) => n.includes('No sitemap.xml found')));
});
