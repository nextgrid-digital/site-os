-- Connection-level Google property inventory (agency OAuth model).
-- Refreshed by sync-inventory; used to auto-surface sites on /app.

alter table public.google_connections
  add column if not exists inventory jsonb not null default '{}'::jsonb,
  add column if not exists inventory_synced_at timestamptz;

comment on column public.google_connections.inventory is
  'Cached GSC/GA4/Ads property list visible to this OAuth connection.';
comment on column public.google_connections.inventory_synced_at is
  'When inventory was last refreshed from Google APIs.';
