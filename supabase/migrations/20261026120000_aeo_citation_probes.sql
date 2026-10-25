-- Citation Probe results: one row per prompt per probe run, recording whether an
-- AI answer engine cited the project's domain. Read/written only through the
-- service-role key behind an ownership check, like aeo_page_scans.

create table if not exists aeo_citation_probes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  probe_run_id uuid not null,
  engine text not null default 'gemini',
  prompt text not null,
  cited boolean not null default false,
  mentioned boolean not null default false,
  sources jsonb not null default '[]'::jsonb,
  error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_aeo_citation_probes_project on aeo_citation_probes(project_id, created_at desc);
create index if not exists idx_aeo_citation_probes_run on aeo_citation_probes(probe_run_id);

alter table aeo_citation_probes enable row level security;

-- Topic Map: one AI-grouped map of a site's topics and content gaps per audit
-- run. Regenerating overwrites the row. Service-role access only, like above.

create table if not exists aeo_topic_maps (
  audit_run_id uuid primary key references audit_runs(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  model text,
  map jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_aeo_topic_maps_project on aeo_topic_maps(project_id);

alter table aeo_topic_maps enable row level security;
