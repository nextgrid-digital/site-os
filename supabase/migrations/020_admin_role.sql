-- P0: Real admin role so /operator can be gated by something other than
-- "anyone who finds the URL". profiles.plan already exists (015); this adds
-- the flag that lets a signed-in user manage all clients.

alter table public.profiles add column if not exists is_admin boolean not null default false;

-- No RLS policy change needed: profiles' existing "select own row" policy
-- means a non-admin can still only read their own is_admin=false row via the
-- anon/authenticated client. Admin checks in the app always go through
-- getSupabaseAdmin() (service role), which bypasses RLS by design.

-- To promote an account to admin, run manually (service role / SQL editor):
--   update public.profiles set is_admin = true
--   where user_id = (select id from auth.users where email = '<your-email>');
