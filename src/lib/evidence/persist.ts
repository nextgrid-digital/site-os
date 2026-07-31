import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import type { getSupabaseAdmin } from '@/lib/supabase/server';

type AdminClient = ReturnType<typeof getSupabaseAdmin>;

export async function persistBrandEvidenceRecord(input: {
  supabase: AdminClient;
  auditRunId: string;
  projectId: string;
  view: BrandEvidenceReportView;
}) {
  const { supabase, auditRunId, projectId, view } = input;

  if (view.evidence_inventory.first_party.length || view.evidence_inventory.third_party.length) {
    const rows = [
      ...view.evidence_inventory.first_party,
      ...view.evidence_inventory.third_party,
      ...view.evidence_inventory.customer,
      ...view.evidence_inventory.owned_media,
    ].slice(0, 500).map((e) => ({
      audit_run_id: auditRunId,
      project_id: projectId,
      subject: e.subject,
      relationship: e.relationship,
      object: e.object,
      source_type: e.source_type,
      source_title: e.source_title ?? null,
      source_url: e.source_url ?? null,
      evidence_text: e.evidence_text ?? null,
      published_at: e.published_at ?? null,
      observed_at: e.observed_at ?? view.generated_at,
      first_observed_at: e.first_observed_at ?? e.observed_at ?? view.generated_at,
      last_observed_at: e.last_observed_at ?? e.observed_at ?? view.generated_at,
      confidence: e.confidence,
      independence: e.independence,
      verification_status: e.verification_status,
      extraction_method: e.extraction_method,
      limitation: e.limitation ?? null,
      metadata: e.metadata ?? {},
    }));
    if (rows.length) await supabase.from('evidence_records').insert(rows);
  }

  if (view.identity.length) {
    await supabase.from('company_identity_fields').insert(
      view.identity.map((f) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...f,
      }))
    );
  }

  if (view.descriptions.length) {
    await supabase.from('company_descriptions').insert(
      view.descriptions.map((d) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...d,
      }))
    );
  }

  if (view.associations.length) {
    await supabase.from('brand_associations').insert(
      view.associations.map((a) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...a,
      }))
    );
  }

  for (const claim of view.claims.slice(0, 40)) {
    const { data: claimRow } = await supabase
      .from('brand_claims')
      .insert({
        audit_run_id: auditRunId,
        project_id: projectId,
        claim_text: claim.claim_text,
        claiming_source_url: claim.claiming_source_url,
        claiming_excerpt: claim.claiming_excerpt,
        corroboration_count: claim.corroboration_count,
        contradiction_count: claim.contradiction_count,
        verification_status: claim.verification_status,
        observed_at: claim.observed_at,
        confidence: claim.confidence,
      })
      .select('id')
      .single();
    if (claimRow?.id && claim.evidence.length) {
      await supabase.from('brand_claim_evidence').insert(
        claim.evidence.map((e) => ({
          claim_id: claimRow.id,
          role: e.role,
          source_url: e.source_url,
          excerpt: e.excerpt,
          independence: e.independence,
        }))
      );
    }
  }

  if (view.buyer_coverage.length) {
    await supabase.from('buyer_question_coverage').insert(
      view.buyer_coverage.map((b) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...b,
      }))
    );
  }

  if (view.content_coverage.length) {
    await supabase.from('content_coverage').insert(
      view.content_coverage.map((c) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...c,
      }))
    );
  }

  if (view.technical.length) {
    await supabase.from('technical_observations').insert(
      view.technical.map((t) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...t,
      }))
    );
  }

  if (view.contradictions.length) {
    await supabase.from('brand_contradictions').insert(
      view.contradictions.map((c) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...c,
      }))
    );
  }

  if (view.external_sources.length) {
    await supabase.from('external_sources').insert(
      view.external_sources.map((s) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        source_title: s.source_title,
        source_type: s.source_type,
        source_url: s.source_url,
        related_topic: s.related_topic,
        publication_date: s.publication_date,
        observed_at: s.observed_at,
        evidence_excerpt: s.evidence_excerpt,
        independence: s.independence,
      }))
    );
  }

  if (view.sampled_ai.length) {
    await supabase.from('prompt_runs').insert(
      view.sampled_ai.map((p) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ai_system: p.ai_system,
        prompt: p.prompt,
        prompt_category: p.prompt_category,
        market_assumption: p.market_assumption,
        run_at: p.run_at,
        brand_mentioned: p.brand_mentioned,
        competitors_mentioned: p.competitors_mentioned,
        company_website_cited: p.company_website_cited,
        external_sources_cited: p.external_sources_cited,
        brand_description: p.brand_description,
        associated_topics: p.associated_topics,
        answer_summary: p.answer_summary,
        confidence: p.confidence,
        limitations: p.limitations,
      }))
    );
  }

  if (view.competitors.length) {
    await supabase.from('competitor_observations').insert(
      view.competitors.map((c) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        ...c,
      }))
    );
  }

  if (view.historical_changes.length) {
    await supabase.from('historical_changes').insert(
      view.historical_changes.map((h) => ({
        audit_run_id: auditRunId,
        project_id: projectId,
        previous_audit_run_id: h.previous_audit_run_id ?? null,
        event_type: h.event_type,
        previous_value: h.previous_value,
        current_value: h.current_value,
        first_observed_at: h.first_observed_at,
        change_observed_at: h.change_observed_at,
        source: h.source,
        confidence: h.confidence,
      }))
    );
  }

  await supabase.from('brand_evidence_snapshots').upsert(
    {
      audit_run_id: auditRunId,
      project_id: projectId,
      schema_version: view.schema_version,
      snapshot: view,
    },
    { onConflict: 'audit_run_id' }
  );

  await supabase.from('report_exports').insert({
    audit_run_id: auditRunId,
    project_id: projectId,
    title: `${view.executive.company_name} Brand Evidence Record`,
    report_type: 'brand_evidence_record',
    snapshot: view,
  });
}

export async function loadLatestBrandEvidenceSnapshot(
  supabase: AdminClient,
  projectId: string
): Promise<BrandEvidenceReportView | null> {
  const { data } = await supabase
    .from('brand_evidence_snapshots')
    .select('snapshot')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.snapshot) return null;
  return data.snapshot as BrandEvidenceReportView;
}

/** Second-newest snapshot for the project (for Compare / metric deltas). */
export async function loadPreviousBrandEvidenceSnapshot(
  supabase: AdminClient,
  projectId: string,
  currentAuditRunId?: string | null
): Promise<BrandEvidenceReportView | null> {
  if (currentAuditRunId) {
    const { data } = await supabase
      .from('brand_evidence_snapshots')
      .select('snapshot')
      .eq('project_id', projectId)
      .neq('audit_run_id', currentAuditRunId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data?.snapshot) return null;
    return data.snapshot as BrandEvidenceReportView;
  }

  const { data } = await supabase
    .from('brand_evidence_snapshots')
    .select('snapshot')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(2);
  const previous = data?.[1];
  if (!previous?.snapshot) return null;
  return previous.snapshot as BrandEvidenceReportView;
}

export async function loadBrandEvidenceForAuditRun(
  supabase: AdminClient,
  auditRunId: string
): Promise<BrandEvidenceReportView | null> {
  const { data } = await supabase
    .from('brand_evidence_snapshots')
    .select('snapshot')
    .eq('audit_run_id', auditRunId)
    .maybeSingle();
  if (data?.snapshot) return data.snapshot as BrandEvidenceReportView;

  const { data: exportRow } = await supabase
    .from('report_exports')
    .select('snapshot')
    .eq('audit_run_id', auditRunId)
    .eq('report_type', 'brand_evidence_record')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (exportRow?.snapshot as BrandEvidenceReportView) ?? null;
}
