import type {
  DraftBuyerPath,
  DraftGraphEntity,
  DraftGraphRelationship,
  DraftProgrammaticOpportunity,
  GraphScores,
} from '@/lib/graph/types';

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function scoreCommercialGraph(input: {
  entities: DraftGraphEntity[];
  relationships: DraftGraphRelationship[];
  buyerPaths: DraftBuyerPath[];
  opportunities: DraftProgrammaticOpportunity[];
  aeoClarity: number | null;
}): GraphScores {
  const { entities, relationships, buyerPaths, opportunities } = input;

  const requiredTypes = ['icp', 'offer', 'page', 'proof', 'cta'] as const;
  const presentRequired = requiredTypes.filter((type) =>
    entities.some((e) => e.type === type && e.status === 'found')
  ).length;
  const entityCompleteness = clamp((presentRequired / requiredTypes.length) * 100);

  const missingNodeCount = entities.filter((e) => e.status === 'missing').length;
  const foundCount = entities.filter((e) => e.status === 'found').length;
  const entityRatio =
    foundCount + missingNodeCount > 0
      ? (foundCount / (foundCount + missingNodeCount)) * 100
      : entityCompleteness;

  const claims = entities.filter((e) => e.type === 'claim' && e.status === 'found');
  const claimsWithProof = claims.filter((claim) => {
    return relationships.some((r) => {
      if (r.fromLocalId === claim.localId) {
        const to = entities.find((e) => e.localId === r.toLocalId);
        return to?.type === 'proof' && to.status === 'found';
      }
      if (r.toLocalId === claim.localId && r.type === 'proves') {
        const from = entities.find((e) => e.localId === r.fromLocalId);
        return from?.type === 'proof';
      }
      return false;
    });
  });
  const disconnectedClaimCount = Math.max(0, claims.length - claimsWithProof.length);
  const proofDensity =
    claims.length === 0
      ? entities.some((e) => e.type === 'proof' && e.status === 'found')
        ? 70
        : 35
      : clamp((claimsWithProof.length / claims.length) * 100);

  const expectedRels = Math.max(entities.length, 1);
  const solidRels = relationships.filter((r) => r.type !== 'missing').length;
  const relationshipCompleteness = clamp(Math.min(100, (solidRels / expectedRels) * 80 + 20));

  const buyerPathCoverage =
    buyerPaths.length === 0
      ? 25
      : clamp(
          buyerPaths.reduce((sum, p) => sum + p.completeness, 0) / buyerPaths.length
        );

  const queries = entities.filter((e) => e.type === 'query');
  const answeredQueries = queries.filter((q) =>
    relationships.some((r) => r.fromLocalId === q.localId && r.type === 'answers')
  );
  const queryPageMatchRate =
    queries.length === 0 ? 0 : clamp((answeredQueries.length / queries.length) * 100);
  const searchCoverage = queries.length === 0 ? 40 : queryPageMatchRate;

  const pages = entities.filter((e) => e.type === 'page' && e.status === 'found');
  const pagesWithCta = pages.filter((p) =>
    relationships.some((r) => r.fromLocalId === p.localId && r.type === 'converts_to')
  );
  const ctaCoverage =
    pages.length === 0 ? 30 : clamp((pagesWithCta.length / pages.length) * 100);

  const aeoClarity = input.aeoClarity != null ? clamp(input.aeoClarity) : 45;
  const programmaticReadiness = clamp(
    opportunities.length === 0
      ? 30
      : 40 + Math.min(50, opportunities.length * 10) + (opportunities[0]?.confidence ?? 0) * 0.1
  );

  const completenessScore = clamp(
    entityCompleteness * 0.18 +
      relationshipCompleteness * 0.14 +
      proofDensity * 0.14 +
      buyerPathCoverage * 0.16 +
      searchCoverage * 0.12 +
      ctaCoverage * 0.1 +
      aeoClarity * 0.08 +
      programmaticReadiness * 0.08
  );

  return {
    completenessScore,
    entityCompleteness: clamp(entityRatio),
    relationshipCompleteness,
    proofDensity,
    buyerPathCoverage,
    searchCoverage,
    ctaCoverage,
    aeoClarity,
    programmaticReadiness,
    missingNodeCount,
    disconnectedClaimCount,
    queryPageMatchRate,
    programmaticOpportunityCount: opportunities.length,
  };
}
