import assert from 'node:assert/strict';
import { test } from 'node:test';
import { compareFix, type FixBaseline, type FixMetrics } from '@/lib/audit/fix-proof';

const day = 86_400_000;
const doneAt = new Date('2026-10-01T00:00:00Z');
const at = (days: number) => new Date(doneAt.getTime() + days * day);

function metrics(over: Partial<FixMetrics>): FixMetrics {
  return { clicks: 10, impressions: 1000, ctr: 0.01, position: 3, sessions: 10, conversions: 1, ...over };
}

const baseline: FixBaseline = {
  metrics: metrics({}),
  site: { clicks: 1000, sessions: 1000, conversions: 50 },
  windowDays: 28,
  capturedAt: doneAt.toISOString(),
};
const siteFlat = { clicks: 1000, sessions: 1000, conversions: 50 };

test('too early to judge before 14 days', () => {
  const proof = compareFix({ issueId: 'demand-without-clicks', baseline, after: metrics({ ctr: 0.05 }), siteAfter: siteFlat, doneAt, runCompletedAt: at(5) });
  assert.equal(proof.state, 'collecting');
});

test('CTR lift is reported as improved', () => {
  const proof = compareFix({ issueId: 'demand-without-clicks', baseline, after: metrics({ clicks: 40, ctr: 0.04 }), siteAfter: siteFlat, doneAt, runCompletedAt: at(20) });
  assert.equal(proof.state, 'improved');
  assert.match(proof.summary, /1\.0% → 4\.0%/);
});

test('a site-wide surge is not credited to the fix', () => {
  const proof = compareFix({
    issueId: 'conversions-without-search',
    baseline: { ...baseline, metrics: metrics({ clicks: 20 }) },
    after: metrics({ clicks: 40 }),
    siteAfter: { ...siteFlat, clicks: 2000 },
    doneAt,
    runCompletedAt: at(20),
  });
  assert.equal(proof.state, 'flat');
});

test('low traffic is inconclusive, missing target too', () => {
  const small = compareFix({ issueId: 'demand-without-clicks', baseline, after: metrics({ impressions: 10, ctr: 0.2 }), siteAfter: siteFlat, doneAt, runCompletedAt: at(20) });
  assert.equal(small.state, 'inconclusive');
  const gone = compareFix({ issueId: 'demand-without-clicks', baseline, after: null, siteAfter: siteFlat, doneAt, runCompletedAt: at(20) });
  assert.equal(gone.state, 'inconclusive');
});

test('a drop beyond the site trend is worse', () => {
  const proof = compareFix({ issueId: 'demand-without-clicks', baseline: { ...baseline, metrics: metrics({ ctr: 0.04, clicks: 40 }) }, after: metrics({ ctr: 0.02, clicks: 20 }), siteAfter: siteFlat, doneAt, runCompletedAt: at(20) });
  assert.equal(proof.state, 'worse');
});
