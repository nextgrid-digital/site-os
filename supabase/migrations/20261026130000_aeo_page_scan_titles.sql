-- Page titles/H1s kept alongside each scan so later features (topic map) can
-- reason about what a page is about without re-crawling.
alter table aeo_page_scans add column if not exists title text;
alter table aeo_page_scans add column if not exists h1 text;
