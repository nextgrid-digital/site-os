import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import {
  createAuditSession,
  getAuditSession,
  getLatestAuditSessionForProject,
  type AuditSession,
} from '@/lib/db/audit-sessions';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { Website } from '@/lib/supabase/types';
import { createClient } from '@/utils/supabase/server';

export type ResolvedAuditWorkspace = {
  /** Canonical project UUID for tab links and APIs. */
  projectId: string;
  /** Preferred URL id (unlocked session id when available). */
  workspaceId: string;
  session: AuditSession | null;
  website: Website;
  domain: string;
  user: { id: string; email?: string | null } | null;
  userInitials: string | null;
  signedIn: boolean;
};

function initialsFromEmail(email: string | null | undefined) {
  if (!email) return null;
  const local = email.split('@')[0] || email;
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

/**
 * Resolve `/audit/[id]` where id may be an audit session id or a project id.
 * Cached per request so layout + page share one resolution.
 */
export const resolveAuditWorkspace = cache(async function resolveAuditWorkspace(
  id: string
): Promise<ResolvedAuditWorkspace> {
  if (!hasSupabaseConfig()) notFound();

  const supabase = getSupabaseAdmin();
  const cookieStore = await cookies();
  const authClient = createClient(cookieStore);

  const [userResult, sessionById] = await Promise.all([
    authClient.auth.getUser(),
    getAuditSession(id),
  ]);
  const user = userResult.data.user;

  let session: AuditSession | null = sessionById;
  let projectId = session?.project_id ?? null;

  if (!session) {
    const { data: project } = await supabase.from('projects').select('id, user_id').eq('id', id).maybeSingle();
    if (!project) notFound();
    if (project.user_id && project.user_id !== user?.id) notFound();
    projectId = project.id;
    session = await getLatestAuditSessionForProject(project.id);
  } else {
    const { data: project } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .maybeSingle();
    if (project?.user_id && project.user_id !== user?.id) notFound();
  }

  if (!projectId) notFound();

  const { data: website } = await supabase
    .from('websites')
    .select('id, project_id, url, domain, crawl_max_pages, created_at')
    .eq('project_id', projectId)
    .single();
  if (!website) notFound();

  if (!session) {
    session = await createAuditSession({
      projectId,
      websiteUrl: website.url,
      domain: website.domain,
    });
  }

  const workspaceId = session?.id || projectId;

  return {
    projectId,
    workspaceId,
    session,
    website: website as Website,
    domain: website.domain,
    user: user ? { id: user.id, email: user.email } : null,
    userInitials: initialsFromEmail(user?.email),
    signedIn: Boolean(user),
  };
});

/** Resolve project id only (for nested routes that already know they need a project). */
export async function resolveAuditProjectId(id: string): Promise<string> {
  const ws = await resolveAuditWorkspace(id);
  return ws.projectId;
}
