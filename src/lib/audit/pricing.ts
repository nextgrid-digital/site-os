import type { DraftFinding } from '@/lib/audit/finding-generators';

export interface PricingRecommendation {
  recommended_tier: string;
  price_range: string;
  rationale: string;
  included_items: string[];
}

export const TIERS = {
  teaser: {
    tier: 'Site audit',
    price: '$0',
    items: [
      'Business context inferred from the site',
      'Homepage and page crawl observations',
      'Buyer moment diagnosis and architecture gaps',
      'Basic opportunity scorecard and top priority fixes',
      'One agent-ready execution prompt when available',
    ],
  },
  brief: {
    tier: 'Full audit',
    price: '~$700',
    items: [
      'Search Console query and page analysis',
      'GA4 landing page and engagement analysis',
      'Scored priority stack across search, site, and conversion',
      'AI/AEO understanding',
      'Execution briefs with universal agent prompts',
      'Implementation sprint recommendation',
    ],
  },
  sprint: {
    tier: 'Implementation sprint',
    price: 'Custom quote',
    items: [
      'Execute top full-audit findings',
      'Page rewrites, linking, and FAQ upgrades',
      'Operator review and ship support',
    ],
  },
  retainer: {
    tier: 'Monthly monitoring / retainer',
    price: 'Custom monthly',
    items: ['Monthly audit refresh', 'Opportunity tracking', 'Continuous prompt backlog'],
  },
};

export type ServiceTier = (typeof TIERS)[keyof typeof TIERS];

export function recommendPricing(
  findings: Array<Pick<DraftFinding, 'severity' | 'category'> & { priority_score?: number }>,
  runType: 'mini' | 'free' | 'full'
): PricingRecommendation {
  const highSeverity = findings.filter((f) => f.severity === 'high' || f.severity === 'critical').length;
  const architectureGaps = findings.filter((f) => f.category === 'architecture').length;
  const conversionGaps = findings.filter((f) => f.category === 'conversion').length;
  const topPriority = findings[0]?.priority_score ?? 0;

  if (runType === 'mini') {
    return {
      recommended_tier: TIERS.teaser.tier,
      price_range: TIERS.teaser.price,
      rationale:
        'Site audit covers crawl and intake evidence. Search Console, GA4, and full execution depth stay locked until data is connected and a full audit is run.',
      included_items: [...TIERS.teaser.items, `Next: ${TIERS.brief.tier} (${TIERS.brief.price})`],
    };
  }

  if (runType === 'free') {
    return {
      recommended_tier: 'Free full audit',
      price_range: '$0',
      rationale:
        'Full free audit from crawl and AI review only. Search Console and GA4 stay available as a paid connected upgrade.',
      included_items: [
        ...TIERS.teaser.items,
        'Full finding list with clarity, trust, CTA, and structure gaps',
        `Upgrade: ${TIERS.brief.tier} (${TIERS.brief.price})`,
      ],
    };
  }

  if (highSeverity >= 8 || architectureGaps >= 3 || conversionGaps >= 4 || topPriority >= 85) {
    return {
      recommended_tier: TIERS.sprint.tier,
      price_range: TIERS.sprint.price,
      rationale:
        'Priority stack shows enough high-impact work to follow the full audit with an implementation sprint.',
      included_items: [...TIERS.brief.items, ...TIERS.sprint.items, TIERS.retainer.tier],
    };
  }

  return {
    recommended_tier: TIERS.brief.tier,
    price_range: TIERS.brief.price,
    rationale:
      'A full audit turns GSC, GA4, crawl evidence, and business context into a scored execution memo — the decision tool clients cannot get from a webmaster export alone.',
    included_items: [...TIERS.brief.items, TIERS.retainer.tier],
  };
}
