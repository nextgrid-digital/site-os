-- Per-page Answer Engine Optimization scan results, one row per crawled page
-- per audit run. Written by the audit pipeline, read through the project
-- bundle route after an ownership check.
--
-- Like every other table, this is reachable only with the service-role key:
-- RLS is enabled and deliberately has no anon/authenticated policy (see 024).

create table if not exists aeo_page_scans (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  path text not null,
  kind text not null check (kind in ('home', 'article', 'page')),
  score integer not null check (score between 0 and 100),
  checks jsonb not null default '[]'::jsonb,
  signals jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (audit_run_id, path)
);

create index if not exists idx_aeo_page_scans_project on aeo_page_scans(project_id, created_at desc);
create index if not exists idx_aeo_page_scans_run on aeo_page_scans(audit_run_id);

alter table aeo_page_scans enable row level security;
