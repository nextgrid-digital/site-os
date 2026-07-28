-- Extend architecture_inputs with structured project intake for AEO
alter table architecture_inputs
  add column if not exists business_type text,
  add column if not exists primary_offer text,
  add column if not exists secondary_offers text,
  add column if not exists primary_icp text,
  add column if not exists secondary_icps text,
  add column if not exists conversion_goal text,
  add column if not exists trust_proof_assets text,
  add column if not exists site_type text;

-- Gemini AEO analysis per audit run (draft inferences, not factual findings)
create table if not exists aeo_analyses (
  id uuid primary key default gen_random_uuid(),
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  status text not null check (status in ('completed', 'skipped', 'failed')),
  model text,
  error_message text,
  analysis jsonb,
  created_at timestamptz not null default now(),
  unique (audit_run_id)
);

create index if not exists idx_aeo_analyses_project on aeo_analyses(project_id);

alter table aeo_analyses enable row level security;

drop policy if exists siteos_operator_all on aeo_analyses;
create policy siteos_operator_all on aeo_analyses
  for all to anon, authenticated
  using (true)
  with check (true);
