/** Shared cookie name for pending public audit sessions (URL → teaser → auth). */
export const AUDIT_SESSION_COOKIE = 'audit_session_id';

/**
 * Every anonymous free audit this browser has started, comma-separated, newest first.
 * AUDIT_SESSION_COOKIE only holds the latest one (the sign-in flow uses it), so access
 * checks read this list instead; otherwise starting a second audit would lock the first.
 */
export const AUDIT_SESSION_HISTORY_COOKIE = 'audit_session_history';

const MAX_HISTORY = 25;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseAuditSessionHistory(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(',').filter((id) => UUID_RE.test(id));
}

export function appendAuditSessionHistory(value: string | null | undefined, sessionId: string): string {
  const rest = parseAuditSessionHistory(value).filter((id) => id !== sessionId);
  return [sessionId, ...rest].slice(0, MAX_HISTORY).join(',');
}
