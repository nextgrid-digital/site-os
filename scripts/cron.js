// Supabase keepalive ping.
// Free-tier Supabase projects pause after a period of API inactivity.
// This hits the Auth admin API (schema-independent, no table assumptions)
// on a schedule via GitHub Actions so the project is never inactive long enough to pause.

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function ping() {
  const { error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1,
  });

  if (error) {
    console.error("Supabase keepalive ping failed:", error.message);
    process.exit(1);
  }

  console.log(`Supabase keepalive ping OK at ${new Date().toISOString()}`);
}

ping();
