-- Commercial Knowledge Graph layer (entities, relationships, gaps, paths, work orders)

create table if not exists graph_entities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  type text not null check (type in (
    'page', 'icp', 'offer', 'product', 'use_case', 'claim', 'proof', 'cta', 'query', 'competitor', 'topic'
  )),
  label text not null,
  source text not null default 'crawl',
  confidence numeric(5, 2) not null default 50,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'found' check (status in ('found', 'missing', 'inferred')),
  created_at timestamptz not null default now()
);

create index if not exists graph_entities_run_idx on graph_entities (audit_run_id);
create index if not exists graph_entities_project_idx on graph_entities (project_id);

create table if not exists graph_relationships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  from_entity_id uuid not null references graph_entities(id) on delete cascade,
  to_entity_id uuid not null references graph_entities(id) on delete cascade,
  type text not null check (type in (
    'targets', 'supports', 'proves', 'links_to', 'answers', 'converts_to', 'references', 'missing'
  )),
  confidence numeric(5, 2) not null default 50,
  evidence jsonb not null default '{}'::jsonb,
  source text not null default 'analysis',
  created_at timestamptz not null default now()
);

create index if not exists graph_relationships_run_idx on graph_relationships (audit_run_id);

create table if not exists graph_summaries (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  completeness_score numeric(5, 2) not null default 0,
  entity_completeness numeric(5, 2) not null default 0,
  relationship_completeness numeric(5, 2) not null default 0,
  proof_density numeric(5, 2) not null default 0,
  buyer_path_coverage numeric(5, 2) not null default 0,
  search_coverage numeric(5, 2) not null default 0,
  cta_coverage numeric(5, 2) not null default 0,
  aeo_clarity numeric(5, 2) not null default 0,
  programmatic_readiness numeric(5, 2) not null default 0,
  missing_node_count int not null default 0,
  disconnected_claim_count int not null default 0,
  query_page_match_rate numeric(5, 2) not null default 0,
  programmatic_opportunity_count int not null default 0,
  overview jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (audit_run_id)
);

create table if not exists graph_gaps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  gap text not null,
  gap_type text not null,
  impact text not null default '',
  fix text not null default '',
  confidence numeric(5, 2) not null default 50,
  entity_ids uuid[] not null default '{}',
  revenue_impact numeric(5, 2) not null default 50,
  buyer_importance numeric(5, 2) not null default 50,
  urgency numeric(5, 2) not null default 50,
  execution_difficulty numeric(5, 2) not null default 50,
  aeo_value numeric(5, 2) not null default 50,
  programmatic_potential numeric(5, 2) not null default 0,
  priority_score numeric(8, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists graph_gaps_run_idx on graph_gaps (audit_run_id);

create table if not exists buyer_paths (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  query_label text,
  buyer_moment text,
  page_label text,
  offer_label text,
  proof_label text,
  cta_label text,
  missing_steps text[] not null default '{}',
  completeness numeric(5, 2) not null default 0,
  priority_score numeric(8, 2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists buyer_paths_run_idx on buyer_paths (audit_run_id);

create table if not exists programmatic_opportunities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  pattern_name text not null,
  why_fits text not null default '',
  example_template text not null default '',
  first_recommended_pages text[] not null default '{}',
  unique_data_needed text not null default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  confidence numeric(5, 2) not null default 50,
  expected_benefit text not null default '',
  agent_prompt text not null default '',
  priority_score numeric(8, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists programmatic_opportunities_run_idx on programmatic_opportunities (audit_run_id);

create table if not exists graph_work_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  audit_run_id uuid not null references audit_runs(id) on delete cascade,
  action_type text not null check (action_type in (
    'create_node', 'connect_node', 'rewrite_node', 'add_proof', 'add_cta', 'add_faq_schema', 'create_page_system'
  )),
  title text not null,
  summary text not null default '',
  gap_id uuid references graph_gaps(id) on delete set null,
  opportunity_id uuid references programmatic_opportunities(id) on delete set null,
  full_prompt text not null default '',
  revenue_impact numeric(5, 2) not null default 50,
  buyer_importance numeric(5, 2) not null default 50,
  urgency numeric(5, 2) not null default 50,
  execution_difficulty numeric(5, 2) not null default 50,
  confidence numeric(5, 2) not null default 50,
  aeo_value numeric(5, 2) not null default 50,
  programmatic_potential numeric(5, 2) not null default 0,
  priority_score numeric(8, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists graph_work_orders_run_idx on graph_work_orders (audit_run_id);

do $$
declare
  t text;
  tables text[] := array[
    'graph_entities',
    'graph_relationships',
    'graph_summaries',
    'graph_gaps',
    'buyer_paths',
    'programmatic_opportunities',
    'graph_work_orders'
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
