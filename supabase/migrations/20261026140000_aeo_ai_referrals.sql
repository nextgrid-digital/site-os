-- AI-referral traffic (visits from ChatGPT, Perplexity, ...) pulled from the
-- project's own GA4 property. One latest snapshot per project; refreshing
-- overwrites it. Service-role access only, like the other AEO tables.
create table if not exists aeo_ai_referrals (
  project_id uuid primary key references projects(id) on delete cascade,
  data jsonb not null,
  fetched_at timestamptz not null default now()
);

alter table aeo_ai_referrals enable row level security;
