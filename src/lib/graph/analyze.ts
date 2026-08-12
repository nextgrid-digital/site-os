import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import type { ArchitectureInput } from '@/lib/supabase/types';
import { buildBuyerPaths } from '@/lib/graph/buyer-paths';
import { extractCommercialGraph } from '@/lib/graph/extract';
import { detectProgrammaticOpportunities } from '@/lib/graph/programmatic';
import { scorePriority } from '@/lib/graph/prioritize';
import { scoreCommercialGraph } from '@/lib/graph/score';
import type {
  CommercialGraphArtifact,
  DraftGraphEntity,
  DraftGraphGap,
  DraftGraphRelationship,
} from '@/lib/graph/types';
import { buildWorkOrders } from '@/lib/graph/work-orders';
import { matchFindingIdForWorkOrder } from '@/lib/workflow/work-items';

function pushMissingEdge(
  relationships: DraftGraphRelationship[],
  fromLocalId: string,
  toLocalId: string,
  evidence: Record<string, unknown>
) {
  if (
    relationships.some(
      (r) => r.fromLocalId === fromLocalId && r.toLocalId === toLocalId && r.type === 'missing'
    )
  ) {
    return;
  }
  relationships.push({
    fromLocalId,
    toLocalId,
    type: 'missing',
    confidence: 80,
    evidence,
    source: 'analysis',
  });
}

function pageMentions(entities: DraftGraphEntity[], label: string): boolean {
  const needle = label.toLowerCase().slice(0, 16);
  if (needle.length < 3) return false;
  return entities.some((e) => {
    if (e.type !== 'page' || e.status !== 'found') return false;
    const blob = `${e.label} ${String(e.metadata.title ?? '')} ${String(e.metadata.h1 ?? '')}`.toLowerCase();
    return blob.includes(needle);
  });
}

function buildGaps(input: {
  entities: DraftGraphEntity[];
  relationships: DraftGraphRelationship[];
}): DraftGraphGap[] {
  const { entities, relationships } = input;
  const gaps: DraftGraphGap[] = [];

  const addGap = (gap: Omit<DraftGraphGap, 'priorityScore'> & { priorityScore?: number }) => {
    const priorityScore =
      gap.priorityScore ??
      scorePriority({
        revenueImpact: gap.revenueImpact,
        buyerImportance: gap.buyerImportance,
        urgency: gap.urgency,
        executionDifficulty: gap.executionDifficulty,
        confidence: gap.confidence,
        aeoValue: gap.aeoValue,
        programmaticPotential: gap.programmaticPotential,
      });
    gaps.push({ ...gap, priorityScore });
  };

  for (const icp of entities.filter((e) => e.type === 'icp' && e.status !== 'missing')) {
    if (pageMentions(entities, icp.label)) continue;
    const missingPage = entities.find(
      (e) => e.type === 'page' && e.status === 'missing' && /icp|audience/i.test(e.label)
    );
    if (missingPage) {
      pushMissingEdge(relationships, icp.localId, missingPage.localId, { rule: 'icp_needs_page' });
    }
    addGap({
      gap: `No page for: ${icp.label}`,
      gapType: 'icp_without_page',
      impact: 'This audience has no clear place to land on the site',
      fix: 'Add a page and link it from home and offers',
      confidence: icp.confidence,
      entityLocalIds: [icp.localId],
      revenueImpact: 80,
      buyerImportance: 90,
      urgency: 75,
      executionDifficulty: 55,
      aeoValue: 80,
      programmaticPotential: 85,
    });
  }

  for (const offer of entities.filter((e) => e.type === 'offer' && e.status !== 'missing')) {
    const hasProof = relationships.some((r) => {
      if (r.type !== 'proves') return false;
      const from = entities.find((e) => e.localId === r.fromLocalId);
      return r.toLocalId === offer.localId && from?.type === 'proof' && from.status === 'found';
    });
    if (!hasProof) {
      addGap({
        gap: `Offer needs proof: ${offer.label}`,
        gapType: 'offer_without_proof',
        impact: 'Harder to trust and convert without proof',
        fix: 'Add a case study, logo, or result',
        confidence: 70,
        entityLocalIds: [offer.localId],
        revenueImpact: 85,
        buyerImportance: 80,
        urgency: 70,
        executionDifficulty: 45,
        aeoValue: 70,
        programmaticPotential: 40,
      });
    }

    const hasUseCase = entities.some((e) => e.type === 'use_case' && e.status !== 'missing');
    if (!hasUseCase) {
      addGap({
        gap: `Offer needs a use case: ${offer.label}`,
        gapType: 'offer_without_use_case',
        impact: 'Buyers do not see when this offer applies',
        fix: 'Write one clear use case for this offer',
        confidence: 65,
        entityLocalIds: [offer.localId],
        revenueImpact: 70,
        buyerImportance: 75,
        urgency: 60,
        executionDifficulty: 40,
        aeoValue: 65,
        programmaticPotential: 70,
      });
    }

    if (!pageMentions(entities, offer.label)) {
      addGap({
        gap: `No page for offer: ${offer.label}`,
        gapType: 'offer_without_page',
        impact: 'No clear URL for this offer',
        fix: 'Create a page that names this offer',
        confidence: 70,
        entityLocalIds: [offer.localId],
        revenueImpact: 78,
        buyerImportance: 82,
        urgency: 72,
        executionDifficulty: 50,
        aeoValue: 75,
        programmaticPotential: 60,
      });
    }
  }

  for (const useCase of entities.filter((e) => e.type === 'use_case' && e.status !== 'missing')) {
    if (pageMentions(entities, useCase.label)) continue;
    addGap({
      gap: `No page for use case: ${useCase.label}`,
      gapType: 'use_case_without_page',
      impact: 'This buyer moment has no page to send people to',
      fix: 'Publish a page for this use case',
      confidence: 60,
      entityLocalIds: [useCase.localId],
      revenueImpact: 72,
      buyerImportance: 80,
      urgency: 65,
      executionDifficulty: 50,
      aeoValue: 70,
      programmaticPotential: 80,
    });
  }

  for (const claim of entities.filter((e) => e.type === 'claim' && e.status === 'found')) {
    const proven = relationships.some((r) => {
      const otherId = r.fromLocalId === claim.localId ? r.toLocalId : r.toLocalId === claim.localId ? r.fromLocalId : null;
      if (!otherId) return false;
      const other = entities.find((e) => e.localId === otherId);
      return other?.type === 'proof' && other.status === 'found';
    });
    if (proven) continue;
    addGap({
      gap: `Claim needs proof: ${claim.label.slice(0, 80)}`,
      gapType: 'unproven_claim',
      impact: 'Unproven claims weaken trust',
      fix: 'Add proof next to the claim, or soften the claim',
      confidence: 55,
      entityLocalIds: [claim.localId],
      revenueImpact: 60,
      buyerImportance: 70,
      urgency: 55,
      executionDifficulty: 35,
      aeoValue: 75,
      programmaticPotential: 20,
    });
  }

  for (const page of entities.filter((e) => e.type === 'page' && e.status === 'found')) {
    const hasCta = relationships.some(
      (r) => r.fromLocalId === page.localId && r.type === 'converts_to'
    );
    const isKey =
      page.label === '/' ||
      /pricing|service|product|solution|case/i.test(page.label) ||
      Number(page.metadata.gaSessions ?? 0) > 0;
    if (isKey && !hasCta) {
      addGap({
        gap: `No clear next step on: ${page.label}`,
        gapType: 'missing_cta',
        impact: 'Visitors arrive but do not know what to do next',
        fix: 'Add one clear call to action on this page',
        confidence: 60,
        entityLocalIds: [page.localId],
        revenueImpact: 75,
        buyerImportance: 70,
        urgency: 70,
        executionDifficulty: 25,
        aeoValue: 40,
        programmaticPotential: 15,
      });
    }
  }

  for (const query of entities.filter((e) => e.type === 'query')) {
    const answered = relationships.some(
      (r) => r.fromLocalId === query.localId && r.type === 'answers'
    );
    const impressions = Number(query.metadata.impressions ?? 0);
    if (answered || impressions < 50) continue;
    addGap({
      gap: `No page for search: ${query.label}`,
      gapType: 'query_without_page',
      impact: `People search this (${impressions} impressions) but have no clear page`,
      fix: 'Create a page that answers this search',
      confidence: 80,
      entityLocalIds: [query.localId],
      revenueImpact: Math.min(95, 50 + Math.log10(impressions + 1) * 12),
      buyerImportance: 85,
      urgency: 80,
      executionDifficulty: 55,
      aeoValue: 85,
      programmaticPotential: 70,
    });
  }

  return gaps.sort((a, b) => b.priorityScore - a.priorityScore);
}

function buildRelationshipHealth(
  entities: DraftGraphEntity[],
  relationships: DraftGraphRelationship[],
  gaps: DraftGraphGap[]
): CommercialGraphArtifact['relationshipHealth'] {
  const claimsWithoutProof = gaps
    .filter((g) => g.gapType === 'unproven_claim')
    .map((g) => g.gap);
  const useCasesWithoutPage = gaps
    .filter((g) => g.gapType === 'use_case_without_page')
    .map((g) => g.gap);
  const icpsWithoutPage = gaps.filter((g) => g.gapType === 'icp_without_page').map((g) => g.gap);
  const queriesWithoutAnswer = gaps
    .filter((g) => g.gapType === 'query_without_page')
    .map((g) => g.gap);
  const ctasDisconnected = gaps.filter((g) => g.gapType === 'missing_cta').map((g) => g.gap);
  const offersWithoutPage = gaps
    .filter((g) => g.gapType === 'offer_without_page')
    .map((g) => g.gap);

  const pagesWithTrafficWeakProof = entities
    .filter(
      (e) =>
        e.type === 'page' &&
        e.status === 'found' &&
        Number(e.metadata.gaSessions ?? e.metadata.gsc_impressions ?? 0) > 0
    )
    .filter((page) => {
      const hasProofLink = relationships.some((r) => {
        if (r.fromLocalId !== page.localId && r.toLocalId !== page.localId) return false;
        const otherId = r.fromLocalId === page.localId ? r.toLocalId : r.fromLocalId;
        const other = entities.find((e) => e.localId === otherId);
        return other?.type === 'proof';
      });
      return !hasProofLink;
    })
    .map((p) => p.label)
    .slice(0, 8);

  const pagesThatShouldLink: string[] = [];
  const home = entities.find((e) => e.type === 'page' && e.label === '/' && e.status === 'found');
  const proofPages = entities.filter(
    (e) =>
      e.type === 'page' &&
      e.status === 'found' &&
      /case|customer|proof|testimonial/i.test(e.label)
  );
  if (home && proofPages.length > 0) {
    for (const proofPage of proofPages.slice(0, 3)) {
      const linked = relationships.some(
        (r) =>
          r.type === 'links_to' &&
          ((r.fromLocalId === home.localId && r.toLocalId === proofPage.localId) ||
            (r.fromLocalId === proofPage.localId && r.toLocalId === home.localId))
      );
      if (!linked) pagesThatShouldLink.push(`Home ↔ ${proofPage.label}`);
    }
  }

  return {
    claimsWithoutProof,
    useCasesWithoutPage,
    icpsWithoutPage,
    queriesWithoutAnswer,
    ctasDisconnected,
    offersWithoutPage,
    pagesWithTrafficWeakProof,
    pagesThatShouldLink,
  };
}

function buildExecutiveMemo(input: {
  projectName: string;
  siteOnly: SiteOnlyAnalysis | null;
  aeo: AeoAnalysis | null;
  queryCount: number;
  topQuery: string | null;
  ga4Sessions: number;
  scores: CommercialGraphArtifact['scores'];
  gaps: DraftGraphGap[];
  opportunities: CommercialGraphArtifact['opportunities'];
  workOrders: CommercialGraphArtifact['workOrders'];
}): CommercialGraphArtifact['executiveMemo'] {
  const siteSays =
    input.siteOnly?.whatTheSiteSays?.[0] ??
    input.aeo?.business_summary ??
    `${input.projectName} presents a commercial offer on the crawled site.`;

  const gscSays =
    input.queryCount > 0
      ? `Search Console shows ${input.queryCount} tracked queries${input.topQuery ? `; top demand includes “${input.topQuery}”` : ''}.`
      : 'Search Console demand is not available on this run.';

  const ga4Says =
    input.ga4Sessions > 0
      ? `GA4 shows ${input.ga4Sessions} sessions across landing pages in the window.`
      : 'GA4 engagement is not available on this run.';

  const aiSays =
    input.aeo?.business_summary ??
    input.siteOnly?.inferred?.businessAppearance ??
    'AI inference was limited; graph relies on crawl and intake.';

  const topGap = input.gaps[0];
  const topOpp = input.opportunities[0];
  const topWo = input.workOrders[0];

  return {
    whatTheSiteIsSaying: siteSays,
    whatSearchConsoleIsSaying: gscSays,
    whatGa4IsSaying: ga4Says,
    whatAiIsInferring: aiSays,
    whatTheGraphShows: `Coverage score ${input.scores.completenessScore}/100 with ${input.scores.missingNodeCount} missing nodes and ${input.scores.disconnectedClaimCount} unproven claims.`,
    whatMattersMost:
      topGap?.gap ??
      'Strengthen ICP → page → offer → proof → CTA paths before expanding page volume.',
    whatToFixFirst: topWo?.title ?? topGap?.fix ?? 'Close the highest-priority lead blocker.',
    whatPageSystemsToBuild:
      topOpp?.patternName ??
      'No strong page-play system detected yet; validate ICP and offer pages first.',
    whatNextgridShouldExecute:
      topWo?.summary ??
      'Execute the top Fix Queue items that unblock leads and connect buyer paths.',
  };
}

export function analyzeCommercialGraph(input: {
  projectName: string;
  websiteUrl: string;
  pages: CrawledPage[];
  intake: ArchitectureInput | null;
  aeo: AeoAnalysis | null;
  siteOnly: SiteOnlyAnalysis | null;
  queries: Array<{ query: string; impressions: number; clicks: number; page_path: string | null }>;
  ga4Landings: Array<{ path: string; sessions: number }>;
  findings?: Array<{ id: string; title: string; page_path: string | null }>;
}): CommercialGraphArtifact {
  const extracted = extractCommercialGraph(input);
  const entities = extracted.entities;
  const relationships = extracted.relationships;

  const gaps = buildGaps({ entities, relationships });
  const buyerPaths = buildBuyerPaths({
    entities,
    relationships,
    buyerMoments: input.siteOnly?.buyerMoments ?? [],
  });

  const missingPageKinds =
    input.siteOnly?.pageInventory
      .filter((i) => !i.present && i.kind !== 'other' && i.kind !== 'home' && i.expectedForCategory !== false)
      .map((i) => i.kind) ?? [];
  const hasIntegrationsSignal = input.pages.some((p) =>
    /integrat/i.test(`${p.path} ${p.title ?? ''} ${p.textExcerpt ?? ''}`)
  );

  const opportunities = detectProgrammaticOpportunities({
    entities,
    gaps,
    projectName: input.projectName,
    websiteUrl: input.websiteUrl,
    pages: input.pages,
    intake: input.intake,
    queries: input.queries,
    missingPageKinds,
    hasIntegrationsSignal,
    websiteCategory: input.siteOnly?.classification?.category ?? null,
  });

  const scores = scoreCommercialGraph({
    entities,
    relationships,
    buyerPaths,
    opportunities,
    aeoClarity: input.aeo?.clarity_score ?? null,
  });

  const workOrders = buildWorkOrders({
    projectName: input.projectName,
    websiteUrl: input.websiteUrl,
    gaps,
    opportunities,
  }).map((order) => ({
    ...order,
    findingId: matchFindingIdForWorkOrder(order.title, input.findings ?? []),
  }));

  const relationshipHealth = buildRelationshipHealth(entities, relationships, gaps);

  const topQuery = [...input.queries].sort((a, b) => b.impressions - a.impressions)[0]?.query ?? null;
  const ga4Sessions = input.ga4Landings.reduce((sum, row) => sum + row.sessions, 0);

  const executiveMemo = buildExecutiveMemo({
    projectName: input.projectName,
    siteOnly: input.siteOnly,
    aeo: input.aeo,
    queryCount: input.queries.length,
    topQuery,
    ga4Sessions,
    scores,
    gaps,
    opportunities,
    workOrders,
  });

  return {
    entities,
    relationships,
    gaps,
    buyerPaths,
    opportunities,
    workOrders,
    scores,
    relationshipHealth,
    executiveMemo,
  };
}

export function toCommercialGraphBriefSlice(
  artifact: CommercialGraphArtifact
): import('@/lib/graph/types').CommercialGraphBriefSlice {
  const entitiesByType: Record<
    string,
    Array<{ label: string; status: import('@/lib/graph/types').GraphEntityStatus; confidence: number }>
  > = {};
  for (const entity of artifact.entities) {
    const bucket = entitiesByType[entity.type] ?? [];
    bucket.push({
      label: entity.label,
      status: entity.status,
      confidence: entity.confidence,
    });
    entitiesByType[entity.type] = bucket;
  }

  const labelById = new Map(artifact.entities.map((e) => [e.localId, e.label]));

  return {
    scores: artifact.scores,
    topGaps: artifact.gaps.slice(0, 10).map((g) => ({
      gap: g.gap,
      gapType: g.gapType,
      impact: g.impact,
      fix: g.fix,
      confidence: g.confidence,
      priorityScore: g.priorityScore,
    })),
    topPaths: artifact.buyerPaths.slice(0, 10),
    topOpportunities: artifact.opportunities.slice(0, 8).map((o) => ({
      patternName: o.patternName,
      patternFamily: o.patternFamily,
      whyFits: o.whyFits,
      exampleTemplate: o.exampleTemplate,
      firstRecommendedPages: o.firstRecommendedPages,
      uniqueDataNeeded: o.uniqueDataNeeded,
      uniqueData: o.uniqueData,
      priority: o.priority,
      confidence: o.confidence,
      expectedBenefit: o.expectedBenefit,
      agentPrompt: o.agentPrompt,
      priorityScore: o.priorityScore,
      searchDemand: o.searchDemand,
      buyerIntent: o.buyerIntent,
      aiCitationValue: o.aiCitationValue,
      easeOfProduction: o.easeOfProduction,
      uniquenessRequirement: o.uniquenessRequirement,
      revenueImpact: o.revenueImpact,
      thinContentRisk: o.thinContentRisk,
      linkedGapTypes: o.linkedGapTypes,
      linkedEntityLabels: o.linkedEntityLabels,
      buyerPathSummary: o.buyerPathSummary,
      aeoFlags: o.aeoFlags,
      strategySummary: o.strategySummary,
      risksIfBad: o.risksIfBad,
    })),
    topWorkOrders: artifact.workOrders.slice(0, 10).map((w) => ({
      actionType: w.actionType,
      title: w.title,
      summary: w.summary,
      fullPrompt: w.fullPrompt,
      priorityScore: w.priorityScore,
    })),
    entitiesByType,
    relationships: artifact.relationships.slice(0, 80).map((r) => ({
      from: labelById.get(r.fromLocalId) ?? r.fromLocalId,
      to: labelById.get(r.toLocalId) ?? r.toLocalId,
      type: r.type,
      statusHint: r.type === 'missing' ? 'missing' : 'present',
    })),
    relationshipHealth: artifact.relationshipHealth,
    executiveMemo: artifact.executiveMemo,
  };
}
