-- Soft unlock for Full Brief (enables Google Connect + full runs)

alter table projects
  add column if not exists full_brief_unlocked_at timestamptz;
