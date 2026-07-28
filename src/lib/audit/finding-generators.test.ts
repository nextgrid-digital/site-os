import assert from 'node:assert/strict';
import test from 'node:test';
import { generateFindings, generateArchitectureRecommendations } from '@/lib/audit/finding-generators';
import { generatePromptForFinding } from '@/lib/audit/prompt-generator';
import { recommendPricing } from '@/lib/audit/pricing';
import { normalizePath, normalizeWebsiteUrl } from '@/lib/utils/urls';

test('normalizeWebsiteUrl strips trailing slash and adds protocol', () => {
  assert.equal(normalizeWebsiteUrl('nextgrid.digital'), 'https://nextgrid.digital');
  assert.equal(normalizeWebsiteUrl('https://nextgrid.digital/'), 'https://nextgrid.digital');
});

test('normalizePath handles absolute and relative paths', () => {
  assert.equal(normalizePath('/pricing/'), '/pricing');
  assert.equal(normalizePath('https://example.com/about'), '/about');
});

test('generateFindings detects weak title and missing architecture pages', () => {
  const findings = generateFindings({
    crawledPages: [
      {
        url: 'https://example.com',
        path: '/',
        title: 'Home',
        metaDescription: 'Short',
        h1: 'Welcome',
        ogImageUrl: null,
        internalLinks: ['https://example.com/about'],
        hasFaq: false,
        hasFaqSchema: false,
        statusCode: 200,
        textExcerpt: 'Example homepage body text for AEO excerpts.',
      },
    ],
    gscQueries: [
      {
        query: 'b2b billing software',
        page: 'https://example.com/',
        clicks: 2,
        impressions: 500,
        ctr: 0.004,
        position: 11,
      },
    ],
    gscPages: [
      {
        page: 'https://example.com/',
        clicks: 2,
        impressions: 500,
        ctr: 0.004,
        position: 11,
      },
    ],
    ga4Pages: [
      {
        landingPage: '/',
        sourceMedium: 'google / organic',
        sessions: 80,
        engagedSessions: 20,
        conversions: 0,
      },
    ],
  });

  assert.ok(findings.some((finding) => finding.type === 'weak_title'));
  assert.ok(findings.some((finding) => finding.type === 'missing_page_type'));
  assert.ok(findings.some((finding) => finding.type === 'search_ctr_gap'));
});

test('generatePromptForFinding returns universal prompt sections', () => {
  const findings = generateFindings({
    crawledPages: [
      {
        url: 'https://example.com/pricing',
        path: '/pricing',
        title: 'Pricing',
        metaDescription: 'A short description that is definitely not long enough for search snippets.',
        h1: 'Pricing',
        ogImageUrl: null,
        internalLinks: [],
        hasFaq: false,
        hasFaqSchema: false,
        statusCode: 200,
        textExcerpt: null,
      },
    ],
    gscQueries: [],
    gscPages: [],
    ga4Pages: [],
  });

  const prompt = generatePromptForFinding(findings[0], 'Example', 'https://example.com');
  assert.match(prompt.full_prompt, /## Context/);
  assert.match(prompt.full_prompt, /## Acceptance criteria/);
  assert.equal(prompt.constraints.includes('universal'), true);
});

test('recommendPricing suggests Full audit for moderate finding volume', () => {
  const findings = Array.from({ length: 6 }, (_, index) => ({
    type: 'search_ctr_gap',
    category: 'search',
    severity: index < 2 ? ('high' as const) : ('medium' as const),
    title: `Finding ${index}`,
    summary: 'Summary',
    page_path: '/',
    evidence: {},
    buyer_moment: 'Evaluation',
    estimated_value: 'Value',
  }));

  const pricing = recommendPricing(findings, 'full');
  assert.equal(pricing.recommended_tier, 'Full audit');
});

test('recommendPricing maps mini runs to Site audit', () => {
  const pricing = recommendPricing([], 'mini');
  assert.equal(pricing.recommended_tier, 'Site audit');
});

test('architecture recommendations derive from architecture findings', () => {
  const findings = generateFindings({
    crawledPages: [
      {
        url: 'https://example.com',
        path: '/',
        title: 'A strong homepage title for testing',
        metaDescription: 'A sufficiently long meta description that should pass the minimum length threshold for audits.',
        h1: 'Home',
        ogImageUrl: null,
        internalLinks: ['https://example.com/about'],
        hasFaq: true,
        hasFaqSchema: true,
        statusCode: 200,
        textExcerpt: 'About our services and customers.',
      },
    ],
    gscQueries: [],
    gscPages: [],
    ga4Pages: [],
  });

  const recommendations = generateArchitectureRecommendations(findings);
  assert.ok(recommendations.length > 0);
});
