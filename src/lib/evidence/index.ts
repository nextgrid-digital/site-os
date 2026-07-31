export { buildBrandEvidenceRecord } from '@/lib/evidence/build-brand-evidence-record';
export {
  collectExternalSources,
  collectSampledAiObservations,
} from '@/lib/evidence/collectors';
export { diffBrandEvidenceRecords } from '@/lib/evidence/historical';
export {
  assertNoPrescriptiveLanguage,
  collectReportTexts,
  findPrescriptiveLanguage,
} from '@/lib/evidence/language-guard';
export {
  loadBrandEvidenceForAuditRun,
  loadLatestBrandEvidenceSnapshot,
  loadPreviousBrandEvidenceSnapshot,
  persistBrandEvidenceRecord,
} from '@/lib/evidence/persist';
export type { BrandEvidenceReportView } from '@/lib/evidence/types';
export { BER_SCHEMA_VERSION } from '@/lib/evidence/types';
