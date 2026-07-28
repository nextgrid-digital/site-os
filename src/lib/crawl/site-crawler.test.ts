import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import { extractOgImageUrl, resolveMediaUrl } from '@/lib/crawl/site-crawler';

test('resolveMediaUrl absolutizes relative paths and keeps CDN hosts', () => {
  assert.equal(
    resolveMediaUrl('https://example.com/about', '/images/og.png'),
    'https://example.com/images/og.png'
  );
  assert.equal(
    resolveMediaUrl('https://example.com/', 'https://cdn.example.net/share.jpg'),
    'https://cdn.example.net/share.jpg'
  );
  assert.equal(resolveMediaUrl('https://example.com/', 'javascript:alert(1)'), null);
  assert.equal(resolveMediaUrl('https://example.com/', null), null);
});

test('extractOgImageUrl prefers og:image then twitter:image', () => {
  const withOg = cheerio.load(`
    <html><head>
      <meta property="og:image" content="/og.png" />
      <meta name="twitter:image" content="https://cdn.example.com/tw.png" />
    </head></html>
  `);
  assert.equal(extractOgImageUrl(withOg, 'https://example.com/'), 'https://example.com/og.png');

  const twitterOnly = cheerio.load(`
    <html><head>
      <meta name="twitter:image" content="https://cdn.example.com/tw.png" />
    </head></html>
  `);
  assert.equal(
    extractOgImageUrl(twitterOnly, 'https://example.com/'),
    'https://cdn.example.com/tw.png'
  );

  const empty = cheerio.load('<html><head></head></html>');
  assert.equal(extractOgImageUrl(empty, 'https://example.com/'), null);
});
