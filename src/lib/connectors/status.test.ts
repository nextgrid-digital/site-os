import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  GOOGLE_ADS_SCOPE,
  GOOGLE_ANALYTICS_SCOPE,
  GOOGLE_SEARCH_CONSOLE_SCOPE,
} from '@/lib/google/oauth';
import { buildConnectorStatuses } from '@/lib/connectors/status';
import { CONNECTOR_REGISTRY } from '@/lib/connectors/registry';

test('registry includes phase 1–3 connectors in priority order', () => {
  assert.equal(CONNECTOR_REGISTRY[0].id, 'website');
  assert.equal(CONNECTOR_REGISTRY[1].id, 'ga4');
  assert.equal(CONNECTOR_REGISTRY[2].id, 'search_console');
  assert.equal(CONNECTOR_REGISTRY[3].id, 'google_ads');
  assert.ok(CONNECTOR_REGISTRY.some((c) => c.id === 'instagram' && c.availability === 'coming_soon'));
  assert.ok(CONNECTOR_REGISTRY.some((c) => c.id === 'tiktok' && c.phase === 3));
});

test('buildConnectorStatuses marks website connected from URL', () => {
  const statuses = buildConnectorStatuses({
    websiteUrl: 'https://example.com',
    googleConnected: false,
    googleScopes: [],
    gscSelected: false,
    gscLabel: null,
    ga4Selected: false,
    ga4Label: null,
    adsSelected: false,
    adsLabel: null,
    adsDeveloperTokenConfigured: false,
    lastAuditAt: null,
    usedInLatestAudit: { website: true },
    dataFlags: { pagesCrawled: 12 },
  });
  const website = statuses.find((s) => s.connectorId === 'website');
  assert.equal(website?.state, 'connected');
  assert.equal(website?.usedInAudit, true);
});

test('buildConnectorStatuses treats missing Ads scope as partial', () => {
  const statuses = buildConnectorStatuses({
    websiteUrl: 'https://example.com',
    googleConnected: true,
    googleScopes: [GOOGLE_SEARCH_CONSOLE_SCOPE, GOOGLE_ANALYTICS_SCOPE],
    gscSelected: true,
    gscLabel: 'sc-domain:example.com',
    ga4Selected: true,
    ga4Label: 'Example',
    adsSelected: false,
    adsLabel: null,
    adsDeveloperTokenConfigured: true,
    lastAuditAt: '2026-08-01T00:00:00.000Z',
    usedInLatestAudit: { search_console: true, ga4: true },
    dataFlags: { gscHasData: true, ga4HasData: true },
  });
  const ads = statuses.find((s) => s.connectorId === 'google_ads');
  assert.equal(ads?.state, 'partial');
  assert.match(ads?.message ?? '', /Reconnect Google|Ads/);
});

test('buildConnectorStatuses connects Ads when scope + account mapped', () => {
  const statuses = buildConnectorStatuses({
    websiteUrl: 'https://example.com',
    googleConnected: true,
    googleScopes: [
      GOOGLE_SEARCH_CONSOLE_SCOPE,
      GOOGLE_ANALYTICS_SCOPE,
      GOOGLE_ADS_SCOPE,
    ],
    gscSelected: true,
    gscLabel: 'sc-domain:example.com',
    ga4Selected: true,
    ga4Label: 'Example',
    adsSelected: true,
    adsLabel: 'Brand Ads',
    adsDeveloperTokenConfigured: true,
    lastAuditAt: '2026-08-01T00:00:00.000Z',
    usedInLatestAudit: { google_ads: true },
    dataFlags: { adsHasData: true },
  });
  const ads = statuses.find((s) => s.connectorId === 'google_ads');
  assert.equal(ads?.state, 'connected');
  assert.equal(ads?.resourceLabel, 'Brand Ads');
  assert.equal(ads?.usedInAudit, true);
});

test('phase 2/3 connectors are coming_soon', () => {
  const statuses = buildConnectorStatuses({
    websiteUrl: null,
    googleConnected: false,
    googleScopes: [],
    gscSelected: false,
    gscLabel: null,
    ga4Selected: false,
    ga4Label: null,
    adsSelected: false,
    adsLabel: null,
    adsDeveloperTokenConfigured: false,
    lastAuditAt: null,
    usedInLatestAudit: {},
  });
  for (const id of ['instagram', 'x', 'youtube', 'tiktok'] as const) {
    assert.equal(statuses.find((s) => s.connectorId === id)?.state, 'coming_soon');
  }
});
