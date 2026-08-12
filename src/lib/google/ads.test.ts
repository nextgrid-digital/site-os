import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  deriveAdsLandingMismatches,
  deriveAdsWasteSignals,
  type GoogleAdsBundle,
} from '@/lib/google/ads';
import { buildFunnelAssessment } from '@/lib/audit/funnel-assessment';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { ChannelTrafficRow, PageMetric } from '@/lib/supabase/types';

function sampleBundle(): GoogleAdsBundle {
  return {
    campaigns: [
      {
        campaignId: '1',
        campaignName: 'Brand Search',
        status: 'ENABLED',
        impressions: 1000,
        clicks: 80,
        costMicros: 120_000_000,
        conversions: 0,
        ctr: 0.08,
      },
    ],
    keywords: [
      {
        keywordText: 'cheap widget',
        matchType: 'BROAD',
        campaignName: 'Brand Search',
        impressions: 400,
        clicks: 40,
        costMicros: 50_000_000,
        conversions: 0,
      },
    ],
    landingPages: [
      {
        unexpandedFinalUrl: 'https://example.com/pricing',
        impressions: 500,
        clicks: 40,
        costMicros: 60_000_000,
        conversions: 0,
      },
    ],
  };
}

test('deriveAdsWasteSignals flags high spend without conversions', () => {
  const signals = deriveAdsWasteSignals(sampleBundle());
  assert.ok(signals.some((s) => s.kind === 'campaign' && s.label === 'Brand Search'));
  assert.ok(signals.some((s) => s.kind === 'keyword' && s.label === 'cheap widget'));
});

test('deriveAdsLandingMismatches flags missing crawl pages', () => {
  const mismatches = deriveAdsLandingMismatches(sampleBundle(), [
    { path: '/', title: 'Home', h1: 'Home' },
  ]);
  assert.ok(mismatches.some((m) => m.landingPath === '/pricing'));
});

test('funnel assessment prefers Ads API waste over GA4 paid inference', () => {
  const connected: ConnectedAuditMetrics = {
    auditRunId: 'run-1',
    googleConnected: true,
    gscConnected: true,
    ga4Connected: true,
    adsConnected: true,
    gscPropertyLabel: 'sc-domain:example.com',
    ga4PropertyLabel: 'Example',
    adsAccountLabel: 'Brand Ads',
    metrics: {
      id: 'm1',
      audit_run_id: 'run-1',
      total_clicks: 100,
      total_impressions: 2000,
      avg_ctr: 0.05,
      avg_position: 8,
      total_sessions: 200,
      total_engaged_sessions: 80,
      total_conversions: 2,
      pages_crawled: 10,
      findings_count: 0,
      high_severity_count: 0,
      created_at: '',
    },
    pageMetrics: [
      {
        id: 'p1',
        audit_run_id: 'run-1',
        path: '/',
        url: 'https://example.com/',
        title: 'Home',
        meta_description: null,
        h1: 'Home',
        internal_link_count: 3,
        has_faq: false,
        has_faq_schema: false,
        gsc_clicks: 50,
        gsc_impressions: 500,
        gsc_ctr: 0.1,
        gsc_position: 5,
        ga_sessions: 200,
        ga_engaged_sessions: 80,
        ga_conversions: 2,
        flags: [],
        created_at: '',
      } satisfies PageMetric,
    ],
    queryMetrics: [],
    trafficByChannel: [
      {
        sourceMedium: 'google / cpc',
        channel: 'Paid Search',
        sessions: 50,
        engagedSessions: 10,
        conversions: 5,
      } satisfies ChannelTrafficRow,
    ],
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
    googleAds: {
      campaigns: sampleBundle().campaigns,
      keywords: sampleBundle().keywords,
      landingPages: sampleBundle().landingPages,
      wasteSignals: deriveAdsWasteSignals(sampleBundle()),
      landingMismatches: [],
      spend: 120,
      conversions: 0,
    },
  };

  const assessment = buildFunnelAssessment(connected);
  assert.ok(assessment.paidMismatches.length > 0);
  assert.ok(assessment.paidMismatches.every((p) => p.fromAdsApi));
  assert.ok(assessment.paidMismatches.some((p) => p.channel.includes('Brand Search')));
});
