-- Internal operator MVP: allow publishable-key access with no login UI yet.
-- Prefer SUPABASE_SERVICE_ROLE_KEY for server writes when available.

do $$
declare
  t text;
  tables text[] := array[
    'projects',
    'websites',
    'google_connections',
    'search_console_properties',
    'ga4_properties',
    'audit_runs',
    'audit_metrics',
    'page_metrics',
    'query_metrics',
    'findings',
    'agent_prompts',
    'architecture_inputs',
    'architecture_recommendations',
    'pricing_plans',
    'report_exports',
    'notes'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists siteos_operator_all on public.%I', t);
    execute format(
      'create policy siteos_operator_all on public.%I for all to anon, authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
