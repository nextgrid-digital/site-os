-- Google Ads account mapping (parallel to GA4 / Search Console property tables)

create table if not exists google_ads_accounts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  connection_id uuid references google_connections(id) on delete set null,
  customer_id text not null,
  descriptive_name text not null,
  currency_code text,
  time_zone text,
  is_selected boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists google_ads_accounts_project_id_idx
  on google_ads_accounts (project_id);

create index if not exists google_ads_accounts_selected_idx
  on google_ads_accounts (project_id)
  where is_selected = true;
