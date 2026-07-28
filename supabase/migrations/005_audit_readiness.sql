-- Audit readiness / low-data fallback fields on audit_runs

alter table audit_runs
  add column if not exists audit_readiness text
    check (audit_readiness is null or audit_readiness in (
      'no_data',
      'search_console_only',
      'ga4_only',
      'full_data'
    ));

alter table audit_runs
  add column if not exists data_availability jsonb;

alter table audit_runs
  add column if not exists site_only_analysis jsonb;

alter table audit_runs
  add column if not exists confidence_score numeric;
