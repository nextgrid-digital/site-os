import {
  AUDIT_SESSION_COOKIE,
  AUDIT_SESSION_HISTORY_COOKIE,
  parseAuditSessionHistory,
} from '@/lib/audit/session-cookie';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Who may read or change a project.
 *
 * - The owner (`projects.user_id`) may.
 * - A project with no owner is an anonymous free audit. Only the browser that
 *   started it may use it: one of the audit session ids in its cookies must
 *   belong to that project.
 *
 * Pass the ids from `anonSessionIdsFromCookies`, or an empty array when there are none.
 */
export async function canAccessProject(
  project: { id: string; user_id: string | null },
  userId: string | null,
  anonSessionIds: string[]
): Promise<boolean> {
  if (userId && project.user_id === userId) return true;
  if (project.user_id) return false;
  if (anonSessionIds.length === 0) return false;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('audit_sessions')
    .select('id')
    .in('id', anonSessionIds)
    .eq('project_id', project.id)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}

export function anonSessionIdsFromCookies(
  cookieStore: { get: (name: string) => { value: string } | undefined }
): string[] {
  const current = cookieStore.get(AUDIT_SESSION_COOKIE)?.value;
  const history = parseAuditSessionHistory(cookieStore.get(AUDIT_SESSION_HISTORY_COOKIE)?.value);
  return [...new Set([...(current ? parseAuditSessionHistory(current) : []), ...history])];
}
