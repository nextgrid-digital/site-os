import assert from 'node:assert/strict';
import test from 'node:test';
import { propertyMismatchWarnings } from './property-match';

test('matching sites and sc-domain properties give no warnings', () => {
  assert.deepEqual(
    propertyMismatchWarnings({ domain: 'example.com', gscSiteUrl: 'sc-domain:example.com' }),
    []
  );
  assert.deepEqual(
    propertyMismatchWarnings({ domain: 'www.example.com', gscSiteUrl: 'https://blog.example.com/' }),
    []
  );
});

test('different Search Console site warns', () => {
  assert.equal(
    propertyMismatchWarnings({ domain: 'example.com', gscSiteUrl: 'https://other.org/' }).length,
    1
  );
});

test('GA4 names without a domain are not flagged; a different domain is', () => {
  assert.deepEqual(
    propertyMismatchWarnings({ domain: 'example.com', ga4Names: ['Main site', 'Acme'] }),
    []
  );
  assert.equal(
    propertyMismatchWarnings({ domain: 'example.com', ga4Names: ['other.org - GA4'] }).length,
    1
  );
});

test('no domain means no warnings', () => {
  assert.deepEqual(propertyMismatchWarnings({ domain: null, gscSiteUrl: 'https://x.com' }), []);
});
