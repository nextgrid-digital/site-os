-- P0.1: Scope projects and Google connections to their owning user so two
-- customers auditing the same domain (or connecting Google) never collide.

alter table projects add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_projects_user on projects(user_id);

alter table google_connections add column if not exists project_id uuid references projects(id) on delete cascade;
create index if not exists idx_google_connections_project on google_connections(project_id);
