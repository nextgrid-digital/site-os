import type { SiteOnlyPageInventoryItem } from '@/lib/audit/site-only-analysis';
import type { GrowthBrief, GrowthBriefPriorityItem, GrowthBriefTeaser } from '@/lib/reports/build-growth-brief';
import type { ArchitectureInput } from '@/lib/supabase/types';

export type IcpOfferRow = [string, string, string];
export type StrengthLevel = 'Weak' | 'Medium' | 'Strong';

export function buildIcpOfferRows(
  intake: ArchitectureInput | null | undefined,
  brief: Pick<GrowthBrief, 'icpAlignment' | 'offerClarity' | 'siteOnlySummary'>
): IcpOfferRow[] {
  const moments = brief.siteOnlySummary?.buyerMoments ?? [];
  const rows: IcpOfferRow[] = [];

  const primaryIcp = intake?.primary_icp?.trim();
  const primaryOffer = intake?.primary_offer?.trim();
  if (primaryIcp || primaryOffer) {
    rows.push([
      primaryIcp || 'Primary ICP (inferred)',
      primaryOffer || 'Primary offer (inferred)',
      moments[0]?.slice(0, 80) || 'Can this be trusted?',
    ]);
  }

  const secondaryIcps = intake?.secondary_icps
    ?.split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (secondaryIcps) {
    for (const [index, icp] of secondaryIcps.entries()) {
      rows.push([
        icp,
        intake?.secondary_offers?.trim() || primaryOffer || 'Secondary offer',
        moments[index + 1]?.slice(0, 80) || 'How does this work?',
      ]);
    }
  }

  if (rows.length === 0) {
    rows.push([
      brief.icpAlignment.slice(0, 48) || 'ICP not specified',
      brief.offerClarity.slice(0, 48) || 'Offer not specified',
      moments[0]?.slice(0, 80) || 'Can this save time?',
    ]);
  }

  return rows.slice(0, 3);
}

function countKind(inventory: SiteOnlyPageInventoryItem[], kind: SiteOnlyPageInventoryItem['kind']) {
  return inventory.find((item) => item.kind === kind)?.paths.length ?? 0;
}

function present(inventory: SiteOnlyPageInventoryItem[], kind: SiteOnlyPageInventoryItem['kind']) {
  return inventory.find((item) => item.kind === kind)?.present ?? false;
}

export function buildBuyerStrengthMatrix(
  inventory: SiteOnlyPageInventoryItem[] | undefined,
  proofGaps: string[]
): Array<{ label: string; strength: StrengthLevel }> {
  const inv = inventory ?? [];
  const hasFaq = present(inv, 'faq');
  const hasProduct = present(inv, 'product') || present(inv, 'services');
  const hasPricing = present(inv, 'pricing');
  const hasProof = present(inv, 'case_study') && proofGaps.length === 0;
  const hasAbout = present(inv, 'about');

  const strength = (ok: boolean, partial: boolean): StrengthLevel => {
    if (ok) return 'Strong';
    if (partial) return 'Medium';
    return 'Weak';
  };

  return [
    { label: 'Want to know', strength: strength(hasAbout && hasFaq, hasAbout || hasFaq) },
    { label: 'Want to do', strength: strength(hasProduct && hasFaq, hasProduct) },
    { label: 'Want to buy', strength: strength(hasProduct && hasPricing, hasProduct || hasPricing) },
    {
      label: 'Trust / doubt',
      strength: strength(hasProof, present(inv, 'case_study') || present(inv, 'about')),
    },
  ];
}

export function buildPageCoverageRows(
  inventory: SiteOnlyPageInventoryItem[] | undefined
): Array<[string, number, number, string]> {
  const inv = inventory ?? [];
  const about = countKind(inv, 'about');
  const services = countKind(inv, 'services');
  const product = countKind(inv, 'product');
  const proof = countKind(inv, 'case_study');

  const status = (expected: number, found: number) => {
    if (found <= 0) return 'Missing';
    if (found < expected) return 'Partial';
    return 'Found';
  };

  const icpFound = about + (services > 0 ? 1 : 0);
  const solutionFound = services;

  return [
    ['ICP pages', 3, icpFound, status(3, icpFound)],
    ['Product pages', 2, product, status(2, product)],
    ['Solution pages', 4, solutionFound, status(4, solutionFound)],
    ['Customer proof', 1, proof, status(1, proof)],
  ];
}

function band(score: number): string {
  if (score >= 70) return 'High';
  if (score >= 45) return 'Medium';
  return 'Low';
}

function effortBand(difficulty: number): string {
  if (difficulty >= 65) return 'High';
  if (difficulty >= 40) return 'Medium';
  return 'Low';
}

export function buildPriorityTableRows(
  teaser: GrowthBriefTeaser | null,
  priorityStack: GrowthBriefPriorityItem[],
  isTeaser: boolean
): Array<[string, string, string, string]> {
  if (isTeaser && teaser) {
    const rows: Array<[string, string, string, string]> = [];
    if (teaser.growthLeak) {
      rows.push([
        'High',
        teaser.growthLeak.title,
        band(teaser.growthLeak.revenue_impact),
        effortBand(teaser.growthLeak.execution_difficulty),
      ]);
    }
    if (teaser.architectureGap) {
      rows.push([
        'High',
        teaser.architectureGap.title,
        band(teaser.architectureGap.revenue_impact),
        effortBand(teaser.architectureGap.execution_difficulty),
      ]);
    }
    if (rows.length === 0) {
      rows.push(['Medium', 'Clarify homepage offer', 'Medium', 'Low']);
    }
    return rows.slice(0, 5);
  }

  return priorityStack.slice(0, 8).map((item) => [
    band(item.priority_score),
    item.title,
    band(item.revenue_impact),
    effortBand(item.execution_difficulty),
  ]);
}

export function weakestScoreLabel(scorecard: GrowthBrief['scorecard']): {
  label: string;
  value: number;
} {
  const entries: Array<{ label: string; value: number }> = [
    { label: 'Offer clarity', value: scorecard.offerClarity ?? scorecard.overallOpportunity },
    { label: 'Buyer clarity', value: scorecard.buyerClarity ?? 50 },
    { label: 'Trust / proof', value: scorecard.trustProof ?? scorecard.architectureReadiness },
    { label: 'CTA strength', value: scorecard.ctaStrength ?? scorecard.conversionHealth },
    { label: 'Page architecture', value: scorecard.pageArchitecture ?? scorecard.architectureReadiness },
    { label: 'Search visibility', value: scorecard.searchVisibility ?? scorecard.searchDemand },
    { label: 'Engagement', value: scorecard.engagementQuality ?? scorecard.conversionHealth },
    { label: 'AEO clarity', value: scorecard.aeoClarity },
  ];
  return entries.reduce((weakest, entry) => (entry.value < weakest.value ? entry : weakest));
}

export function firstSentence(text: string, maxLen = 220): string {
  const trimmed = stripDraftDisclaimers(text.trim());
  if (!trimmed) return '';
  const match = trimmed.match(/^[^.!?]+[.!?]/);
  const sentence = match?.[0]?.trim() ?? trimmed;
  return sentence.length > maxLen ? `${sentence.slice(0, maxLen - 1)}…` : sentence;
}

/** Normalize legacy stored copy that used draft / not-verified wording. */
export function stripDraftDisclaimers(text: string): string {
  return text
    .replace(/AI draft reading \(inference, not verified\):\s*/gi, 'AI inference: ')
    .replace(/AEO inferred ICPs \(draft\):\s*/gi, 'AI inference ICPs: ')
    .replace(/AEO clarity score \(draft\):\s*/gi, 'AEO clarity score: ')
    .replace(/\s*Confirm with the client before treating as fact\.?/gi, '')
    .replace(/Draft analysis — not verified facts/gi, 'AI inference')
    .replace(/Draft inference — not verified facts/gi, 'AI inference')
    .replace(/Draft — not verified facts/gi, 'AI inference')
    .trim();
}
