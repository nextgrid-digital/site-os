-- P0 security: migrations 002, 003, 007, 010, 011, 012 and 014 created
-- `siteos_operator_all` policies with `using (true)` for the `anon` and
-- `authenticated` roles. The publishable key ships to the browser, so anyone
-- holding it could read and write those tables directly through PostgREST.
--
-- The app never queries these tables with the publishable key. Every server
-- route uses the service-role client, which bypasses RLS. Dropping the policies
-- leaves RLS enabled with no policy for anon/authenticated, so only the
-- service role can touch these tables. Tables that still carry owner-scoped
-- policies (migrations 019 and 023) are not affected.

do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename
    from pg_policies
    where schemaname = 'public'
      and policyname = 'siteos_operator_all'
  loop
    execute format('drop policy if exists siteos_operator_all on %I.%I', r.schemaname, r.tablename);
  end loop;
end $$;
