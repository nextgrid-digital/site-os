import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildFunnelAssessment } from '@/lib/audit/funnel-assessment';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import type { ChannelTrafficRow, PageMetric, QueryMetric } from '@/lib/supabase/types';

function baseConnected(
  overrides: Partial<ConnectedAuditMetrics> = {}
): ConnectedAuditMetrics {
  return {
    auditRunId: 'run-1',
    googleConnected: true,
    gscConnected: true,
    ga4Connected: true,
    adsConnected: false,
    gscPropertyLabel: 'sc-domain:example.com',
    ga4PropertyLabel: 'Example',
    adsAccountLabel: null,
    metrics: null,
    pageMetrics: [],
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
    ...overrides,
  };
}

function page(partial: Partial<PageMetric> & Pick<PageMetric, 'path'>): PageMetric {
  return {
    id: partial.id ?? `p-${partial.path}`,
    audit_run_id: 'run-1',
    path: partial.path,
    url: `https://example.com${partial.path}`,
    title: null,
    meta_description: null,
    h1: null,
    internal_link_count: 0,
    has_faq: false,
    has_faq_schema: false,
    gsc_clicks: partial.gsc_clicks ?? 0,
    gsc_impressions: partial.gsc_impressions ?? 0,
    gsc_ctr: partial.gsc_ctr ?? 0,
    gsc_position: partial.gsc_position ?? 0,
    ga_sessions: partial.ga_sessions ?? 0,
    ga_engaged_sessions: partial.ga_engaged_sessions ?? 0,
    ga_conversions: partial.ga_conversions ?? 0,
    flags: [],
    created_at: '',
  };
}

function channel(
  partial: Partial<ChannelTrafficRow> & Pick<ChannelTrafficRow, 'channel' | 'sessions'>
): ChannelTrafficRow {
  return {
    sourceMedium: partial.sourceMedium ?? `${partial.channel} / none`,
    channel: partial.channel,
    sessions: partial.sessions,
    engagedSessions: partial.engagedSessions ?? Math.round(partial.sessions * 0.5),
    conversions: partial.conversions ?? 0,
  };
}

function query(
  partial: Partial<QueryMetric> & Pick<QueryMetric, 'query'>
): QueryMetric {
  return {
    id: partial.id ?? `q-${partial.query}`,
    audit_run_id: 'run-1',
    query: partial.query,
    page_path: partial.page_path ?? '/',
    clicks: partial.clicks ?? 0,
    impressions: partial.impressions ?? 0,
    ctr: partial.ctr ?? 0,
    position: partial.position ?? 10,
    opportunity_score: partial.opportunity_score ?? 0,
    created_at: '',
  };
}

test('buildFunnelAssessment returns empty state without traffic data', () => {
  const assessment = buildFunnelAssessment(null);
  assert.equal(assessment.hasData, false);
  assert.equal(assessment.hasFunnelProblem, null);
  assert.match(assessment.verdict, /not enough connected data/i);
  assert.ok(assessment.connectHint);
});

test('buildFunnelAssessment flags funnel problem when sessions have no conversions', () => {
  const assessment = buildFunnelAssessment(
    baseConnected({
      ga4Overview: {
        sessions: 120,
        engagedSessions: 40,
        bounceRate: 0.6,
        averageSessionDuration: 40,
        conversions: 0,
        totalRevenue: null,
      },
      trafficByChannel: [
        channel({ channel: 'Organic Search', sessions: 80, conversions: 0 }),
        channel({ channel: 'Direct', sessions: 40, conversions: 0 }),
      ],
      pageMetrics: [
        page({ path: '/', ga_sessions: 90, ga_engaged_sessions: 30, ga_conversions: 0 }),
        page({ path: '/pricing', ga_sessions: 30, ga_engaged_sessions: 10, ga_conversions: 0 }),
      ],
    })
  );

  assert.equal(assessment.hasData, true);
  assert.equal(assessment.hasFunnelProblem, true);
  assert.match(assessment.verdict, /yes/i);
  assert.equal(assessment.summaryCards.find((c) => c.id === 'traffic')?.value, '120');
  assert.equal(assessment.landings[0]?.leakLabel, 'looks_like_a_leak');
  assert.ok(assessment.bottlenecks.length >= 1);
  assert.ok(assessment.steps.length >= 3);
});

test('buildFunnelAssessment ranks lowest converting channel among meaningful volume', () => {
  const assessment = buildFunnelAssessment(
    baseConnected({
      ga4Overview: {
        sessions: 200,
        engagedSessions: 120,
        bounceRate: 0.3,
        averageSessionDuration: 90,
        conversions: 20,
        totalRevenue: null,
      },
      trafficByChannel: [
        channel({ channel: 'Organic Search', sessions: 100, conversions: 15 }),
        channel({ channel: 'Paid Search', sessions: 50, conversions: 0 }),
        channel({ channel: 'Direct', sessions: 50, conversions: 5 }),
      ],
      pageMetrics: [
        page({ path: '/', ga_sessions: 100, ga_engaged_sessions: 70, ga_conversions: 12 }),
      ],
    })
  );

  assert.equal(assessment.hasFunnelProblem, true);
  assert.equal(
    assessment.summaryCards.find((c) => c.id === 'weak-channel')?.value,
    'Paid Search'
  );
  assert.ok(assessment.paidMismatches.some((p) => p.channel === 'Paid Search'));
  assert.ok(
    assessment.channels.some((c) => c.channel === 'Paid Search' && c.quality === 'high_drop_off')
  );
});

test('buildFunnelAssessment handles single healthy channel without false leak panic', () => {
  const assessment = buildFunnelAssessment(
    baseConnected({
      ga4Overview: {
        sessions: 80,
        engagedSessions: 55,
        bounceRate: 0.25,
        averageSessionDuration: 120,
        conversions: 12,
        totalRevenue: null,
      },
      trafficByChannel: [
        channel({ channel: 'Organic Search', sessions: 80, conversions: 12 }),
      ],
      pageMetrics: [
        page({ path: '/', ga_sessions: 80, ga_engaged_sessions: 55, ga_conversions: 12 }),
      ],
      queryMetrics: [
        query({
          query: 'example agency',
          impressions: 200,
          clicks: 40,
          ctr: 0.2,
          page_path: '/',
        }),
      ],
    })
  );

  assert.equal(assessment.hasData, true);
  assert.equal(assessment.hasFunnelProblem, false);
  assert.match(assessment.verdict, /no major funnel problem/i);
  assert.equal(assessment.landings[0]?.leakLabel, 'ok');
});

test('buildFunnelAssessment surfaces search intent mismatches', () => {
  const assessment = buildFunnelAssessment(
    baseConnected({
      ga4Overview: {
        sessions: 40,
        engagedSessions: 20,
        bounceRate: 0.4,
        averageSessionDuration: 50,
        conversions: 2,
        totalRevenue: null,
      },
      pageMetrics: [
        page({
          path: '/services',
          ga_sessions: 20,
          ga_engaged_sessions: 10,
          ga_conversions: 1,
          gsc_impressions: 500,
          gsc_clicks: 4,
          gsc_ctr: 0.008,
        }),
      ],
      queryMetrics: [
        query({
          query: 'best payroll software',
          impressions: 800,
          clicks: 2,
          ctr: 0.0025,
          page_path: '/services',
        }),
      ],
      trafficByChannel: [channel({ channel: 'Organic Search', sessions: 40, conversions: 2 })],
    })
  );

  assert.ok(assessment.intentMismatches.length >= 1);
  assert.ok(
    assessment.intentMismatches.some((i) => /demand|click|answer/i.test(i.meaning))
  );
});
