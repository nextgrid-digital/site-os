export type ProjectStatus = 'active' | 'archived';
export type AuditRunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type AuditRunType = 'mini' | 'free' | 'full';
export type FindingSeverity = 'low' | 'medium' | 'high' | 'critical';
export type FindingStatus = 'open' | 'reviewed' | 'resolved';
export type LeadStage = 'new' | 'qualified' | 'proposal' | 'won' | 'lost';
export type LeadStatus = 'open' | 'follow_up' | 'stalled' | 'closed';

export interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
  full_brief_unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Website {
  id: string;
  project_id: string;
  url: string;
  domain: string;
  crawl_max_pages: number;
  created_at: string;
}

export interface GoogleConnection {
  id: string;
  operator_email: string;
  access_token: string;
  refresh_token: string | null;
  token_expiry: string | null;
  scopes: string[];
  /** Cached GSC/GA4/Ads list for this OAuth connection. */
  inventory?: {
    gsc?: Array<{ siteUrl: string; permissionLevel?: string | null }>;
    ga4?: Array<{ propertyId: string; propertyName: string; accountName: string }>;
    ads?: Array<{
      customerId: string;
      descriptiveName: string;
      currencyCode?: string | null;
      timeZone?: string | null;
    }>;
  } | null;
  inventory_synced_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchConsoleProperty {
  id: string;
  project_id: string;
  connection_id: string | null;
  property_url: string;
  site_url: string;
  is_selected: boolean;
  created_at: string;
}

export interface Ga4Property {
  id: string;
  project_id: string;
  connection_id: string | null;
  property_id: string;
  property_name: string;
  account_name: string | null;
  is_selected: boolean;
  created_at: string;
}

export interface GoogleAdsAccount {
  id: string;
  project_id: string;
  connection_id: string | null;
  customer_id: string;
  descriptive_name: string;
  currency_code: string | null;
  time_zone: string | null;
  is_selected: boolean;
  created_at: string;
}

export type AuditReadiness =
  | 'no_data'
  | 'search_console_only'
  | 'ga4_only'
  | 'full_data';

export interface DataAvailability {
  gscConnected: boolean;
  ga4Connected: boolean;
  adsConnected?: boolean;
  gscHasData: boolean;
  ga4HasData: boolean;
  adsHasData?: boolean;
  gscImpressions: number;
  ga4Sessions: number;
  adsSpend?: number;
  basedOn: Array<'crawl' | 'intake' | 'search_console' | 'ga4' | 'google_ads' | 'gemini'>;
}

export interface AuditRun {
  id: string;
  project_id: string;
  run_type: AuditRunType;
  status: AuditRunStatus;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  audit_readiness: AuditReadiness | null;
  data_availability: DataAvailability | null;
  site_only_analysis: Record<string, unknown> | null;
  confidence_score: number | null;
  created_at: string;
}

export interface AuditMetrics {
  id: string;
  audit_run_id: string;
  total_clicks: number;
  total_impressions: number;
  avg_ctr: number;
  avg_position: number;
  total_sessions: number;
  total_engaged_sessions: number;
  total_conversions: number;
  pages_crawled: number;
  findings_count: number;
  high_severity_count: number;
  created_at: string;
}

export interface PageMetric {
  id: string;
  audit_run_id: string;
  path: string;
  url: string;
  title: string | null;
  meta_description: string | null;
  h1: string | null;
  internal_link_count: number;
  has_faq: boolean;
  has_faq_schema: boolean;
  gsc_clicks: number;
  gsc_impressions: number;
  gsc_ctr: number;
  gsc_position: number;
  ga_sessions: number;
  ga_engaged_sessions: number;
  ga_conversions: number;
  flags: string[];
  created_at: string;
}

export interface QueryMetric {
  id: string;
  audit_run_id: string;
  query: string;
  page_path: string | null;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  opportunity_score: number;
  created_at: string;
}

export interface Finding {
  id: string;
  audit_run_id: string;
  project_id: string;
  type: string;
  category: string;
  severity: FindingSeverity;
  title: string;
  summary: string;
  page_path: string | null;
  evidence: Record<string, unknown>;
  status: FindingStatus;
  buyer_moment: string | null;
  estimated_value: string | null;
  revenue_impact: number | null;
  buyer_importance: number | null;
  urgency: number | null;
  execution_difficulty: number | null;
  confidence: number | null;
  aeo_value: number | null;
  priority_score: number | null;
  next_action?: string | null;
  created_at: string;
}

export interface AgentPrompt {
  id: string;
  finding_id: string;
  audit_run_id: string;
  context: string;
  page_path: string | null;
  evidence: string;
  buyer_moment: string;
  problem: string;
  exact_change: string;
  copy_guidance: string;
  internal_links: string;
  faq_schema_guidance: string;
  constraints: string;
  acceptance_criteria: string;
  full_prompt: string;
  created_at: string;
}

export interface ArchitectureInput {
  id: string;
  project_id: string;
  icp_notes: string | null;
  product_notes: string | null;
  offer_notes: string | null;
  proof_notes: string | null;
  business_type: string | null;
  primary_offer: string | null;
  secondary_offers: string | null;
  primary_icp: string | null;
  secondary_icps: string | null;
  conversion_goal: string | null;
  trust_proof_assets: string | null;
  site_type: string | null;
  nextgrid_notes: string | null;
  pricing_context: string | null;
  engagement_interest: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportType = 'teaser' | 'growth_brief' | 'brand_evidence_record';

export interface AeoAnalysisRow {
  id: string;
  audit_run_id: string;
  project_id: string;
  status: 'completed' | 'skipped' | 'failed';
  model: string | null;
  error_message: string | null;
  analysis: Record<string, unknown> | null;
  created_at: string;
}

export interface ArchitectureRecommendation {
  id: string;
  audit_run_id: string;
  project_id: string;
  page_type: string;
  title: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
  suggested_path: string | null;
  created_at: string;
}

export interface PricingPlan {
  id: string;
  audit_run_id: string;
  project_id: string;
  recommended_tier: string;
  price_range: string;
  rationale: string;
  included_items: string[];
  created_at: string;
}

export interface ReportExport {
  id: string;
  audit_run_id: string;
  project_id: string;
  title: string;
  report_type: ReportType | null;
  snapshot: Record<string, unknown>;
  created_at: string;
}

export interface Note {
  id: string;
  project_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  project_id: string;
  name: string;
  email: string | null;
  company: string | null;
  channel: string;
  source: string | null;
  medium: string | null;
  campaign: string | null;
  stage: LeadStage;
  status: LeadStatus;
  value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadStatusHistory {
  id: string;
  lead_id: string;
  project_id: string;
  from_stage: LeadStage | null;
  to_stage: LeadStage;
  from_status: LeadStatus | null;
  to_status: LeadStatus;
  changed_at: string;
}

export interface ChannelTrafficRow {
  sourceMedium: string;
  channel: string;
  sessions: number;
  engagedSessions: number;
  conversions: number;
}

export interface LeadChannelSummary {
  channel: string;
  count: number;
  openCount: number;
  closedCount: number;
  totalValue: number;
}

export interface LeadStageSummary {
  stage: LeadStage;
  count: number;
}

export interface LeadStatusSummary {
  status: LeadStatus;
  count: number;
}

export interface LeadFunnelSummary {
  byChannel: LeadChannelSummary[];
  byStage: LeadStageSummary[];
  byStatus: LeadStatusSummary[];
  totalLeads: number;
  openLeads: number;
  closedLeads: number;
  totalValue: number;
}

export interface ProjectLeadReportingSummary {
  trafficByChannel: ChannelTrafficRow[];
  leadSummary: LeadFunnelSummary;
}

export type GraphEntityType =
  | 'page'
  | 'icp'
  | 'offer'
  | 'product'
  | 'use_case'
  | 'claim'
  | 'proof'
  | 'cta'
  | 'query'
  | 'competitor'
  | 'topic';

export type GraphEntityStatus = 'found' | 'missing' | 'inferred';

export type GraphRelationshipType =
  | 'targets'
  | 'supports'
  | 'proves'
  | 'links_to'
  | 'answers'
  | 'converts_to'
  | 'references'
  | 'missing';

export type GraphWorkOrderAction =
  | 'create_node'
  | 'connect_node'
  | 'rewrite_node'
  | 'add_proof'
  | 'add_cta'
  | 'add_faq_schema'
  | 'create_page_system';

export interface GraphEntity {
  id: string;
  project_id: string;
  audit_run_id: string;
  type: GraphEntityType;
  label: string;
  source: string;
  confidence: number;
  metadata: Record<string, unknown>;
  status: GraphEntityStatus;
  created_at: string;
}

export interface GraphRelationship {
  id: string;
  project_id: string;
  audit_run_id: string;
  from_entity_id: string;
  to_entity_id: string;
  type: GraphRelationshipType;
  confidence: number;
  evidence: Record<string, unknown>;
  source: string;
  created_at: string;
}

export interface GraphSummary {
  id: string;
  project_id: string;
  audit_run_id: string;
  completeness_score: number;
  entity_completeness: number;
  relationship_completeness: number;
  proof_density: number;
  buyer_path_coverage: number;
  search_coverage: number;
  cta_coverage: number;
  aeo_clarity: number;
  programmatic_readiness: number;
  missing_node_count: number;
  disconnected_claim_count: number;
  query_page_match_rate: number;
  programmatic_opportunity_count: number;
  overview: Record<string, unknown>;
  created_at: string;
}

export interface GraphGap {
  id: string;
  project_id: string;
  audit_run_id: string;
  gap: string;
  gap_type: string;
  impact: string;
  fix: string;
  confidence: number;
  entity_ids: string[];
  revenue_impact: number;
  buyer_importance: number;
  urgency: number;
  execution_difficulty: number;
  aeo_value: number;
  programmatic_potential: number;
  priority_score: number;
  created_at: string;
}

export interface BuyerPath {
  id: string;
  project_id: string;
  audit_run_id: string;
  query_label: string | null;
  buyer_moment: string | null;
  page_label: string | null;
  offer_label: string | null;
  proof_label: string | null;
  cta_label: string | null;
  missing_steps: string[];
  completeness: number;
  priority_score: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProgrammaticOpportunity {
  id: string;
  project_id: string;
  audit_run_id: string;
  pattern_name: string;
  pattern_family: string | null;
  why_fits: string;
  example_template: string;
  first_recommended_pages: string[];
  unique_data_needed: string;
  unique_data: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  expected_benefit: string;
  agent_prompt: string;
  priority_score: number;
  search_demand: number;
  buyer_intent: number;
  ai_citation_value: number;
  ease_of_production: number;
  uniqueness_requirement: number;
  revenue_impact: number;
  thin_content_risk: number;
  linked_gap_types: string[];
  linked_entity_labels: string[];
  buyer_path_summary: string | null;
  aeo_flags: Record<string, unknown>;
  strategy_summary: string;
  risks_if_bad: string;
  created_at: string;
}

export type GraphWorkOrderStatus = 'open' | 'done' | 'skipped';

export interface GraphWorkOrder {
  id: string;
  project_id: string;
  audit_run_id: string;
  action_type: GraphWorkOrderAction;
  title: string;
  summary: string;
  gap_id: string | null;
  opportunity_id: string | null;
  finding_id: string | null;
  full_prompt: string;
  revenue_impact: number;
  buyer_importance: number;
  urgency: number;
  execution_difficulty: number;
  confidence: number;
  aeo_value: number;
  programmatic_potential: number;
  priority_score: number;
  status: GraphWorkOrderStatus;
  next_action?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithWebsite extends Project {
  website: Website | null;
}

export interface ProjectOverview extends ProjectWithWebsite {
  latest_audit: AuditRun | null;
  gsc_property: SearchConsoleProperty | null;
  ga4_property: Ga4Property | null;
  ads_account: GoogleAdsAccount | null;
  google_connected: boolean;
}
