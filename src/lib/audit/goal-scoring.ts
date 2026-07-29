import type { GoalCategory } from '@/lib/db/client-intake';

type FindingCategory =
  | 'conversion_blockers'
  | 'trust_proof'
  | 'cta_gaps'
  | 'architecture_gaps'
  | 'search_opportunities'
  | 'funnel_gaps'
  | 'messaging_clarity'
  | 'other';

const GOAL_WEIGHTS: Record<GoalCategory, Record<FindingCategory, number>> = {
  leads: {
    conversion_blockers: 2.0,
    trust_proof: 1.8,
    cta_gaps: 2.0,
    architecture_gaps: 0.8,
    search_opportunities: 0.5,
    funnel_gaps: 1.5,
    messaging_clarity: 1.0,
    other: 1.0,
  },
  signups: {
    conversion_blockers: 1.5,
    trust_proof: 1.0,
    cta_gaps: 2.0,
    architecture_gaps: 0.8,
    search_opportunities: 0.5,
    funnel_gaps: 1.0,
    messaging_clarity: 2.0,
    other: 1.0,
  },
  sales: {
    conversion_blockers: 1.8,
    trust_proof: 2.0,
    cta_gaps: 1.5,
    architecture_gaps: 0.8,
    search_opportunities: 0.5,
    funnel_gaps: 1.0,
    messaging_clarity: 1.5,
    other: 1.0,
  },
  traffic: {
    conversion_blockers: 0.5,
    trust_proof: 0.3,
    cta_gaps: 0.3,
    architecture_gaps: 2.0,
    search_opportunities: 2.0,
    funnel_gaps: 0.3,
    messaging_clarity: 0.5,
    other: 1.0,
  },
  funnel_clarity: {
    conversion_blockers: 1.5,
    trust_proof: 0.8,
    cta_gaps: 1.0,
    architecture_gaps: 1.0,
    search_opportunities: 0.5,
    funnel_gaps: 2.0,
    messaging_clarity: 0.8,
    other: 1.0,
  },
};

function classifyFinding(finding: { type?: string; category?: string }): FindingCategory {
  const t = (finding.type ?? '').toLowerCase();
  const c = (finding.category ?? '').toLowerCase();

  if (t.includes('conversion') || c.includes('conversion')) return 'conversion_blockers';
  if (t.includes('trust') || t.includes('proof') || c.includes('trust') || c.includes('proof')) return 'trust_proof';
  if (t.includes('cta') || c.includes('cta') || t.includes('call_to_action')) return 'cta_gaps';
  if (t.includes('architecture') || t.includes('structure') || c.includes('architecture')) return 'architecture_gaps';
  if (t.includes('search') || t.includes('seo') || c.includes('search')) return 'search_opportunities';
  if (t.includes('funnel') || c.includes('funnel') || t.includes('pipeline')) return 'funnel_gaps';
  if (t.includes('messaging') || t.includes('clarity') || c.includes('messaging') || c.includes('clarity')) return 'messaging_clarity';
  return 'other';
}

export function applyGoalWeights<T extends { priority_score?: number; type?: string; category?: string }>(
  findings: T[],
  goalCategory: GoalCategory | null | undefined
): T[] {
  if (!goalCategory) return findings;

  const weights = GOAL_WEIGHTS[goalCategory];
  return findings
    .map((f) => {
      const cat = classifyFinding(f);
      const weight = weights[cat];
      const score = (f.priority_score ?? 50) * weight;
      return { ...f, priority_score: Math.round(score) };
    })
    .sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));
}
