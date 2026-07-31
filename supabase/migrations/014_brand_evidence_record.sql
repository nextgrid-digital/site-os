-- Brand Evidence Record: structured observations keyed by audit_run_id

-- Extend report_exports.report_type via text (already text/check may exist); app uses 'brand_evidence_record'

create table if not exists evidence_records (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  subject text not null,
  relationship text not null,
  object text not null,
  source_type text not null,
  source_title text,
  source_url text,
  evidence_text text,
  published_at timestamptz,
  observed_at timestamptz not null default now(),
  first_observed_at timestamptz not null default now(),
  last_observed_at timestamptz not null default now(),
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  independence text not null default 'first_party',
  verification_status text not null default 'directly_observed',
  extraction_method text not null default 'crawl',
  limitation text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_evidence_records_run on evidence_records(audit_run_id);
create index if not exists idx_evidence_records_project on evidence_records(project_id);

create table if not exists company_identity_fields (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  field_key text not null,
  field_value text,
  source_type text not null,
  source_url text,
  observed_at timestamptz not null default now(),
  confidence numeric not null default 0.5,
  has_conflict boolean not null default false,
  conflict_note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_company_identity_fields_run on company_identity_fields(audit_run_id);

create table if not exists company_descriptions (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  description_text text not null,
  source_type text not null,
  source_title text,
  source_url text,
  observed_at timestamptz not null default now(),
  category_terms text[] not null default '{}',
  audience_terms text[] not null default '{}',
  capability_terms text[] not null default '{}',
  flags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_company_descriptions_run on company_descriptions(audit_run_id);

create table if not exists brand_associations (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  topic text not null,
  first_party_count integer not null default 0,
  third_party_count integer not null default 0,
  ai_appearance_count integer not null default 0,
  supporting_urls text[] not null default '{}',
  first_observed_at timestamptz,
  last_observed_at timestamptz,
  confidence numeric not null default 0.5,
  classification text not null default 'primarily_first_party',
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_associations_run on brand_associations(audit_run_id);

create table if not exists brand_claims (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  claim_text text not null,
  claiming_source_url text,
  claiming_excerpt text,
  corroboration_count integer not null default 0,
  contradiction_count integer not null default 0,
  verification_status text not null default 'first_party_claim_only',
  observed_at timestamptz not null default now(),
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_claims_run on brand_claims(audit_run_id);

create table if not exists brand_claim_evidence (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references brand_claims(id) on delete cascade,
  evidence_record_id uuid references evidence_records(id) on delete set null,
  role text not null default 'supports',
  source_url text,
  excerpt text,
  independence text not null default 'first_party',
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_claim_evidence_claim on brand_claim_evidence(claim_id);

create table if not exists buyer_question_coverage (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  question_group text not null,
  question text not null,
  coverage_status text not null default 'not_identified',
  page_urls text[] not null default '{}',
  evidence_excerpt text,
  source_count integer not null default 0,
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now()
);

create index if not exists idx_buyer_question_coverage_run on buyer_question_coverage(audit_run_id);

create table if not exists content_coverage (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  content_type text not null,
  page_count integer not null default 0,
  urls text[] not null default '{}',
  topics text[] not null default '{}',
  latest_observed_at timestamptz,
  oldest_observed_at timestamptz,
  evidence_strength text not null default 'not_identified',
  created_at timestamptz not null default now()
);

create index if not exists idx_content_coverage_run on content_coverage(audit_run_id);

create table if not exists technical_observations (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  observation_key text not null,
  status text not null,
  detail text,
  source_url text,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_technical_observations_run on technical_observations(audit_run_id);

create table if not exists brand_contradictions (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  subject text not null,
  version_a text not null,
  source_a text,
  source_a_url text,
  version_b text not null,
  source_b text,
  source_b_url text,
  observed_at timestamptz not null default now(),
  confidence numeric not null default 0.5,
  status text not null default 'unresolved',
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_contradictions_run on brand_contradictions(audit_run_id);

create table if not exists external_sources (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  source_title text,
  source_type text not null,
  source_url text,
  related_topic text,
  publication_date timestamptz,
  observed_at timestamptz not null default now(),
  evidence_excerpt text,
  independence text not null default 'third_party',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_external_sources_run on external_sources(audit_run_id);

create table if not exists prompt_runs (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  ai_system text not null,
  prompt text not null,
  prompt_category text not null,
  market_assumption text,
  run_at timestamptz not null default now(),
  brand_mentioned boolean not null default false,
  competitors_mentioned text[] not null default '{}',
  company_website_cited boolean not null default false,
  external_sources_cited text[] not null default '{}',
  brand_description text,
  associated_topics text[] not null default '{}',
  answer_summary text,
  confidence numeric not null default 0.5,
  limitations text,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_prompt_runs_run on prompt_runs(audit_run_id);

create table if not exists competitor_observations (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  competitor_name text not null,
  prompt_appearances integer not null default 0,
  associated_categories text[] not null default '{}',
  cited_sources text[] not null default '{}',
  ai_description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_competitor_observations_run on competitor_observations(audit_run_id);

create table if not exists historical_changes (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  previous_audit_run_id uuid references audit_runs(id) on delete set null,
  event_type text not null,
  previous_value text,
  current_value text,
  first_observed_at timestamptz,
  change_observed_at timestamptz not null default now(),
  source text,
  confidence numeric not null default 0.5,
  created_at timestamptz not null default now()
);

create index if not exists idx_historical_changes_run on historical_changes(audit_run_id);

create table if not exists brand_evidence_snapshots (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  schema_version integer not null default 1,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (audit_run_id)
);

create index if not exists idx_brand_evidence_snapshots_project on brand_evidence_snapshots(project_id);

alter table evidence_records enable row level security;
alter table company_identity_fields enable row level security;
alter table company_descriptions enable row level security;
alter table brand_associations enable row level security;
alter table brand_claims enable row level security;
alter table brand_claim_evidence enable row level security;
alter table buyer_question_coverage enable row level security;
alter table content_coverage enable row level security;
alter table technical_observations enable row level security;
alter table brand_contradictions enable row level security;
alter table external_sources enable row level security;
alter table prompt_runs enable row level security;
alter table competitor_observations enable row level security;
alter table historical_changes enable row level security;
alter table brand_evidence_snapshots enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'evidence_records',
    'company_identity_fields',
    'company_descriptions',
    'brand_associations',
    'brand_claims',
    'brand_claim_evidence',
    'buyer_question_coverage',
    'content_coverage',
    'technical_observations',
    'brand_contradictions',
    'external_sources',
    'prompt_runs',
    'competitor_observations',
    'historical_changes',
    'brand_evidence_snapshots'
  ]
  loop
    execute format('drop policy if exists siteos_operator_all on %I', t);
    execute format(
      'create policy siteos_operator_all on %I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
