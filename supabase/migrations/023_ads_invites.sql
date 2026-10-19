-- One MCC invite per project, sent from NextGrid's manager account.
-- status mirrors Google's ManagerLinkStatus: PENDING, ACTIVE, REFUSED, INACTIVE.
create table if not exists ads_invites (
  project_id uuid primary key references projects(id) on delete cascade,
  customer_id text not null,
  status text not null default 'PENDING',
  invited_at timestamptz not null default now(),
  checked_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table ads_invites enable row level security;
create policy ads_invites_owner_only on public.ads_invites
  for all to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
