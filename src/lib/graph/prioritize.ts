export function scorePriority(input: {
  revenueImpact: number;
  buyerImportance: number;
  urgency: number;
  executionDifficulty: number;
  confidence: number;
  aeoValue: number;
  programmaticPotential?: number;
}): number {
  const programmatic = input.programmaticPotential ?? 0;
  return Math.round(
    input.revenueImpact * 0.22 +
      input.buyerImportance * 0.18 +
      input.urgency * 0.15 +
      input.aeoValue * 0.12 +
      input.confidence * 0.1 +
      programmatic * 0.13 +
      (100 - input.executionDifficulty) * 0.1
  );
}
