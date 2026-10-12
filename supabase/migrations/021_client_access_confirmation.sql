-- Lets a client tell us in-app "I've granted access" instead of replying to
-- an email, and lets admins see who's confirmed and is ready for a full audit.

alter table public.projects add column if not exists client_access_confirmed_at timestamptz;
