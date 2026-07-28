import type { ProgrammaticPatternFamily } from '@/lib/graph/types';

/** Display categories for presale GTM — engine keys unchanged. */
export type PresaleBlockerCategory =
  | 'Lead blockers'
  | 'Trust blockers'
  | 'Page blockers'
  | 'Traffic blockers'
  | 'Intent mismatches'
  | 'Presale opportunities'
  | 'Execution work orders';

const LEAD_FIT_FAMILIES = new Set<ProgrammaticPatternFamily>([
  'use_case',
  'comparisons',
  'integrations',
  'locations',
  'glossary',
  'profiles',
  'examples',
]);

export function findingCategoryLabel(category: string, type?: string): PresaleBlockerCategory {
  if (type === 'unproven_claim' || /proof/i.test(type ?? '')) return 'Trust blockers';
  switch (category) {
    case 'conversion':
      return 'Lead blockers';
    case 'architecture':
      return 'Page blockers';
    case 'search':
      return 'Traffic blockers';
    case 'on_page':
      return 'Intent mismatches';
    default:
      return 'Lead blockers';
  }
}

export function workOrderCategoryLabel(actionType: string): PresaleBlockerCategory {
  if (actionType === 'create_page_system') return 'Presale opportunities';
  if (actionType === 'add_proof') return 'Trust blockers';
  if (actionType === 'add_cta' || actionType === 'add_faq_schema') return 'Lead blockers';
  if (actionType === 'create_node' || actionType === 'connect_node') return 'Page blockers';
  return 'Execution work orders';
}

export function gapTypeLabel(gapType: string): PresaleBlockerCategory {
  if (gapType.includes('proof') || gapType === 'unproven_claim') return 'Trust blockers';
  if (gapType.includes('cta') || gapType.includes('conversion')) return 'Lead blockers';
  if (gapType.includes('query') || gapType.includes('search')) return 'Traffic blockers';
  if (gapType.includes('icp') || gapType.includes('offer') || gapType.includes('use_case'))
    return 'Page blockers';
  return 'Intent mismatches';
}

export function filterLeadFitOpportunities<
  T extends {
    patternFamily: string;
    buyerIntent?: number;
    revenueImpact?: number;
    linkedGapTypes?: string[];
    searchDemand?: number;
  },
>(opportunities: T[]): T[] {
  return opportunities.filter((opp) => {
    const family = opp.patternFamily as ProgrammaticPatternFamily;
    const isPreferred = LEAD_FIT_FAMILIES.has(family);
    const hasTrigger =
      (opp.linkedGapTypes?.length ?? 0) > 0 || (opp.searchDemand ?? 0) >= 40;
    const weakLeadFit =
      (opp.buyerIntent ?? 0) < 50 &&
      (opp.revenueImpact ?? 0) < 50 &&
      (opp.searchDemand ?? 0) < 40;

    // Hide non-preferred families unless a graph/query trigger exists
    if (!isPreferred && !hasTrigger) return false;
    // Hide weak lead-fit when there is no demand or gap trigger
    if (weakLeadFit && !hasTrigger) return false;
    return true;
  });
}

export const PRODUCT_STATEMENT =
  'Site-OS finds the blockers stopping a website from generating leads, sales conversations, or signups before the sale.';
