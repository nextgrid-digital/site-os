/** Brand Evidence Record — shared enums and structured observation types. */

export const BER_SCHEMA_VERSION = 1;

export type EvidenceIndependence =
  | 'first_party'
  | 'third_party'
  | 'customer'
  | 'ai_sample'
  | 'owned_media';

export type VerificationStatus =
  | 'directly_observed'
  | 'first_party_claim_only'
  | 'independently_corroborated'
  | 'supported_by_customer_evidence'
  | 'conflicting_evidence_identified'
  | 'insufficient_public_evidence'
  | 'unable_to_verify';

export type AssociationClassification =
  | 'consistently_supported'
  | 'primarily_first_party'
  | 'independently_corroborated'
  | 'weakly_supported'
  | 'conflicting_evidence'
  | 'not_identified';

export type CoverageStatus =
  | 'clearly_covered'
  | 'partially_covered'
  | 'indirectly_covered'
  | 'not_identified'
  | 'conflicting_information';

export type ContradictionStatus =
  | 'unresolved'
  | 'likely_outdated_source'
  | 'source_specific_variation'
  | 'confirmed_change_over_time'
  | 'unable_to_determine';

export type TechnicalStatus =
  | 'detected'
  | 'not_detected'
  | 'allowed'
  | 'disallowed'
  | 'inconsistent'
  | 'unable_to_verify';

export type ContentEvidenceStrength =
  | 'identified'
  | 'not_identified'
  | 'partial';

export interface EvidenceRecordInput {
  subject: string;
  relationship: string;
  object: string;
  source_type: string;
  source_title?: string | null;
  source_url?: string | null;
  evidence_text?: string | null;
  published_at?: string | null;
  observed_at?: string;
  first_observed_at?: string;
  last_observed_at?: string;
  confidence: number;
  independence: EvidenceIndependence;
  verification_status: VerificationStatus;
  extraction_method: string;
  limitation?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CompanyIdentityField {
  field_key: string;
  field_value: string | null;
  source_type: string;
  source_url: string | null;
  observed_at: string;
  confidence: number;
  has_conflict: boolean;
  conflict_note: string | null;
}

export interface CompanyDescription {
  description_text: string;
  source_type: string;
  source_title: string | null;
  source_url: string | null;
  observed_at: string;
  category_terms: string[];
  audience_terms: string[];
  capability_terms: string[];
  flags: string[];
}

export interface BrandAssociation {
  topic: string;
  first_party_count: number;
  third_party_count: number;
  ai_appearance_count: number;
  supporting_urls: string[];
  first_observed_at: string | null;
  last_observed_at: string | null;
  confidence: number;
  classification: AssociationClassification;
}

export interface BrandClaim {
  claim_text: string;
  claiming_source_url: string | null;
  claiming_excerpt: string | null;
  corroboration_count: number;
  contradiction_count: number;
  verification_status: VerificationStatus;
  observed_at: string;
  confidence: number;
  evidence: Array<{
    role: string;
    source_url: string | null;
    excerpt: string | null;
    independence: EvidenceIndependence;
  }>;
}

export interface BuyerQuestionCoverage {
  question_group: string;
  question: string;
  coverage_status: CoverageStatus;
  page_urls: string[];
  evidence_excerpt: string | null;
  source_count: number;
  confidence: number;
}

export interface ContentCoverageItem {
  content_type: string;
  page_count: number;
  urls: string[];
  topics: string[];
  latest_observed_at: string | null;
  oldest_observed_at: string | null;
  evidence_strength: ContentEvidenceStrength;
}

export interface TechnicalObservation {
  observation_key: string;
  status: TechnicalStatus;
  detail: string | null;
  source_url: string | null;
  observed_at: string;
}

export interface BrandContradiction {
  subject: string;
  version_a: string;
  source_a: string | null;
  source_a_url: string | null;
  version_b: string;
  source_b: string | null;
  source_b_url: string | null;
  observed_at: string;
  confidence: number;
  status: ContradictionStatus;
}

export interface ExternalSourceItem {
  source_title: string | null;
  source_type: string;
  source_url: string | null;
  related_topic: string | null;
  publication_date: string | null;
  observed_at: string;
  evidence_excerpt: string | null;
  independence: EvidenceIndependence;
}

export interface PromptRunObservation {
  ai_system: string;
  prompt: string;
  prompt_category: string;
  market_assumption: string | null;
  run_at: string;
  brand_mentioned: boolean;
  competitors_mentioned: string[];
  company_website_cited: boolean;
  external_sources_cited: string[];
  brand_description: string | null;
  associated_topics: string[];
  answer_summary: string | null;
  confidence: number;
  limitations: string | null;
}

export interface CompetitorObservation {
  competitor_name: string;
  prompt_appearances: number;
  associated_categories: string[];
  cited_sources: string[];
  ai_description: string | null;
}

export interface HistoricalChangeEvent {
  event_type: string;
  previous_value: string | null;
  current_value: string | null;
  first_observed_at: string | null;
  change_observed_at: string;
  source: string | null;
  confidence: number;
  previous_audit_run_id?: string | null;
}

export interface KeyObservation {
  title: string;
  statement: string;
  evidence_text: string | null;
  source_url: string | null;
  source_type: string;
  observed_at: string;
  confidence: number;
  limitation: string | null;
  related_claim_or_topic: string | null;
}

export interface ExecutiveEvidenceSummary {
  company_name: string;
  domain: string;
  audit_date: string;
  data_collection_period: string;
  sources_analyzed: string[];
  pages_analyzed: number;
  sampled_prompts_tested: number;
  external_sources_identified: number;
  major_categories_detected: string[];
  strongest_supported_association: string | null;
  weakest_intended_association: string | null;
  largest_description_inconsistency: string | null;
  major_data_limitation: string;
  narrative: string;
}

export interface MethodologyLimitations {
  pages_analyzed: number;
  page_urls: string[];
  sources_searched: string[];
  prompts_tested: number;
  models_used: string[];
  audit_date: string;
  crawl_limitations: string[];
  data_availability_notes: string[];
  sampling_limitations: string[];
  unavailable_sources: string[];
  absence_disclaimer: string;
}

export interface BrandEvidenceReportView {
  schema_version: number;
  generated_at: string;
  executive: ExecutiveEvidenceSummary;
  identity: CompanyIdentityField[];
  descriptions: CompanyDescription[];
  associations: BrandAssociation[];
  claims: BrandClaim[];
  key_observations: KeyObservation[];
  buyer_coverage: BuyerQuestionCoverage[];
  sampled_ai: PromptRunObservation[];
  competitors: CompetitorObservation[];
  evidence_inventory: {
    first_party: EvidenceRecordInput[];
    third_party: EvidenceRecordInput[];
    customer: EvidenceRecordInput[];
    owned_media: EvidenceRecordInput[];
  };
  source_distribution: Array<{
    source_group: string;
    source_count: number;
    related_topics: string[];
    first_observed_at: string | null;
    latest_observed_at: string | null;
    independence: string;
  }>;
  content_coverage: ContentCoverageItem[];
  technical: TechnicalObservation[];
  contradictions: BrandContradiction[];
  historical_changes: HistoricalChangeEvent[];
  methodology: MethodologyLimitations;
  external_sources: ExternalSourceItem[];
  ai_sample_disclaimer: string;
}
