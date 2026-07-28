-- Lead pipeline + channel attribution reporting

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  email text,
  company text,
  channel text not null default 'direct',
  source text,
  medium text,
  campaign text,
  stage text not null default 'new'
    check (stage in ('new', 'qualified', 'proposal', 'won', 'lost')),
  status text not null default 'open'
    check (status in ('open', 'follow_up', 'stalled', 'closed')),
  value numeric(12, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lead_status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  from_stage text
    check (from_stage is null or from_stage in ('new', 'qualified', 'proposal', 'won', 'lost')),
  to_stage text not null
    check (to_stage in ('new', 'qualified', 'proposal', 'won', 'lost')),
  from_status text
    check (from_status is null or from_status in ('open', 'follow_up', 'stalled', 'closed')),
  to_status text not null
    check (to_status in ('open', 'follow_up', 'stalled', 'closed')),
  changed_at timestamptz not null default now()
);

create index if not exists idx_leads_project_created on leads(project_id, created_at desc);
create index if not exists idx_leads_project_channel on leads(project_id, channel);
create index if not exists idx_leads_project_stage on leads(project_id, stage);
create index if not exists idx_leads_project_status on leads(project_id, status);
create index if not exists idx_lead_status_history_lead on lead_status_history(lead_id, changed_at desc);

alter table leads enable row level security;
alter table lead_status_history enable row level security;

drop policy if exists siteos_operator_all on leads;
create policy siteos_operator_all on leads
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists siteos_operator_all on lead_status_history;
create policy siteos_operator_all on lead_status_history
  for all to anon, authenticated
  using (true)
  with check (true);
