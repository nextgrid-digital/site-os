import type { DraftFinding } from '@/lib/audit/finding-generators';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { ArchitectureInput, FindingSeverity } from '@/lib/supabase/types';

export interface FindingScores {
  revenue_impact: number;
  buyer_importance: number;
  urgency: number;
  execution_difficulty: number;
  confidence: number;
  aeo_value: number;
  priority_score: number;
}

export type ScoredFinding = DraftFinding & FindingScores;

const SEVERITY_BASE: Record<FindingSeverity, number> = {
  low: 35,
  medium: 55,
  high: 75,
  critical: 90,
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasIntakeSignal(intake: ArchitectureInput | null | undefined, key: keyof ArchitectureInput) {
  const value = intake?.[key];
  return typeof value === 'string' && value.trim().length > 0;
}

function aeoBoost(finding: DraftFinding, aeo: AeoAnalysis | null | undefined): number {
  if (!aeo) return 40;
  let score = 45;
  const path = finding.page_path?.toLowerCase() ?? '';
  const title = finding.title.toLowerCase();

  if (finding.type === 'missing_faq' || title.includes('faq')) {
    score += aeo.missing_faq_opportunities.length > 0 ? 25 : 10;
  }
  if (finding.type === 'missing_page_type' || finding.category === 'architecture') {
    score += aeo.missing_page_types.length > 0 ? 20 : 8;
  }
  if (finding.type.includes('proof') || title.includes('proof') || title.includes('customer')) {
    score += aeo.missing_proof_opportunities.length > 0 ? 20 : 5;
  }
  if (aeo.suggested_aeo_rewrites.some((rewrite) => (rewrite.page_path ?? '').toLowerCase() === path)) {
    score += 15;
  }
  score += (aeo.answerability_score < 60 ? 10 : 0) + (aeo.clarity_score < 60 ? 8 : 0);
  return clamp(score);
}

export function scoreFinding(
  finding: DraftFinding,
  intake?: ArchitectureInput | null,
  aeo?: AeoAnalysis | null
): ScoredFinding {
  const severityBase = SEVERITY_BASE[finding.severity];
  const opportunityScore =
    typeof finding.evidence.opportunityScore === 'number' ? finding.evidence.opportunityScore : 0;

  let revenue = severityBase;
  let buyer = severityBase - 5;
  let urgency = severityBase - 10;
  let difficulty = 50;
  let confidence = 70;

  switch (finding.category) {
    case 'conversion':
      revenue += 20;
      buyer += 15;
      urgency += 15;
      difficulty += 5;
      break;
    case 'search':
      revenue += 15 + Math.min(15, opportunityScore / 2);
      buyer += 10;
      urgency += 10;
      difficulty -= 5;
      break;
    case 'architecture':
      revenue += 12;
      buyer += 18;
      urgency += 8;
      difficulty += 15;
      break;
    case 'on_page':
      revenue += 5;
      buyer += 5;
      urgency += 5;
      difficulty -= 15;
      break;
    default:
      break;
  }

  switch (finding.type) {
    case 'no_conversion_support':
      revenue += 10;
      urgency += 10;
      break;
    case 'missing_page_type':
      buyer += 10;
      if (hasIntakeSignal(intake, 'primary_icp') || hasIntakeSignal(intake, 'primary_offer')) {
        confidence += 10;
        revenue += 5;
      }
      break;
    case 'weak_title':
    case 'weak_meta_description':
      difficulty = 25;
      confidence += 10;
      break;
    case 'missing_faq':
      difficulty = 35;
      buyer += 8;
      break;
    case 'thin_internal_links':
      difficulty = 40;
      break;
    case 'search_ctr_gap':
      confidence += 8;
      break;
    default:
      break;
  }

  if (hasIntakeSignal(intake, 'conversion_goal') && finding.category === 'conversion') {
    revenue += 8;
    buyer += 5;
  }
  if (hasIntakeSignal(intake, 'pricing_context')) {
    urgency += 5;
  }

  const aeo_value = aeoBoost(finding, aeo);
  const revenue_impact = clamp(revenue);
  const buyer_importance = clamp(buyer);
  const urgencyScore = clamp(urgency);
  const execution_difficulty = clamp(difficulty);
  const confidenceScore = clamp(confidence);

  const priority_score = clamp(
    (revenue_impact * 0.28 +
      buyer_importance * 0.22 +
      urgencyScore * 0.18 +
      aeo_value * 0.14 +
      (100 - execution_difficulty) * 0.1) *
      (0.7 + confidenceScore / 333)
  );

  return {
    ...finding,
    revenue_impact,
    buyer_importance,
    urgency: urgencyScore,
    execution_difficulty,
    confidence: confidenceScore,
    aeo_value,
    priority_score,
  };
}

export function scoreAndSortFindings(
  findings: DraftFinding[],
  intake?: ArchitectureInput | null,
  aeo?: AeoAnalysis | null
): ScoredFinding[] {
  return findings
    .map((finding) => scoreFinding(finding, intake, aeo))
    .toSorted((a, b) => b.priority_score - a.priority_score || a.title.localeCompare(b.title));
}
