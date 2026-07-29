-- Allow free (full site-only) audit runs alongside mini teaser and full connected
alter table audit_runs drop constraint if exists audit_runs_run_type_check;
alter table audit_runs
  add constraint audit_runs_run_type_check
  check (run_type in ('mini', 'free', 'full'));

-- Session status + upgrade tracking for the public funnel
alter table audit_sessions
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'teaser_ready', 'free_ready', 'failed'));

alter table audit_sessions
  add column if not exists upgrade_state text not null default 'none'
    check (upgrade_state in ('none', 'intake_started', 'connected'));
