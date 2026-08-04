/**
 * Prefer IPv4 first. On some macOS/Node setups, AAAA lookups for *.supabase.co
 * intermittently fail with ENOTFOUND and surface as "TypeError: fetch failed".
 *
 * Dynamic import keeps this Node-only so Edge instrumentation does not load `node:dns`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = await import('node:dns');
    dns.setDefaultResultOrder('ipv4first');
  }
}
