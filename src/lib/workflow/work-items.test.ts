import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUnifiedWorkItems, matchFindingIdForWorkOrder } from '@/lib/workflow/work-items';
import { deriveWorkflowStages } from '@/lib/workflow/stages';
import { buildMonthlyCompare } from '@/lib/workflow/monthly-compare';
import type { Finding, GraphWorkOrder } from '@/lib/supabase/types';

test('matchFindingIdForWorkOrder matches exact and partial titles', () => {
  const findings = [
    { id: 'f1', title: 'Weak homepage CTA', page_path: '/' },
    { id: 'f2', title: 'Missing proof', page_path: '/about' },
  ];
  assert.equal(matchFindingIdForWorkOrder('Weak homepage CTA', findings), 'f1');
  assert.equal(matchFindingIdForWorkOrder('Add missing proof block', findings), 'f2');
  assert.equal(matchFindingIdForWorkOrder('Unrelated', findings), null);
});

test('buildUnifiedWorkItems prefers linked work orders over duplicate findings', () => {
  const findings = [
    {
      id: 'f1',
      audit_run_id: 'a1',
      project_id: 'p1',
      type: 'cta',
      category: 'conversion',
      severity: 'high',
      title: 'Weak CTA',
      summary: 'Buyers stall',
      page_path: '/',
      evidence: {},
      status: 'open',
      buyer_moment: null,
      estimated_value: null,
      revenue_impact: 80,
      buyer_importance: 70,
      urgency: 70,
      execution_difficulty: 40,
      confidence: 80,
      aeo_value: 40,
      priority_score: 75,
      created_at: new Date().toISOString(),
    },
  ] as Finding[];

  const workOrders = [
    {
      id: 'w1',
      project_id: 'p1',
      audit_run_id: 'a1',
      action_type: 'add_cta',
      title: 'Weak CTA',
      summary: 'Add a clear CTA',
      gap_id: null,
      opportunity_id: null,
      finding_id: 'f1',
      full_prompt: 'prompt',
      revenue_impact: 80,
      buyer_importance: 70,
      urgency: 70,
      execution_difficulty: 40,
      confidence: 80,
      aeo_value: 40,
      programmatic_potential: 20,
      priority_score: 75,
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ] as GraphWorkOrder[];

  const items = buildUnifiedWorkItems({ findings, workOrders });
  assert.equal(items.length, 1);
  assert.equal(items[0].source, 'work_order');
});

test('deriveWorkflowStages lands on setup then audit then work', () => {
  const setup = deriveWorkflowStages({
    websiteConnected: false,
    googleConnected: false,
    hasCompletedAudit: false,
    openWorkCount: 0,
    hasPreviousAudit: false,
  });
  assert.equal(setup.now.stage, 'setup');

  const audit = deriveWorkflowStages({
    websiteConnected: true,
    googleConnected: true,
    hasCompletedAudit: false,
    openWorkCount: 0,
    hasPreviousAudit: false,
  });
  assert.equal(audit.now.stage, 'audit');

  const work = deriveWorkflowStages({
    websiteConnected: true,
    googleConnected: true,
    hasCompletedAudit: true,
    openWorkCount: 3,
    hasPreviousAudit: false,
  });
  assert.equal(work.now.stage, 'work');
});

test('buildMonthlyCompare reports pending and finding deltas', () => {
  const compare = buildMonthlyCompare({
    historicalChanges: [
      {
        event_type: 'category_added',
        previous_value: null,
        current_value: 'pricing',
        first_observed_at: new Date().toISOString(),
        change_observed_at: new Date().toISOString(),
        source: 'brand_associations',
        confidence: 0.7,
        previous_audit_run_id: 'prev',
      },
    ],
    openWorkItems: [
      {
        id: '1',
        source: 'finding',
        issue: 'Weak CTA',
        whyItMatters: 'Stalls buyers',
        recommendation: 'Rewrite CTA',
        priority: 'high',
        priorityScore: 80,
        status: 'open',
        nextAction: 'Rewrite homepage CTA',
        ownerHint: 'NextGrid',
        pagePath: '/',
        findingId: '1',
      },
    ],
    currentFindingCount: 4,
    previousFindingCount: 6,
    currentOpenWorkCount: 1,
    previousOpenWorkCount: 3,
  });

  assert.ok(compare.improved.some((line) => line.title.includes('Fewer issues found')));
  assert.ok(compare.improved.some((line) => line.title.includes('New on the site')));
  assert.equal(compare.stillPending[0]?.title, 'Weak CTA');
  assert.equal(compare.stillPending[0]?.detail, 'Rewrite homepage CTA');
  assert.equal(compare.needsFollowUp.length, 1);
  assert.equal(compare.needsFollowUp[0]?.detail, 'Fix soon');
});
