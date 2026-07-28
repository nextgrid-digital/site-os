import { generateGraphWorkOrderPrompt } from '@/lib/audit/prompt-generator';
import type { CrawledPage } from '@/lib/crawl/site-crawler';
import { PATTERN_CATALOG, type PatternCatalogEntry } from '@/lib/graph/pattern-catalog';
import { scoreProgrammaticPattern } from '@/lib/graph/programmatic-score';
import { classifyQueryPatterns, demandForFamily } from '@/lib/graph/query-patterns';
import type {
  DraftGraphEntity,
  DraftGraphGap,
  DraftProgrammaticOpportunity,
  ProgrammaticPatternFamily,
} from '@/lib/graph/types';
import { filterLeadFitOpportunities } from '@/lib/reports/presale-labels';
import type { ArchitectureInput } from '@/lib/supabase/types';

function labelsOf(
  entities: DraftGraphEntity[],
  type: DraftGraphEntity['type'],
  status?: DraftGraphEntity['status']
) {
  return entities
    .filter((e) => e.type === type && (!status || e.status === status))
    .map((e) => e.label);
}

function pageCorpus(pages: CrawledPage[]): string {
  return pages
    .map((p) => `${p.path} ${p.title ?? ''} ${p.h1 ?? ''} ${p.metaDescription ?? ''}`)
    .join(' ')
    .toLowerCase();
}

function siteAlreadyCovers(corpus: string, needles: RegExp[]): boolean {
  return needles.some((n) => n.test(corpus));
}

function gapTypesForFamily(
  family: ProgrammaticPatternFamily,
  gaps: DraftGraphGap[]
): string[] {
  const map: Record<ProgrammaticPatternFamily, string[]> = {
    profiles: ['icp_without_page', 'offer_without_page'],
    comparisons: ['query_without_page'],
    use_case: ['use_case_without_page', 'offer_without_use_case'],
    examples: ['use_case_without_page', 'unproven_claim'],
    integrations: ['query_without_page'],
    glossary: ['query_without_page'],
    templates: ['query_without_page'],
    converters: ['query_without_page'],
    directories: ['query_without_page'],
    curation: ['query_without_page', 'icp_without_page'],
    locations: ['query_without_page'],
    localization: ['query_without_page'],
  };
  const wanted = new Set(map[family] ?? []);
  return [...new Set(gaps.filter((g) => wanted.has(g.gapType)).map((g) => g.gapType))];
}

function buildBuyerPathSummary(input: {
  template: string;
  offer: string | null;
  proof: string | null;
  cta: string | null;
  sampleQuery: string | null;
  buyerMoment: string;
}): string {
  const query = input.sampleQuery ?? '—';
  const pageSystem = input.template;
  const offer = input.offer ?? 'missing offer';
  const proof = input.proof ?? 'missing proof';
  const cta = input.cta ?? 'missing CTA';
  return `Query (${query}) → Buyer Moment (${input.buyerMoment}) → Page System (${pageSystem}) → Offer (${offer}) → Proof (${proof}) → CTA (${cta})`;
}

function firstPagesFor(
  entry: PatternCatalogEntry,
  ctx: {
    product: string;
    icps: string[];
    competitors: string[];
    useCases: string[];
    matchingQueries: string[];
    locations: string[];
  }
): string[] {
  switch (entry.family) {
    case 'profiles':
      return ctx.icps.slice(0, 8).map((icp) => `${ctx.product} for ${icp}`);
    case 'comparisons':
      if (entry.exampleTemplate.includes('alternatives')) {
        return [`${ctx.product} alternatives`, ...ctx.competitors.slice(0, 4).map((c) => `${c} alternative`)];
      }
      return ctx.competitors.slice(0, 8).map((c) => `${ctx.product} vs ${c}`);
    case 'integrations':
      return [
        `${ctx.product} integrations`,
        ...ctx.matchingQueries.slice(0, 6).map((q) => q),
      ].slice(0, 8);
    case 'use_case':
      return (ctx.useCases.length > 0 ? ctx.useCases : ctx.icps)
        .slice(0, 8)
        .map((u) => `${u} with ${ctx.product}`);
    case 'examples':
      return (ctx.useCases.length > 0 ? ctx.useCases : ctx.icps)
        .slice(0, 8)
        .map((u) => `${u} examples`);
    case 'glossary':
      return [
        `What is ${ctx.product}`,
        ...ctx.matchingQueries.filter((q) => /what is/i.test(q)).slice(0, 6),
      ].slice(0, 8);
    case 'templates':
      return (ctx.useCases.length > 0 ? ctx.useCases : [`${ctx.product} workflow`])
        .slice(0, 6)
        .map((u) => `${u} template`);
    case 'converters':
      return [`${ctx.product} ROI calculator`, `${ctx.product} cost estimator`].concat(
        ctx.matchingQueries.slice(0, 4)
      );
    case 'directories':
      return [`${ctx.product} directory`, `${ctx.product} categories`];
    case 'curation':
      return ctx.icps.slice(0, 5).map((icp) => `Best ${ctx.product} tools for ${icp}`);
    case 'locations':
      return ctx.locations.slice(0, 8).map((loc) => `${ctx.product} in ${loc}`);
    case 'localization':
      return ctx.matchingQueries.slice(0, 5);
    default: {
      const _exhaustive: never = entry.family;
      return _exhaustive;
    }
  }
}

function locationLabels(entities: DraftGraphEntity[], queries: string[]): string[] {
  const fromMeta: string[] = [];
  for (const q of queries) {
    const m = q.match(/\bin ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
    if (m?.[1]) fromMeta.push(m[1]);
  }
  const fromTopics = labelsOf(entities, 'topic').filter((t) =>
    /\b(city|region|location|local)\b/i.test(t)
  );
  return [...new Set([...fromMeta, ...fromTopics])].slice(0, 10);
}

export function detectProgrammaticOpportunities(input: {
  entities: DraftGraphEntity[];
  gaps: DraftGraphGap[];
  projectName: string;
  websiteUrl: string;
  pages: CrawledPage[];
  intake: ArchitectureInput | null;
  queries: Array<{ query: string; impressions: number; clicks: number; page_path: string | null }>;
  missingPageKinds: string[];
  hasIntegrationsSignal: boolean;
}): DraftProgrammaticOpportunity[] {
  const products = labelsOf(input.entities, 'product').concat(
    labelsOf(input.entities, 'offer').filter((o) => o.length > 1)
  );
  const icps = labelsOf(input.entities, 'icp');
  const useCases = labelsOf(input.entities, 'use_case');
  const competitors = labelsOf(input.entities, 'competitor');
  const proofs = labelsOf(input.entities, 'proof', 'found');
  const ctas = labelsOf(input.entities, 'cta', 'found');
  const primaryProduct = products[0] ?? input.projectName;
  const primaryOffer = labelsOf(input.entities, 'offer')[0] ?? primaryProduct;
  const primaryProof = proofs[0] ?? null;
  const primaryCta = ctas[0] ?? null;

  const corpus = pageCorpus(input.pages);
  const hits = classifyQueryPatterns(input.queries);
  const locations = locationLabels(
    input.entities,
    input.queries.map((q) => q.query)
  );

  const businessType = (input.intake?.business_type ?? '').toLowerCase();
  const siteType = (input.intake?.site_type ?? '').toLowerCase();
  const isLocalBiz = /local|agency|service|clinic|law|real.?estate/.test(
    `${businessType} ${siteType}`
  );

  const opportunities: DraftProgrammaticOpportunity[] = [];

  for (const entry of PATTERN_CATALOG) {
    const demand = demandForFamily(hits, entry.family);
    const linkedGaps = gapTypesForFamily(entry.family, input.gaps);
    const hasGraphTrigger = linkedGaps.length > 0;

    let hasNodeInventory = false;
    let coverageNeedles: RegExp[] = [];

    switch (entry.family) {
      case 'profiles':
        hasNodeInventory = icps.length > 0 && products.length + labelsOf(input.entities, 'offer').length > 0;
        coverageNeedles = [/for (teams?|agencies|startups?)/i, ...icps.slice(0, 2).map((i) => new RegExp(i.slice(0, 12), 'i'))];
        break;
      case 'comparisons':
        hasNodeInventory =
          competitors.length > 0 ||
          demand.matchingQueries.some((q) => /vs|alternative/i.test(q));
        // Only emit comparison/alternatives when competitor evidence OR comparison queries exist
        if (competitors.length === 0 && !demand.matchingQueries.length) {
          continue;
        }
        if (entry.exampleTemplate.includes('alternatives') && competitors.length === 0 && !demand.matchingQueries.some((q) => /alternative/i.test(q))) {
          continue;
        }
        if (!entry.exampleTemplate.includes('alternatives') && competitors.length === 0) {
          continue;
        }
        coverageNeedles = [/\bvs\b/i, /alternative/i];
        break;
      case 'integrations':
        hasNodeInventory =
          input.hasIntegrationsSignal ||
          demand.impressions > 0 ||
          labelsOf(input.entities, 'topic').some((t) => /integrat/i.test(t));
        if (!hasNodeInventory) continue;
        coverageNeedles = [/integrat/i];
        break;
      case 'use_case':
        hasNodeInventory = useCases.length > 0 || hasGraphTrigger;
        if (!hasNodeInventory) continue;
        coverageNeedles = [/use[- ]?case/i, /workflow/i];
        break;
      case 'examples':
        hasNodeInventory = useCases.length > 0 || icps.length > 0 || demand.impressions > 0;
        if (!hasNodeInventory) continue;
        coverageNeedles = [/examples?/i];
        break;
      case 'glossary':
        hasNodeInventory =
          demand.impressions > 0 ||
          input.missingPageKinds.includes('faq') ||
          labelsOf(input.entities, 'topic').some((t) => /missing page type|glossary|what is/i.test(t));
        if (!hasNodeInventory && !hasGraphTrigger) continue;
        coverageNeedles = [/what is/i, /glossary/i];
        break;
      case 'templates':
        hasNodeInventory = demand.impressions > 0 || /saas|software|platform/.test(businessType);
        if (!hasNodeInventory) continue;
        coverageNeedles = [/template/i, /generator/i];
        break;
      case 'converters':
        hasNodeInventory = demand.impressions > 0 || /saas|software|platform/.test(businessType);
        if (!hasNodeInventory) continue;
        coverageNeedles = [/calculator/i, /roi/i];
        break;
      case 'directories':
        hasNodeInventory = demand.impressions > 0 || /marketplace|directory|platform/.test(businessType);
        if (!hasNodeInventory) continue;
        coverageNeedles = [/directory/i, /marketplace/i];
        break;
      case 'curation':
        hasNodeInventory = icps.length > 0 || demand.impressions > 0;
        if (!hasNodeInventory) continue;
        coverageNeedles = [/\bbest\b/i, /top \d/i];
        break;
      case 'locations':
        hasNodeInventory = locations.length > 0 || (isLocalBiz && demand.impressions > 0);
        if (!hasNodeInventory) continue;
        coverageNeedles = locations.slice(0, 3).map((l) => new RegExp(l, 'i'));
        break;
      case 'localization':
        hasNodeInventory = demand.impressions > 0;
        if (!hasNodeInventory) continue;
        coverageNeedles = [/español|french|deutsch/i];
        break;
      default: {
        const _exhaustive: never = entry.family;
        void _exhaustive;
        continue;
      }
    }

    // Require at least one of: graph trigger, node inventory, or query demand
    if (!hasGraphTrigger && !hasNodeInventory && demand.impressions === 0) continue;

    const alreadyCovered = siteAlreadyCovers(corpus, coverageNeedles);
    // Still recommend if demand/gaps exist but coverage is partial; lower confidence via scoring

    const pages = firstPagesFor(entry, {
      product: primaryProduct,
      icps,
      competitors,
      useCases,
      matchingQueries: demand.matchingQueries,
      locations,
    }).filter((p) => p.trim().length > 2);

    if (pages.length === 0) continue;

    const dataAvailability = clampData(
      (icps.length > 0 ? 20 : 0) +
        (products.length > 0 ? 20 : 0) +
        (proofs.length > 0 ? 20 : 0) +
        (competitors.length > 0 ? 15 : 0) +
        (input.intake?.primary_offer ? 15 : 0) +
        (demand.impressions > 0 ? 10 : 0)
    );

    const scores = scoreProgrammaticPattern({
      family: entry.family,
      baseBuyerIntent: entry.baseBuyerIntent,
      baseAiCitation: entry.baseAiCitation,
      baseUniqueness: entry.baseUniqueness,
      baseThinRisk: entry.baseThinRisk + (alreadyCovered ? -10 : 0),
      queryImpressions: demand.impressions,
      hasGraphTrigger,
      hasNodeInventory,
      dataAvailability,
      revenueProximity:
        entry.family === 'comparisons' || entry.family === 'profiles' || entry.family === 'use_case'
          ? 80
          : entry.family === 'glossary'
            ? 45
            : 60,
    });

    const whyFits = buildWhyFits(entry, {
      product: primaryProduct,
      icps,
      competitors,
      demandQueries: demand.matchingQueries,
      linkedGaps,
      alreadyCovered,
    });

    const buyerPathSummary = buildBuyerPathSummary({
      template: entry.exampleTemplate,
      offer: primaryOffer,
      proof: primaryProof,
      cta: primaryCta,
      sampleQuery: demand.matchingQueries[0] ?? null,
      buyerMoment: entry.buyerMoment,
    });

    const uniqueDataNeeded = [
      entry.uniqueData.whatMakesUnique,
      entry.uniqueData.realDataNeeded,
      entry.uniqueData.proofNeeded,
      `Do not: ${entry.uniqueData.doNotTemplate}`,
    ].join(' | ');

    const strategySummary = `${entry.patternName}: build a repeatable system using template ${entry.exampleTemplate}. Start with ${Math.min(pages.length, 5)} evidence-backed pages, each with unique data and proof.`;

    const agentPrompt = [
      generateGraphWorkOrderPrompt({
        projectName: input.projectName,
        websiteUrl: input.websiteUrl,
        actionType: 'create_page_system',
        title: entry.patternName,
        graphIssue: whyFits,
        missingNodeOrEdge: pages.slice(0, 8).join('; '),
        buyerMoment: entry.buyerMoment,
        pageOrSystem: entry.exampleTemplate,
        proofNeeded: entry.uniqueData.proofNeeded,
        ctaNeeded: 'Primary CTA aligned to buyer moment on every page',
        faqSchemaGuidance: entry.aeoFlags.improvesAnswerability
          ? 'Add FAQ + FAQPage schema for top objections'
          : 'Add FAQ only where objections are real',
        internalLinks: 'Link hub ↔ children ↔ offer ↔ proof pages',
        constraints: `${entry.uniqueData.doNotTemplate} Universal agent prompt — no tool-specific variants.`,
        acceptanceCriteria: `Each page has unique data (${entry.uniqueData.realDataNeeded}), proof, CTA, and maps to ${buyerPathSummary}`,
      }),
      '',
      '## Unique data requirements',
      `What makes unique: ${entry.uniqueData.whatMakesUnique}`,
      `Real data needed: ${entry.uniqueData.realDataNeeded}`,
      `Proof needed: ${entry.uniqueData.proofNeeded}`,
      `Do not template: ${entry.uniqueData.doNotTemplate}`,
      '',
      '## Strategy summary',
      strategySummary,
      '',
      '## Risks if executed badly',
      entry.risksIfBad,
      '',
      '## Buyer path',
      buyerPathSummary,
      '',
      '## First pages',
      pages.slice(0, 10).map((p, i) => `${i + 1}. ${p}`).join('\n'),
    ].join('\n');

    opportunities.push({
      patternName: entry.patternName,
      patternFamily: entry.family,
      whyFits,
      exampleTemplate: entry.exampleTemplate,
      firstRecommendedPages: pages.slice(0, 10),
      uniqueDataNeeded,
      uniqueData: entry.uniqueData,
      priority: scores.priority,
      confidence: scores.confidence,
      expectedBenefit: entry.expectedBenefit,
      agentPrompt,
      priorityScore: scores.priorityScore,
      searchDemand: scores.searchDemand,
      buyerIntent: scores.buyerIntent,
      aiCitationValue: scores.aiCitationValue,
      easeOfProduction: scores.easeOfProduction,
      uniquenessRequirement: scores.uniquenessRequirement,
      revenueImpact: scores.revenueImpact,
      thinContentRisk: scores.thinContentRisk,
      linkedGapTypes: linkedGaps,
      linkedEntityLabels: [...icps.slice(0, 3), ...competitors.slice(0, 3), primaryProduct].filter(
        Boolean
      ),
      buyerPathSummary,
      aeoFlags: entry.aeoFlags,
      strategySummary,
      risksIfBad: entry.risksIfBad,
    });
  }

  return filterLeadFitOpportunities(
    opportunities.sort((a, b) => b.priorityScore - a.priorityScore)
  );
}

function clampData(n: number) {
  return Math.max(0, Math.min(100, n));
}

function buildWhyFits(
  entry: PatternCatalogEntry,
  ctx: {
    product: string;
    icps: string[];
    competitors: string[];
    demandQueries: string[];
    linkedGaps: string[];
    alreadyCovered: boolean;
  }
): string {
  const parts: string[] = [];
  parts.push(`${entry.patternName} fits ${ctx.product}`);
  if (ctx.icps.length) parts.push(`ICPs: ${ctx.icps.slice(0, 3).join(', ')}`);
  if (ctx.competitors.length) parts.push(`competitors in evidence: ${ctx.competitors.slice(0, 3).join(', ')}`);
  if (ctx.demandQueries.length)
    parts.push(`query patterns: ${ctx.demandQueries.slice(0, 3).join('; ')}`);
  if (ctx.linkedGaps.length) parts.push(`graph gaps: ${ctx.linkedGaps.join(', ')}`);
  if (ctx.alreadyCovered) parts.push('partial coverage exists — expand with unique data, do not duplicate');
  return parts.join('. ') + '.';
}
