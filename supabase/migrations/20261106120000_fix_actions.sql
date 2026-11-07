-- Fix checklist + before/after proof for dashboard issues.
--
-- A row is created when a user marks an issue (e.g. "demand without clicks on
-- /pricing") as done. `baseline` freezes the target's metrics from the audit run
-- that was current at that moment so a later audit can show what changed.
--
-- Service-role access only, like the other project tables: RLS is enabled with
-- no anon/authenticated policy, and the API routes check project access first.

create table if not exists fix_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  issue_id text not null,
  target text not null,
  target_kind text not null check (target_kind in ('page', 'query')),
  title text not null,
  status text not null default 'done' check (status in ('open', 'done')),
  baseline jsonb not null default '{}'::jsonb,
  baseline_audit_run_id uuid references audit_runs(id) on delete set null,
  done_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (project_id, issue_id, target)
);

create index if not exists idx_fix_actions_project on fix_actions(project_id, done_at desc);

alter table fix_actions enable row level security;

-- Optional value of one conversion, so opportunity estimates can be shown in
-- money. When unset, GA4 revenue per conversion is used if the property has it.
create table if not exists project_value_settings (
  project_id uuid primary key references projects(id) on delete cascade,
  value_per_conversion numeric not null check (value_per_conversion >= 0),
  currency text not null default 'USD',
  updated_at timestamptz not null default now()
);

alter table project_value_settings enable row level security;
