import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  computeConfidenceScore,
  detectAuditReadiness,
  readinessLabel,
} from '@/lib/audit/audit-readiness';

test('detectAuditReadiness returns full_data when both sides meet thresholds', () => {
  const result = detectAuditReadiness({
    gscConnected: true,
    ga4Connected: true,
    gscImpressions: 500,
    ga4Sessions: 100,
    hasCrawl: true,
    hasIntake: true,
    hasGemini: true,
  });
  assert.equal(result.readiness, 'full_data');
  assert.equal(result.dataAvailability.gscHasData, true);
  assert.equal(result.dataAvailability.ga4HasData, true);
  assert.deepEqual(result.dataAvailability.basedOn, [
    'crawl',
    'intake',
    'search_console',
    'ga4',
    'gemini',
  ]);
});

test('detectAuditReadiness returns search_console_only', () => {
  const result = detectAuditReadiness({
    gscConnected: true,
    ga4Connected: true,
    gscImpressions: 80,
    ga4Sessions: 5,
    hasCrawl: true,
    hasIntake: false,
    hasGemini: false,
  });
  assert.equal(result.readiness, 'search_console_only');
  assert.equal(result.dataAvailability.gscHasData, true);
  assert.equal(result.dataAvailability.ga4HasData, false);
});

test('detectAuditReadiness returns ga4_only', () => {
  const result = detectAuditReadiness({
    gscConnected: true,
    ga4Connected: true,
    gscImpressions: 10,
    ga4Sessions: 40,
    hasCrawl: true,
    hasIntake: true,
    hasGemini: false,
  });
  assert.equal(result.readiness, 'ga4_only');
});

test('detectAuditReadiness returns no_data for connected-but-empty', () => {
  const result = detectAuditReadiness({
    gscConnected: true,
    ga4Connected: true,
    gscImpressions: 0,
    ga4Sessions: 0,
    hasCrawl: true,
    hasIntake: false,
    hasGemini: false,
  });
  assert.equal(result.readiness, 'no_data');
  assert.equal(result.dataAvailability.gscHasData, false);
  assert.equal(result.dataAvailability.ga4HasData, false);
  assert.deepEqual(result.dataAvailability.basedOn, ['crawl']);
});

test('detectAuditReadiness returns no_data for site-only', () => {
  const result = detectAuditReadiness({
    gscConnected: false,
    ga4Connected: false,
    gscImpressions: 0,
    ga4Sessions: 0,
    hasCrawl: true,
    hasIntake: true,
    hasGemini: true,
  });
  assert.equal(result.readiness, 'no_data');
  assert.equal(readinessLabel(result.readiness), 'No data yet');
});

test('computeConfidenceScore rises with data and intake', () => {
  const low = computeConfidenceScore({
    readiness: 'no_data',
    pagesCrawled: 2,
    intakeFieldCount: 0,
    intakeFieldTotal: 15,
    aeoCompleted: false,
    findingsCount: 1,
  });
  const high = computeConfidenceScore({
    readiness: 'full_data',
    pagesCrawled: 12,
    intakeFieldCount: 12,
    intakeFieldTotal: 15,
    aeoCompleted: true,
    findingsCount: 8,
  });
  assert.ok(high > low);
  assert.ok(high <= 100);
  assert.ok(low >= 0);
});
