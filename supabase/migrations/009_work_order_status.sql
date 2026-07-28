-- Work order execution status for operator queue

alter table graph_work_orders
  add column if not exists status text not null default 'open'
    check (status in ('open', 'done', 'skipped')),
  add column if not exists finding_id uuid references findings(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists graph_work_orders_status_idx
  on graph_work_orders (audit_run_id, status);
