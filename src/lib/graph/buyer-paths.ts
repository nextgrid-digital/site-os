import type { DraftBuyerPath, DraftGraphEntity, DraftGraphRelationship } from '@/lib/graph/types';
import { scorePriority } from '@/lib/graph/prioritize';

function entityById(entities: DraftGraphEntity[], id: string) {
  return entities.find((e) => e.localId === id);
}

export function buildBuyerPaths(input: {
  entities: DraftGraphEntity[];
  relationships: DraftGraphRelationship[];
  buyerMoments: string[];
}): DraftBuyerPath[] {
  const { entities, relationships, buyerMoments } = input;
  const queries = entities
    .filter((e) => e.type === 'query' && e.status === 'found')
    .sort(
      (a, b) =>
        Number(b.metadata.impressions ?? 0) - Number(a.metadata.impressions ?? 0)
    )
    .slice(0, 12);

  const offers = entities.filter((e) => e.type === 'offer' && e.status !== 'missing');
  const proofs = entities.filter((e) => e.type === 'proof' && e.status === 'found');
  const ctas = entities.filter((e) => e.type === 'cta' && e.status === 'found');
  const primaryOffer = offers[0] ?? null;
  const primaryProof = proofs[0] ?? null;
  const primaryCta = ctas[0] ?? null;
  const defaultMoment = buyerMoments[0] ?? 'Evaluation';

  const paths: DraftBuyerPath[] = [];

  for (const query of queries) {
    const answerEdge = relationships.find(
      (r) => r.fromLocalId === query.localId && r.type === 'answers'
    );
    const page = answerEdge ? entityById(entities, answerEdge.toLocalId) : null;
    const pageCta = page
      ? relationships
          .filter((r) => r.fromLocalId === page.localId && r.type === 'converts_to')
          .map((r) => entityById(entities, r.toLocalId))
          .find(Boolean)
      : null;

    const missingSteps: string[] = [];
    if (!page || page.status === 'missing') missingSteps.push('page');
    if (!primaryOffer) missingSteps.push('offer');
    if (!primaryProof) missingSteps.push('proof');
    if (!(pageCta || primaryCta)) missingSteps.push('cta');

    const present = 6 - missingSteps.length - (query ? 0 : 1);
    const completeness = Math.round((Math.max(present, 0) / 6) * 100);
    const impressions = Number(query.metadata.impressions ?? 0);

    paths.push({
      queryLabel: query.label,
      buyerMoment: defaultMoment,
      pageLabel: page && page.status !== 'missing' ? page.label : null,
      offerLabel: primaryOffer?.label ?? null,
      proofLabel: primaryProof?.label ?? null,
      ctaLabel: (pageCta ?? primaryCta)?.label ?? null,
      missingSteps,
      completeness,
      priorityScore: scorePriority({
        revenueImpact: Math.min(95, 40 + Math.log10(impressions + 1) * 15),
        buyerImportance: missingSteps.includes('page') ? 85 : 60,
        urgency: missingSteps.length * 15,
        executionDifficulty: missingSteps.includes('page') ? 60 : 40,
        confidence: 70,
        aeoValue: 65,
        programmaticPotential: missingSteps.includes('page') ? 70 : 30,
      }),
      metadata: { impressions },
    });
  }

  // ICP without dedicated page paths
  const icps = entities.filter((e) => e.type === 'icp' && e.status !== 'missing');
  const foundPages = entities.filter((e) => e.type === 'page' && e.status === 'found');
  for (const icp of icps.slice(0, 4)) {
    const hasPage = foundPages.some((p) => {
      const blob = `${p.label} ${String(p.metadata.title ?? '')} ${String(p.metadata.h1 ?? '')}`.toLowerCase();
      return blob.includes(icp.label.toLowerCase().slice(0, 12));
    });
    if (hasPage) continue;
    paths.push({
      queryLabel: null,
      buyerMoment: defaultMoment,
      pageLabel: null,
      offerLabel: primaryOffer?.label ?? null,
      proofLabel: primaryProof?.label ?? null,
      ctaLabel: primaryCta?.label ?? null,
      missingSteps: ['page', ...(primaryProof ? [] : ['proof'])],
      completeness: primaryOffer ? 40 : 20,
      priorityScore: scorePriority({
        revenueImpact: 75,
        buyerImportance: 90,
        urgency: 70,
        executionDifficulty: 55,
        confidence: 70,
        aeoValue: 75,
        programmaticPotential: 85,
      }),
      metadata: { icp: icp.label, kind: 'icp_path' },
    });
  }

  return paths.sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 20);
}
