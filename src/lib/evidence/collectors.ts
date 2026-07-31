import type {
  CompetitorObservation,
  ExternalSourceItem,
  PromptRunObservation,
} from '@/lib/evidence/types';

/**
 * Phase 3B stub: third-party collectors are not wired yet.
 * Returns an empty list so the report can show precise empty states.
 */
export async function collectExternalSources(_input: {
  domain: string;
  companyName: string;
  websiteUrl: string;
}): Promise<ExternalSourceItem[]> {
  return [];
}

/**
 * Phase 3C stub: sampled AI prompt runs are not executed yet.
 * Schema and UI support observations; collectors return empty until configured.
 */
export async function collectSampledAiObservations(_input: {
  domain: string;
  companyName: string;
  websiteUrl: string;
}): Promise<{ promptRuns: PromptRunObservation[]; competitors: CompetitorObservation[] }> {
  return { promptRuns: [], competitors: [] };
}
