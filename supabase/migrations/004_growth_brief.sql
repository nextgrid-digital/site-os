-- Growth Brief intake + finding scores + report type

alter table architecture_inputs
  add column if not exists nextgrid_notes text,
  add column if not exists pricing_context text,
  add column if not exists engagement_interest text;

alter table findings
  add column if not exists revenue_impact numeric,
  add column if not exists buyer_importance numeric,
  add column if not exists urgency numeric,
  add column if not exists execution_difficulty numeric,
  add column if not exists confidence numeric,
  add column if not exists aeo_value numeric,
  add column if not exists priority_score numeric;

alter table report_exports
  add column if not exists report_type text;

alter table report_exports
  drop constraint if exists report_exports_report_type_check;

alter table report_exports
  add constraint report_exports_report_type_check
  check (report_type is null or report_type in ('teaser', 'growth_brief'));
