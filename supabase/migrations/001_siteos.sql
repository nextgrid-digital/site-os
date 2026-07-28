-- Site-OS internal audit operating system schema

create extension if not exists "pgcrypto";

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists websites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  url text not null,
  domain text not null,
  crawl_max_pages int not null default 50,
  created_at timestamptz not null default now(),
  unique (project_id)
);

create table if not exists google_connections (
  id uuid primary key default gen_random_uuid(),
  operator_email text not null default 'hello@nextgrid.digital',
  access_token text not null,
  refresh_token text,
  token_expiry timestamptz,
  scopes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists search_console_properties (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  connection_id uuid references google_connections(id) on delete set null,
  property_url text not null,
  site_url text not null,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists ga4_properties (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  connection_id uuid references google_connections(id) on delete set null,
  property_id text not null,
  property_name text not null,
  account_name text,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists audit_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  run_type text not null default 'full' check (run_type in ('mini', 'full')),
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists audit_metrics (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  total_clicks int not null default 0,
  total_impressions int not null default 0,
  avg_ctr numeric(8, 4) not null default 0,
  avg_position numeric(8, 2) not null default 0,
  total_sessions int not null default 0,
  total_engaged_sessions int not null default 0,
  total_conversions int not null default 0,
  pages_crawled int not null default 0,
  findings_count int not null default 0,
  high_severity_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (audit_run_id)
);

create table if not exists page_metrics (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  path text not null,
  url text not null,
  title text,
  meta_description text,
  h1 text,
  internal_link_count int not null default 0,
  has_faq boolean not null default false,
  has_faq_schema boolean not null default false,
  gsc_clicks int not null default 0,
  gsc_impressions int not null default 0,
  gsc_ctr numeric(8, 4) not null default 0,
  gsc_position numeric(8, 2) not null default 0,
  ga_sessions int not null default 0,
  ga_engaged_sessions int not null default 0,
  ga_conversions int not null default 0,
  flags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists query_metrics (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  query text not null,
  page_path text,
  clicks int not null default 0,
  impressions int not null default 0,
  ctr numeric(8, 4) not null default 0,
  position numeric(8, 2) not null default 0,
  opportunity_score numeric(8, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  type text not null,
  category text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  title text not null,
  summary text not null,
  page_path text,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open', 'reviewed', 'resolved')),
  buyer_moment text,
  estimated_value text,
  created_at timestamptz not null default now()
);

create table if not exists agent_prompts (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid not null references findings(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  context text not null,
  page_path text,
  evidence text not null,
  buyer_moment text not null,
  problem text not null,
  exact_change text not null,
  copy_guidance text not null,
  internal_links text not null,
  faq_schema_guidance text not null,
  constraints text not null,
  acceptance_criteria text not null,
  full_prompt text not null,
  created_at timestamptz not null default now(),
  unique (finding_id)
);

create table if not exists architecture_inputs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  icp_notes text,
  product_notes text,
  offer_notes text,
  proof_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id)
);

create table if not exists architecture_recommendations (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  page_type text not null,
  title text not null,
  rationale text not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  suggested_path text,
  created_at timestamptz not null default now()
);

create table if not exists pricing_plans (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  recommended_tier text not null,
  price_range text not null,
  rationale text not null,
  included_items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (audit_run_id)
);

create table if not exists report_exports (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_websites_project on websites(project_id);
create index if not exists idx_audit_runs_project on audit_runs(project_id);
create index if not exists idx_findings_project on findings(project_id);
create index if not exists idx_findings_audit_run on findings(audit_run_id);
create index if not exists idx_page_metrics_audit_run on page_metrics(audit_run_id);
create index if not exists idx_query_metrics_audit_run on query_metrics(audit_run_id);
