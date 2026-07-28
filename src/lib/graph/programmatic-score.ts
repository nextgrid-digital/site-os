import type { ProgrammaticPatternFamily } from '@/lib/graph/types';

export interface ProgrammaticDimensionScores {
  searchDemand: number;
  buyerIntent: number;
  aiCitationValue: number;
  easeOfProduction: number;
  uniquenessRequirement: number;
  revenueImpact: number;
  thinContentRisk: number;
  priorityScore: number;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function scoreProgrammaticPattern(input: {
  family: ProgrammaticPatternFamily;
  baseBuyerIntent: number;
  baseAiCitation: number;
  baseUniqueness: number;
  baseThinRisk: number;
  queryImpressions: number;
  hasGraphTrigger: boolean;
  hasNodeInventory: boolean;
  dataAvailability: number;
  revenueProximity: number;
}): ProgrammaticDimensionScores {
  const searchDemand = clamp(
    input.queryImpressions <= 0
      ? input.hasGraphTrigger
        ? 35
        : 15
      : 30 + Math.min(60, Math.log10(input.queryImpressions + 1) * 18)
  );

  const buyerIntent = clamp(input.baseBuyerIntent);
  const aiCitationValue = clamp(input.baseAiCitation);
  const uniquenessRequirement = clamp(input.baseUniqueness);
  const easeOfProduction = clamp(
    100 - uniquenessRequirement * 0.55 + input.dataAvailability * 0.25
  );
  const revenueImpact = clamp(input.revenueProximity);
  const thinContentRisk = clamp(
    input.baseThinRisk + (uniquenessRequirement < 50 ? 15 : 0) - (input.dataAvailability > 60 ? 10 : 0)
  );

  const raw =
    searchDemand * 0.18 +
    buyerIntent * 0.16 +
    aiCitationValue * 0.14 +
    revenueImpact * 0.16 +
    easeOfProduction * 0.1 +
    (100 - uniquenessRequirement) * 0.06 +
    (input.hasGraphTrigger ? 12 : 0) +
    (input.hasNodeInventory ? 8 : 0) -
    thinContentRisk * 0.18;

  const priorityScore = clamp(raw);
  const priority: 'low' | 'medium' | 'high' =
    priorityScore >= 70 ? 'high' : priorityScore >= 45 ? 'medium' : 'low';

  let confidence = 40;
  if (input.hasGraphTrigger) confidence += 20;
  if (input.hasNodeInventory) confidence += 15;
  if (input.queryImpressions > 0) confidence += 15;
  if (input.queryImpressions > 500) confidence += 10;
  confidence = clamp(confidence);

  return {
    searchDemand,
    buyerIntent,
    aiCitationValue,
    easeOfProduction,
    uniquenessRequirement,
    revenueImpact,
    thinContentRisk,
    priorityScore,
    priority,
    confidence,
  };
}
