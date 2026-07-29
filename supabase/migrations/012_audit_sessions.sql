-- Public free-audit sessions (URL first, auth unlocks full free report)

create table if not exists audit_sessions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  website_url text not null,
  domain text not null,
  email text,
  user_id uuid,
  teaser_snapshot jsonb,
  full_unlocked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_audit_sessions_project on audit_sessions(project_id);
create index if not exists idx_audit_sessions_user on audit_sessions(user_id);
create index if not exists idx_audit_sessions_domain on audit_sessions(domain);

alter table audit_sessions enable row level security;

drop policy if exists siteos_operator_all on audit_sessions;
create policy siteos_operator_all on audit_sessions
  for all to anon, authenticated
  using (true)
  with check (true);
