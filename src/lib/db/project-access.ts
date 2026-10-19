import { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';
import { getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Who may read or change a project.
 *
 * - The owner (`projects.user_id`) may.
 * - An admin (`profiles.is_admin`) may, including on behalf of a client.
 * - A project with no owner is an anonymous free audit. Only the browser that
 *   started it may use it, identified by the `audit_session_id` cookie, which
 *   must point at an audit session for that project.
 *
 * Pass the cookie value as `anonSessionId`, or null when there is none.
 */
export async function canAccessProject(
  project: { id: string; user_id: string | null },
  userId: string | null,
  anonSessionId: string | null
): Promise<boolean> {
  if (userId && project.user_id === userId) return true;
  if (userId && (await isAdmin(userId))) return true;
  if (project.user_id) return false;
  if (!anonSessionId) return false;

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('audit_sessions')
    .select('id')
    .eq('id', anonSessionId)
    .eq('project_id', project.id)
    .maybeSingle();
  return Boolean(data);
}

export function anonSessionIdFromCookies(cookieStore: { get: (name: string) => { value: string } | undefined }) {
  return cookieStore.get(AUDIT_SESSION_COOKIE)?.value ?? null;
}

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.is_admin === true;
}
