import { getSupabaseAdmin } from '@/lib/supabase/server';
import type { TeaserSnapshot } from '@/lib/audit/teaser-snapshot';

export { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';

export type AuditSessionStatus = 'pending' | 'teaser_ready' | 'free_ready' | 'failed';
export type AuditUpgradeState = 'none' | 'intake_started' | 'connected';

export interface AuditSession {
  id: string;
  project_id: string;
  website_url: string;
  domain: string;
  email: string | null;
  user_id: string | null;
  teaser_snapshot: TeaserSnapshot | Record<string, unknown> | null;
  status: AuditSessionStatus;
  upgrade_state: AuditUpgradeState;
  full_unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function createAuditSession(input: {
  projectId: string;
  websiteUrl: string;
  domain: string;
  teaserSnapshot?: TeaserSnapshot | Record<string, unknown> | null;
}) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .insert({
      project_id: input.projectId,
      website_url: input.websiteUrl,
      domain: input.domain,
      teaser_snapshot: input.teaserSnapshot ?? null,
      status: 'pending',
      upgrade_state: 'none',
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as AuditSession;
}

export async function getAuditSession(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AuditSession | null) ?? null;
}

export async function getLatestAuditSessionForProject(projectId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AuditSession | null) ?? null;
}

export async function updateAuditSessionTeaser(
  sessionId: string,
  teaserSnapshot: TeaserSnapshot | Record<string, unknown>
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .update({
      teaser_snapshot: teaserSnapshot,
      status: 'teaser_ready',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as AuditSession;
}

export async function markAuditSessionFreeReady(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .update({
      status: 'free_ready',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as AuditSession;
}

export async function markAuditSessionFailed(sessionId: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('audit_sessions')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
  if (error) throw new Error(error.message);
}

export async function setAuditSessionUpgradeState(
  sessionId: string,
  upgradeState: AuditUpgradeState
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .update({
      upgrade_state: upgradeState,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as AuditSession;
}

export async function unlockAuditSession(
  sessionId: string,
  input: { userId: string; email: string }
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .update({
      user_id: input.userId,
      email: input.email,
      full_unlocked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return data as AuditSession;
}

export async function listUnlockedAuditSessionsForUser(userId: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('audit_sessions')
    .select('*')
    .eq('user_id', userId)
    .not('full_unlocked_at', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as AuditSession[];
}

export function isAuditSessionUnlocked(session: AuditSession | null | undefined) {
  return Boolean(session?.full_unlocked_at && session?.user_id);
}

export function asTeaserSnapshot(
  value: AuditSession['teaser_snapshot']
): TeaserSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const snap = value as TeaserSnapshot;
  if (!Array.isArray(snap.categories)) return null;
  return snap;
}
