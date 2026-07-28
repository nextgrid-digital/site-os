import assert from 'node:assert/strict';
import { test } from 'node:test';
import { scoreAndSortFindings, scoreFinding } from '@/lib/audit/score-findings';
import type { DraftFinding } from '@/lib/audit/finding-generators';

const baseFinding = (overrides: Partial<DraftFinding>): DraftFinding => ({
  type: 'weak_title',
  category: 'on_page',
  severity: 'medium',
  title: 'Weak title',
  summary: 'Title is short',
  page_path: '/',
  evidence: {},
  buyer_moment: 'SERP',
  estimated_value: 'CTR',
  ...overrides,
});

test('scoreFinding returns bounded scores and priority', () => {
  const scored = scoreFinding(
    baseFinding({
      type: 'no_conversion_support',
      category: 'conversion',
      severity: 'critical',
      title: 'No conversions',
    })
  );

  for (const key of [
    'revenue_impact',
    'buyer_importance',
    'urgency',
    'execution_difficulty',
    'confidence',
    'aeo_value',
    'priority_score',
  ] as const) {
    assert.ok(scored[key] >= 0 && scored[key] <= 100);
  }
  assert.ok(scored.priority_score > 50);
});

test('scoreAndSortFindings ranks conversion above weak title', () => {
  const ranked = scoreAndSortFindings([
    baseFinding({ type: 'weak_title', category: 'on_page', severity: 'low', title: 'A weak title' }),
    baseFinding({
      type: 'no_conversion_support',
      category: 'conversion',
      severity: 'high',
      title: 'B conversion gap',
    }),
  ]);

  assert.equal(ranked[0].type, 'no_conversion_support');
  assert.ok(ranked[0].priority_score >= ranked[1].priority_score);
});
