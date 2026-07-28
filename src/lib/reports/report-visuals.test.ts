import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildBuyerStrengthMatrix,
  buildIcpOfferRows,
  buildPageCoverageRows,
  buildPriorityTableRows,
  firstSentence,
  weakestScoreLabel,
} from '@/lib/reports/report-visuals';
import type { SiteOnlyPageInventoryItem } from '@/lib/audit/site-only-analysis';
import type { GrowthBriefPriorityItem } from '@/lib/reports/build-growth-brief';

const inventory: SiteOnlyPageInventoryItem[] = [
  { kind: 'home', paths: ['/'], present: true },
  { kind: 'about', paths: [], present: false },
  { kind: 'services', paths: [], present: false },
  { kind: 'product', paths: ['/product'], present: true },
  { kind: 'case_study', paths: [], present: false },
  { kind: 'faq', paths: [], present: false },
  { kind: 'pricing', paths: [], present: false },
  { kind: 'contact', paths: [], present: false },
  { kind: 'other', paths: [], present: false },
];

test('buildIcpOfferRows uses intake when present', () => {
  const rows = buildIcpOfferRows(
    {
      primary_offer: 'MVP clarity',
      primary_icp: 'Founders',
      secondary_icps: 'Operators',
    } as Parameters<typeof buildIcpOfferRows>[0],
    {
      icpAlignment: 'fallback icp',
      offerClarity: 'fallback offer',
      siteOnlySummary: {
        whatTheSiteSays: [],
        messagingClarity: [],
        architectureGaps: [],
        proofGaps: [],
        buyerMoments: ['Can this be trusted?'],
        recommendedNextSteps: [],
        inferredBusinessAppearance: null,
        labels: { observed: '', inferred: '' },
        pageInventory: inventory,
        pagesCrawled: 2,
        metaIssues: 1,
        missingPageKinds: 5,
        criticalFindings: 1,
        ogImageUrl: null,
      },
    }
  );
  assert.equal(rows[0][0], 'Founders');
  assert.equal(rows[0][1], 'MVP clarity');
});

test('buildBuyerStrengthMatrix marks trust weak without proof', () => {
  const matrix = buildBuyerStrengthMatrix(inventory, ['No proof page']);
  const trust = matrix.find((row) => row.label === 'Trust / doubt');
  assert.equal(trust?.strength, 'Weak');
});

test('buildPageCoverageRows reports missing ICP and proof', () => {
  const rows = buildPageCoverageRows(inventory);
  const icp = rows.find((row) => row[0] === 'ICP pages');
  const proof = rows.find((row) => row[0] === 'Customer proof');
  assert.equal(icp?.[3], 'Missing');
  assert.equal(proof?.[3], 'Missing');
});

test('buildPriorityTableRows maps teaser items', () => {
  const item: GrowthBriefPriorityItem = {
    title: 'Add ICP pages',
    summary: 'Missing ICP',
    page_path: null,
    category: 'architecture',
    type: 'missing_page_type',
    priority_score: 80,
    revenue_impact: 75,
    buyer_importance: 70,
    urgency: 60,
    execution_difficulty: 40,
    confidence: 70,
    aeo_value: 50,
    whyFirst: 'why',
    buyer_moment: 'Trust',
    estimated_value: 'High',
  };
  const rows = buildPriorityTableRows(
    {
      growthLeak: item,
      architectureGap: null,
      aeoInsight: 'insight',
      nextStep: 'next',
    },
    [],
    true
  );
  assert.equal(rows[0][1], 'Add ICP pages');
  assert.equal(rows[0][2], 'High');
});

test('weakestScoreLabel picks lowest dimension', () => {
  const weakest = weakestScoreLabel({
    overallOpportunity: 70,
    searchDemand: 20,
    conversionHealth: 40,
    architectureReadiness: 50,
    aeoClarity: 60,
    offerClarity: 70,
    buyerClarity: 65,
    trustProof: 50,
    ctaStrength: 40,
    pageArchitecture: 50,
    searchVisibility: 20,
    engagementQuality: 40,
    presaleReadiness: 48,
  });
  assert.equal(weakest.label, 'Search visibility');
  assert.equal(weakest.value, 20);
});

test('firstSentence trims to first sentence', () => {
  assert.equal(firstSentence('One. Two. Three.'), 'One.');
});
