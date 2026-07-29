-- Two-tier commercial audit: access codes + client intake

create table if not exists audit_access_codes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  email text not null,
  code text not null,
  verified_at timestamptz,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);

create index if not exists idx_access_codes_project_email on audit_access_codes(project_id, email);
create index if not exists idx_access_codes_lookup on audit_access_codes(email, code);

create table if not exists client_intake (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  goal_category text not null default 'leads'
    check (goal_category in ('leads', 'signups', 'sales', 'traffic', 'funnel_clarity')),
  business_goal text,
  success_metric text,
  conversion_type text,
  primary_buyer text,
  priority_channel text,
  funnel_stage_focus text,
  problem_statement text,
  priority_pages text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

create index if not exists idx_client_intake_project on client_intake(project_id);

alter table audit_runs add column if not exists goal_category text
  check (goal_category is null or goal_category in ('leads', 'signups', 'sales', 'traffic', 'funnel_clarity'));

-- RLS
alter table audit_access_codes enable row level security;
alter table client_intake enable row level security;

drop policy if exists siteos_operator_all on audit_access_codes;
create policy siteos_operator_all on audit_access_codes
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists siteos_operator_all on client_intake;
create policy siteos_operator_all on client_intake
  for all to anon, authenticated
  using (true)
  with check (true);
