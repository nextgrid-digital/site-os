import { generateGraphWorkOrderPrompt } from '@/lib/audit/prompt-generator';
import type {
  DraftGraphGap,
  DraftGraphWorkOrder,
  DraftProgrammaticOpportunity,
} from '@/lib/graph/types';

export function buildWorkOrders(input: {
  projectName: string;
  websiteUrl: string;
  gaps: DraftGraphGap[];
  opportunities: DraftProgrammaticOpportunity[];
}): DraftGraphWorkOrder[] {
  const orders: DraftGraphWorkOrder[] = [];

  input.gaps.slice(0, 12).forEach((gap, gapIndex) => {
    const actionType =
      gap.gapType === 'unproven_claim'
        ? 'add_proof'
        : gap.gapType === 'missing_cta'
          ? 'add_cta'
          : gap.gapType === 'query_without_page'
            ? 'create_node'
            : gap.gapType === 'missing_faq'
              ? 'add_faq_schema'
              : gap.gapType.includes('connect')
                ? 'connect_node'
                : gap.gapType.includes('rewrite')
                  ? 'rewrite_node'
                  : 'create_node';

    orders.push({
      actionType,
      title: gap.gap,
      summary: gap.fix,
      gapIndex,
      opportunityIndex: null,
      fullPrompt: generateGraphWorkOrderPrompt({
        projectName: input.projectName,
        websiteUrl: input.websiteUrl,
        actionType,
        title: gap.gap,
        graphIssue: gap.impact,
        missingNodeOrEdge: gap.gap,
        buyerMoment: 'Evaluation',
        pageOrSystem: gap.fix,
        proofNeeded: gap.gapType === 'unproven_claim' ? 'Supporting proof asset or case study' : 'Relevant proof if available',
        ctaNeeded: gap.gapType === 'missing_cta' ? 'Primary conversion CTA' : 'Ensure CTA matches buyer intent',
        faqSchemaGuidance: 'Add FAQ/schema only where it answers a real objection',
        internalLinks: 'Connect related ICP, offer, proof, and conversion pages',
        constraints: 'Universal agent prompt. Do not invent proof or competitors. Preserve brand tone.',
        acceptanceCriteria: gap.fix,
      }),
      revenueImpact: gap.revenueImpact,
      buyerImportance: gap.buyerImportance,
      urgency: gap.urgency,
      executionDifficulty: gap.executionDifficulty,
      confidence: gap.confidence,
      aeoValue: gap.aeoValue,
      programmaticPotential: gap.programmaticPotential,
      priorityScore: gap.priorityScore,
    });
  });

  input.opportunities.slice(0, 8).forEach((opp, opportunityIndex) => {
    orders.push({
      actionType: 'create_page_system',
      title: opp.patternName,
      summary: opp.strategySummary || opp.whyFits,
      gapIndex: null,
      opportunityIndex,
      fullPrompt: opp.agentPrompt,
      revenueImpact: opp.revenueImpact,
      buyerImportance: opp.buyerIntent,
      urgency: Math.round((opp.searchDemand + opp.buyerIntent) / 2),
      executionDifficulty: Math.round(100 - opp.easeOfProduction),
      confidence: opp.confidence,
      aeoValue: opp.aiCitationValue,
      programmaticPotential: Math.round(100 - opp.thinContentRisk * 0.4),
      priorityScore: opp.priorityScore,
    });
  });

  return orders.sort((a, b) => b.priorityScore - a.priorityScore);
}
