import { z } from 'zod';

export const aeoAnalysisSchema = z.object({
  observed_inputs_summary: z.string(),
  business_summary: z.string(),
  inferred_icps: z.array(z.string()).default([]),
  inferred_primary_offer: z.string(),
  inferred_secondary_offers: z.array(z.string()).default([]),
  clarity_score: z.number().min(0).max(100),
  answerability_score: z.number().min(0).max(100),
  entity_clarity_notes: z.array(z.string()).default([]),
  missing_faq_opportunities: z.array(z.string()).default([]),
  missing_proof_opportunities: z.array(z.string()).default([]),
  missing_page_types: z.array(z.string()).default([]),
  suggested_aeo_rewrites: z
    .array(
      z.object({
        page_path: z.string().nullable().optional(),
        change: z.string(),
        why: z.string(),
      })
    )
    .default([]),
  risks_and_ambiguities: z.array(z.string()).default([]),
  confidence_notes: z.string(),
});

export type AeoAnalysis = z.infer<typeof aeoAnalysisSchema>;

export type AeoAnalysisStatus = 'completed' | 'skipped' | 'failed';

export interface AeoAnalysisRecord {
  id: string;
  audit_run_id: string;
  project_id: string;
  status: AeoAnalysisStatus;
  model: string | null;
  error_message: string | null;
  analysis: AeoAnalysis | null;
  created_at: string;
}
