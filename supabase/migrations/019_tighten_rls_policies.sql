-- P0.6: Replace the open (using true) policies from 002_operator_rls_policies.sql
-- with real per-owner scoping, now that projects.user_id and
-- google_connections.project_id exist. All current server code uses the
-- service-role client (bypasses RLS), so this has no effect on today's app
-- behavior; it blocks any future anon/authenticated client-side query from
-- crossing customer boundaries.

drop policy if exists siteos_operator_all on public.projects;
create policy projects_owner_only on public.projects
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists siteos_operator_all on public.google_connections;
create policy google_connections_owner_only on public.google_connections
  for all to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

drop policy if exists siteos_operator_all on public.ga4_properties;
create policy ga4_properties_owner_only on public.ga4_properties
  for all to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

drop policy if exists siteos_operator_all on public.search_console_properties;
create policy search_console_properties_owner_only on public.search_console_properties
  for all to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));

alter table public.google_ads_accounts enable row level security;
create policy google_ads_accounts_owner_only on public.google_ads_accounts
  for all to authenticated
  using (project_id in (select id from public.projects where user_id = auth.uid()))
  with check (project_id in (select id from public.projects where user_id = auth.uid()));
