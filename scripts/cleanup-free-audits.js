// Deletes unclaimed free-audit projects older than RETENTION_DAYS (default 30).
// A project is "unclaimed" when it has no owner, no Google connection, and none of its
// audit sessions has an email or user attached. Everything else cascades from `projects`.
// Pass --dry-run to list what would be deleted without deleting.

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RETENTION_DAYS = Number(process.env.RETENTION_DAYS || 30);
const BATCH = 200;
const dryRun = process.argv.includes("--dry-run");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}
if (!Number.isFinite(RETENTION_DAYS) || RETENTION_DAYS < 7) {
  console.error(`Refusing to run with RETENTION_DAYS=${process.env.RETENTION_DAYS} (minimum 7).`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function fail(step, error) {
  console.error(`Cleanup failed at ${step}:`, error.message);
  process.exit(1);
}

async function idsWhere(table, column, ids) {
  const { data, error } = await supabase.from(table).select(column).in("project_id", ids);
  if (error) fail(`reading ${table}`, error);
  return new Set(data.map((r) => r[column] ?? r.project_id));
}

async function main() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86400000).toISOString();
  console.log(`${dryRun ? "[dry run] " : ""}Unclaimed free audits older than ${cutoff}`);

  let deleted = 0;
  let skipped = 0;
  let from = 0;

  for (;;) {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id")
      .is("user_id", null)
      .lt("created_at", cutoff)
      .order("created_at", { ascending: true })
      .range(from, from + BATCH - 1);
    if (error) fail("listing projects", error);
    if (!projects.length) break;

    const ids = projects.map((p) => p.id);

    const [withConnection, claimedSessions, activeRuns] = await Promise.all([
      idsWhere("google_connections", "project_id", ids),
      supabase
        .from("audit_sessions")
        .select("project_id")
        .in("project_id", ids)
        .or("email.not.is.null,user_id.not.is.null"),
      supabase.from("audit_runs").select("project_id").in("project_id", ids).eq("status", "running"),
    ]);
    if (claimedSessions.error) fail("reading audit_sessions", claimedSessions.error);
    if (activeRuns.error) fail("reading audit_runs", activeRuns.error);

    const keep = new Set([
      ...withConnection,
      ...claimedSessions.data.map((r) => r.project_id),
      ...activeRuns.data.map((r) => r.project_id),
    ]);
    const doomed = ids.filter((id) => !keep.has(id));
    skipped += ids.length - doomed.length;

    if (doomed.length && !dryRun) {
      const { error: delError } = await supabase
        .from("projects")
        .delete()
        .in("id", doomed)
        .is("user_id", null);
      if (delError) fail("deleting projects", delError);
    }
    deleted += doomed.length;

    // Deleted rows leave the result set, so only advance past the ones we kept (or in dry run, all).
    from += dryRun ? ids.length : ids.length - doomed.length;
    if (projects.length < BATCH) break;
  }

  console.log(`${dryRun ? "Would delete" : "Deleted"} ${deleted} project(s); kept ${skipped}.`);
}

main();
