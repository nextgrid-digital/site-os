import type { BrandEvidenceReportView, HistoricalChangeEvent } from '@/lib/evidence/types';

function setFromAssociations(view: BrandEvidenceReportView) {
  return new Set(view.associations.map((a) => a.topic.toLowerCase()));
}

function setFromClaims(view: BrandEvidenceReportView) {
  return new Set(view.claims.map((c) => c.claim_text.toLowerCase()));
}

function setFromContent(view: BrandEvidenceReportView) {
  return new Set(
    view.content_coverage
      .filter((c) => c.page_count > 0)
      .map((c) => c.content_type)
  );
}

/**
 * Compare current BER snapshot to previous; produce neutral change events.
 */
export function diffBrandEvidenceRecords(
  previous: BrandEvidenceReportView | null,
  current: BrandEvidenceReportView,
  previousAuditRunId: string | null
): HistoricalChangeEvent[] {
  if (!previous) return [];

  const observedAt = current.generated_at;
  const events: HistoricalChangeEvent[] = [];
  const prevTopics = setFromAssociations(previous);
  const currTopics = setFromAssociations(current);

  for (const topic of currTopics) {
    if (!prevTopics.has(topic)) {
      events.push({
        event_type: 'category_added',
        previous_value: null,
        current_value: topic,
        first_observed_at: observedAt,
        change_observed_at: observedAt,
        source: 'brand_associations',
        confidence: 0.7,
        previous_audit_run_id: previousAuditRunId,
      });
    }
  }
  for (const topic of prevTopics) {
    if (!currTopics.has(topic)) {
      events.push({
        event_type: 'category_removed',
        previous_value: topic,
        current_value: null,
        first_observed_at: null,
        change_observed_at: observedAt,
        source: 'brand_associations',
        confidence: 0.7,
        previous_audit_run_id: previousAuditRunId,
      });
    }
  }

  const prevClaims = setFromClaims(previous);
  const currClaims = setFromClaims(current);
  for (const claim of currClaims) {
    if (!prevClaims.has(claim)) {
      events.push({
        event_type: 'claim_added',
        previous_value: null,
        current_value: claim.slice(0, 200),
        first_observed_at: observedAt,
        change_observed_at: observedAt,
        source: 'brand_claims',
        confidence: 0.65,
        previous_audit_run_id: previousAuditRunId,
      });
    }
  }
  for (const claim of prevClaims) {
    if (!currClaims.has(claim)) {
      events.push({
        event_type: 'claim_removed',
        previous_value: claim.slice(0, 200),
        current_value: null,
        first_observed_at: null,
        change_observed_at: observedAt,
        source: 'brand_claims',
        confidence: 0.65,
        previous_audit_run_id: previousAuditRunId,
      });
    }
  }

  const prevContent = setFromContent(previous);
  const currContent = setFromContent(current);
  for (const type of currContent) {
    if (!prevContent.has(type)) {
      events.push({
        event_type: 'content_type_added',
        previous_value: null,
        current_value: type,
        first_observed_at: observedAt,
        change_observed_at: observedAt,
        source: 'content_coverage',
        confidence: 0.8,
        previous_audit_run_id: previousAuditRunId,
      });
    }
  }
  for (const type of prevContent) {
    if (!currContent.has(type)) {
      events.push({
        event_type: 'content_type_removed',
        previous_value: type,
        current_value: null,
        first_observed_at: null,
        change_observed_at: observedAt,
        source: 'content_coverage',
        confidence: 0.8,
        previous_audit_run_id: previousAuditRunId,
      });
    }
  }

  if (previous.executive.pages_analyzed !== current.executive.pages_analyzed) {
    events.push({
      event_type: 'pages_analyzed_changed',
      previous_value: String(previous.executive.pages_analyzed),
      current_value: String(current.executive.pages_analyzed),
      first_observed_at: null,
      change_observed_at: observedAt,
      source: 'methodology',
      confidence: 1,
      previous_audit_run_id: previousAuditRunId,
    });
  }

  const prevAi = previous.executive.sampled_prompts_tested;
  const currAi = current.executive.sampled_prompts_tested;
  if (currAi > prevAi) {
    events.push({
      event_type: 'ai_mentions_sample_expanded',
      previous_value: String(prevAi),
      current_value: String(currAi),
      first_observed_at: observedAt,
      change_observed_at: observedAt,
      source: 'sampled_ai',
      confidence: 0.9,
      previous_audit_run_id: previousAuditRunId,
    });
  }

  return events.slice(0, 50);
}
