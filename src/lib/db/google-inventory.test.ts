import assert from 'node:assert/strict';
import test from 'node:test';
import { domainFromGscSiteUrl, websiteUrlFromGscSiteUrl } from '@/lib/db/google-inventory';

test('domainFromGscSiteUrl parses sc-domain properties', () => {
  assert.equal(domainFromGscSiteUrl('sc-domain:example.com'), 'example.com');
  assert.equal(websiteUrlFromGscSiteUrl('sc-domain:example.com'), 'https://example.com');
});

test('domainFromGscSiteUrl parses URL-prefix properties', () => {
  assert.equal(domainFromGscSiteUrl('https://www.example.com/'), 'example.com');
  assert.equal(websiteUrlFromGscSiteUrl('https://www.example.com/'), 'https://www.example.com');
});
