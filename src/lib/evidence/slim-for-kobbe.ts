import type { BrandEvidenceReportView } from '@/lib/evidence/types';

/**
 * Shrink Brand Evidence for the Kobbe client island — keep only fields the UI reads.
 * Full snapshot stays available for server-only / on-demand paths.
 */
export function slimBrandEvidenceForKobbe(
  view: BrandEvidenceReportView | null
): BrandEvidenceReportView | null {
  if (!view) return null;

  return {
    schema_version: view.schema_version,
    generated_at: view.generated_at,
    executive: view.executive,
    identity: [],
    descriptions: [],
    associations: view.associations.slice(0, 6),
    claims: view.claims.slice(0, 8),
    key_observations: view.key_observations.slice(0, 10),
    buyer_coverage: [],
    sampled_ai: [],
    competitors: [],
    evidence_inventory: {
      first_party: [],
      third_party: [],
      customer: [],
      owned_media: [],
    },
    source_distribution: [],
    content_coverage: view.content_coverage.slice(0, 3),
    technical: [],
    contradictions: view.contradictions.slice(0, 4),
    historical_changes: [],
    methodology: view.methodology,
    external_sources: [],
    ai_sample_disclaimer: view.ai_sample_disclaimer,
  };
}
