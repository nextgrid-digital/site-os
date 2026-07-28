-- Programmatic Opportunity layer: richer scoring, unique-data guards, AEO flags

alter table programmatic_opportunities
  add column if not exists pattern_family text
    check (pattern_family is null or pattern_family in (
      'curation', 'comparisons', 'use_case', 'integrations', 'templates', 'converters',
      'examples', 'directories', 'glossary', 'localization', 'locations', 'profiles'
    )),
  add column if not exists search_demand numeric(5, 2) not null default 0,
  add column if not exists buyer_intent numeric(5, 2) not null default 0,
  add column if not exists ai_citation_value numeric(5, 2) not null default 0,
  add column if not exists ease_of_production numeric(5, 2) not null default 0,
  add column if not exists uniqueness_requirement numeric(5, 2) not null default 0,
  add column if not exists revenue_impact numeric(5, 2) not null default 0,
  add column if not exists thin_content_risk numeric(5, 2) not null default 0,
  add column if not exists unique_data jsonb not null default '{}'::jsonb,
  add column if not exists linked_gap_types text[] not null default '{}',
  add column if not exists linked_entity_labels text[] not null default '{}',
  add column if not exists buyer_path_summary text,
  add column if not exists aeo_flags jsonb not null default '{}'::jsonb,
  add column if not exists strategy_summary text not null default '',
  add column if not exists risks_if_bad text not null default '';
