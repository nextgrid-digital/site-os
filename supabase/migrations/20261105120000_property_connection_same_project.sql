-- A Google property must reference a connection owned by the same project.
-- Rows pointing at a connection with a null or different project_id made audits log in with
-- the wrong (often expired) token and silently store zero GSC/GA4 data.
-- A trigger is used instead of a composite foreign key so the existing
-- "on delete set null" on connection_id keeps working.

create or replace function enforce_property_connection_project()
returns trigger
language plpgsql
as $$
begin
  if new.connection_id is not null and not exists (
    select 1
    from google_connections gc
    where gc.id = new.connection_id
      and gc.project_id is not distinct from new.project_id
      and gc.project_id is not null
  ) then
    raise exception 'connection % does not belong to project %', new.connection_id, new.project_id
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists search_console_properties_connection_project on search_console_properties;
create trigger search_console_properties_connection_project
  before insert or update of connection_id, project_id on search_console_properties
  for each row execute function enforce_property_connection_project();

drop trigger if exists ga4_properties_connection_project on ga4_properties;
create trigger ga4_properties_connection_project
  before insert or update of connection_id, project_id on ga4_properties
  for each row execute function enforce_property_connection_project();

drop trigger if exists google_ads_accounts_connection_project on google_ads_accounts;
create trigger google_ads_accounts_connection_project
  before insert or update of connection_id, project_id on google_ads_accounts
  for each row execute function enforce_property_connection_project();
