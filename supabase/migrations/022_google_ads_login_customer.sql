-- Manager (MCC) account a Google Ads client account is reached through.
-- Null when the account is reached directly. Sent as login-customer-id on Ads API calls.
alter table google_ads_accounts
  add column if not exists login_customer_id text;
