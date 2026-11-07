import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildOpportunityVerdict, estimateMissedClicks, expectedCtr } from '@/lib/audit/opportunity';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { PageMetric } from '@/lib/supabase/types';

function page(over: Partial<PageMetric>): PageMetric {
  return {
    id: 'p',
    audit_run_id: 'r',
    path: '/a',
    url: 'https://x.com/a',
    title: null,
    meta_description: null,
    h1: null,
    internal_link_count: 0,
    has_faq: false,
    has_faq_schema: false,
    gsc_clicks: 0,
    gsc_impressions: 0,
    gsc_ctr: 0,
    gsc_position: 0,
    ga_sessions: 0,
    ga_engaged_sessions: 0,
    ga_conversions: 0,
    flags: {},
    created_at: '',
    ...over,
  } as PageMetric;
}

function connected(pages: PageMetric[], over: Partial<ConnectedAuditMetrics> = {}): ConnectedAuditMetrics {
  return {
    auditRunId: 'r',
    googleConnected: true,
    gscConnected: true,
    ga4Connected: true,
    adsConnected: false,
    gscPropertyLabel: null,
    ga4PropertyLabel: null,
    adsAccountLabel: null,
    metrics: null,
    pageMetrics: pages,
    queryMetrics: [],
    trafficByChannel: [],
    ga4Overview: null,
    ga4Daily: [],
    ga4Countries: [],
    ga4Devices: [],
    ga4Browsers: [],
    ga4Events: [],
    ga4KeyEvents: [],
    ga4ChannelGroups: [],
    ga4Campaigns: [],
    ga4SourceMedium: [],
    ga4ConversionPeak: [],
    ga4FunnelSteps: [],
    gscByCountry: [],
    gscByDevice: [],
    googleAds: null,
    ...over,
  };
}

test('expectedCtr falls with position', () => {
  assert.ok(expectedCtr(1) > expectedCtr(3));
  assert.ok(expectedCtr(3) > expectedCtr(12));
  assert.equal(expectedCtr(0), 0);
});

test('estimateMissedClicks ignores low impressions and healthy CTR', () => {
  assert.equal(estimateMissedClicks({ impressions: 20, clicks: 0, position: 3 }).missedClicks, 0);
  assert.equal(estimateMissedClicks({ impressions: 1000, clicks: 90, position: 3 }).missedClicks, 0);
  assert.ok(estimateMissedClicks({ impressions: 1000, clicks: 10, position: 3 }).missedClicks > 0);
});

test('verdict sizes the gap and converts to money with a custom value', () => {
  const data = connected([page({ gsc_impressions: 1000, gsc_clicks: 10, gsc_position: 3, ga_sessions: 100, ga_conversions: 5 })]);
  const verdict = buildOpportunityVerdict(data, { valuePerConversion: 100, currency: 'USD' });
  assert.equal(verdict.hasEstimate, true);
  // 1000 * 0.11 * 0.7 - 10 = 67 clicks; 5% conversion rate => ~3.35 conversions => ~$335.
  assert.equal(verdict.missedClicks, 67);
  assert.ok(verdict.monthlyValue !== null && Math.abs(verdict.monthlyValue - 335) < 1);
  assert.equal(verdict.valueBasis, 'custom');
});

test('verdict without conversions data reports clicks only', () => {
  const data = connected([page({ gsc_impressions: 1000, gsc_clicks: 10, gsc_position: 3 })]);
  const verdict = buildOpportunityVerdict(data, null);
  assert.equal(verdict.hasEstimate, true);
  assert.equal(verdict.monthlyValue, null);
  assert.match(verdict.headline, /clicks/);
});

test('verdict is empty without Search Console or without gaps', () => {
  assert.equal(buildOpportunityVerdict(null).hasEstimate, false);
  assert.equal(buildOpportunityVerdict(connected([], { gscConnected: false })).hasEstimate, false);
  assert.equal(buildOpportunityVerdict(connected([page({ gsc_impressions: 1000, gsc_clicks: 200, gsc_position: 3 })])).hasEstimate, false);
});
