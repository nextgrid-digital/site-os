import type { SupabaseClient } from '@supabase/supabase-js';
import type { CommercialGraphArtifact } from '@/lib/graph/types';

export async function persistCommercialGraph(input: {
  supabase: SupabaseClient;
  projectId: string;
  auditRunId: string;
  artifact: CommercialGraphArtifact;
}): Promise<void> {
  const { supabase, projectId, auditRunId, artifact } = input;

  const entityRows = artifact.entities.map((entity) => ({
    project_id: projectId,
    audit_run_id: auditRunId,
    type: entity.type,
    label: entity.label,
    source: entity.source,
    confidence: entity.confidence,
    metadata: { ...entity.metadata, localId: entity.localId },
    status: entity.status,
  }));

  const { data: insertedEntities, error: entityError } =
    entityRows.length > 0
      ? await supabase.from('graph_entities').insert(entityRows).select('id, metadata')
      : { data: [] as Array<{ id: string; metadata: Record<string, unknown> }>, error: null };

  if (entityError) throw new Error(entityError.message);

  const localToDb = new Map<string, string>();
  for (const row of insertedEntities ?? []) {
    const localId = typeof row.metadata?.localId === 'string' ? row.metadata.localId : null;
    if (localId) localToDb.set(localId, row.id);
  }

  const relationshipRows = artifact.relationships.flatMap((rel) => {
    const fromId = localToDb.get(rel.fromLocalId);
    const toId = localToDb.get(rel.toLocalId);
    if (!fromId || !toId) return [];
    return [
      {
        project_id: projectId,
        audit_run_id: auditRunId,
        from_entity_id: fromId,
        to_entity_id: toId,
        type: rel.type,
        confidence: rel.confidence,
        evidence: rel.evidence,
        source: rel.source,
      },
    ];
  });

  if (relationshipRows.length > 0) {
    const { error } = await supabase.from('graph_relationships').insert(relationshipRows);
    if (error) throw new Error(error.message);
  }

  const { error: summaryError } = await supabase.from('graph_summaries').insert({
    project_id: projectId,
    audit_run_id: auditRunId,
    completeness_score: artifact.scores.completenessScore,
    entity_completeness: artifact.scores.entityCompleteness,
    relationship_completeness: artifact.scores.relationshipCompleteness,
    proof_density: artifact.scores.proofDensity,
    buyer_path_coverage: artifact.scores.buyerPathCoverage,
    search_coverage: artifact.scores.searchCoverage,
    cta_coverage: artifact.scores.ctaCoverage,
    aeo_clarity: artifact.scores.aeoClarity,
    programmatic_readiness: artifact.scores.programmaticReadiness,
    missing_node_count: artifact.scores.missingNodeCount,
    disconnected_claim_count: artifact.scores.disconnectedClaimCount,
    query_page_match_rate: artifact.scores.queryPageMatchRate,
    programmatic_opportunity_count: artifact.scores.programmaticOpportunityCount,
    overview: {
      relationshipHealth: artifact.relationshipHealth,
      executiveMemo: artifact.executiveMemo,
    },
  });
  if (summaryError) throw new Error(summaryError.message);

  const gapRows = artifact.gaps.map((gap) => ({
    project_id: projectId,
    audit_run_id: auditRunId,
    gap: gap.gap,
    gap_type: gap.gapType,
    impact: gap.impact,
    fix: gap.fix,
    confidence: gap.confidence,
    entity_ids: gap.entityLocalIds
      .map((localId) => localToDb.get(localId))
      .filter((id): id is string => Boolean(id)),
    revenue_impact: gap.revenueImpact,
    buyer_importance: gap.buyerImportance,
    urgency: gap.urgency,
    execution_difficulty: gap.executionDifficulty,
    aeo_value: gap.aeoValue,
    programmatic_potential: gap.programmaticPotential,
    priority_score: gap.priorityScore,
  }));

  const { data: insertedGaps, error: gapError } =
    gapRows.length > 0
      ? await supabase.from('graph_gaps').insert(gapRows).select('id')
      : { data: [] as Array<{ id: string }>, error: null };
  if (gapError) throw new Error(gapError.message);

  const pathRows = artifact.buyerPaths.map((path) => ({
    project_id: projectId,
    audit_run_id: auditRunId,
    query_label: path.queryLabel,
    buyer_moment: path.buyerMoment,
    page_label: path.pageLabel,
    offer_label: path.offerLabel,
    proof_label: path.proofLabel,
    cta_label: path.ctaLabel,
    missing_steps: path.missingSteps,
    completeness: path.completeness,
    priority_score: path.priorityScore,
    metadata: path.metadata,
  }));

  if (pathRows.length > 0) {
    const { error } = await supabase.from('buyer_paths').insert(pathRows);
    if (error) throw new Error(error.message);
  }

  const opportunityRows = artifact.opportunities.map((opp) => ({
    project_id: projectId,
    audit_run_id: auditRunId,
    pattern_name: opp.patternName,
    pattern_family: opp.patternFamily,
    why_fits: opp.whyFits,
    example_template: opp.exampleTemplate,
    first_recommended_pages: opp.firstRecommendedPages,
    unique_data_needed: opp.uniqueDataNeeded,
    unique_data: opp.uniqueData,
    priority: opp.priority,
    confidence: opp.confidence,
    expected_benefit: opp.expectedBenefit,
    agent_prompt: opp.agentPrompt,
    priority_score: opp.priorityScore,
    search_demand: opp.searchDemand,
    buyer_intent: opp.buyerIntent,
    ai_citation_value: opp.aiCitationValue,
    ease_of_production: opp.easeOfProduction,
    uniqueness_requirement: opp.uniquenessRequirement,
    revenue_impact: opp.revenueImpact,
    thin_content_risk: opp.thinContentRisk,
    linked_gap_types: opp.linkedGapTypes,
    linked_entity_labels: opp.linkedEntityLabels,
    buyer_path_summary: opp.buyerPathSummary,
    aeo_flags: opp.aeoFlags,
    strategy_summary: opp.strategySummary,
    risks_if_bad: opp.risksIfBad,
  }));

  const { data: insertedOpps, error: oppError } =
    opportunityRows.length > 0
      ? await supabase.from('programmatic_opportunities').insert(opportunityRows).select('id')
      : { data: [] as Array<{ id: string }>, error: null };
  if (oppError) throw new Error(oppError.message);

  const workOrderRows = artifact.workOrders.map((order) => ({
    project_id: projectId,
    audit_run_id: auditRunId,
    action_type: order.actionType,
    title: order.title,
    summary: order.summary,
    gap_id:
      order.gapIndex != null && insertedGaps?.[order.gapIndex]
        ? insertedGaps[order.gapIndex].id
        : null,
    opportunity_id:
      order.opportunityIndex != null && insertedOpps?.[order.opportunityIndex]
        ? insertedOpps[order.opportunityIndex].id
        : null,
    finding_id: order.findingId ?? null,
    full_prompt: order.fullPrompt,
    revenue_impact: order.revenueImpact,
    buyer_importance: order.buyerImportance,
    urgency: order.urgency,
    execution_difficulty: order.executionDifficulty,
    confidence: order.confidence,
    aeo_value: order.aeoValue,
    programmatic_potential: order.programmaticPotential,
    priority_score: order.priorityScore,
    status: 'open',
    next_action: order.summary,
  }));

  if (workOrderRows.length > 0) {
    const { error } = await supabase.from('graph_work_orders').insert(workOrderRows);
    if (error) throw new Error(error.message);
  }
}
