-- Light schema for workflow work items (next action on findings + work orders)

alter table findings
  add column if not exists next_action text;

alter table graph_work_orders
  add column if not exists next_action text;

comment on column findings.next_action is 'Plain-English next action for the unified Work queue';
comment on column graph_work_orders.next_action is 'Plain-English next action for the unified Work queue';
