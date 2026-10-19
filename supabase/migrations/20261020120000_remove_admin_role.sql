-- The operator/admin area is gone and everything is free, so nothing reads
-- profiles.is_admin any more (added in 020_admin_role.sql).
alter table public.profiles drop column if exists is_admin;

-- google_connections.operator_email actually stores the Google account the user
-- signed in with. Rename it to say so. Deploy together with the code change.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'google_connections' and column_name = 'operator_email'
  ) then
    alter table public.google_connections rename column operator_email to connected_email;
  end if;
end $$;
