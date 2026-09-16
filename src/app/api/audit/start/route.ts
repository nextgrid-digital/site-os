import { after, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { buildTeaserSnapshot } from '@/lib/audit/teaser-snapshot';
import { AUDIT_SESSION_COOKIE } from '@/lib/audit/session-cookie';
import { runAudit } from '@/lib/audit/run-audit';
import {
  createAuditSession,
  markAuditSessionFailed,
  markAuditSessionFreeReady,
  unlockAuditSession,
  updateAuditSessionTeaser,
} from '@/lib/db/audit-sessions';
import { claimProjectOwnership, createProject, findOwnedProjectByDomain } from '@/lib/db/projects';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import { extractDomain, normalizeWebsiteUrl } from '@/lib/utils/urls';
import { createClient } from '@/utils/supabase/server';

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body.url === 'string' ? body.url.trim() : '';
  if (!rawUrl) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  let websiteUrl: string;
  let domain: string;
  try {
    websiteUrl = normalizeWebsiteUrl(rawUrl);
    domain = extractDomain(websiteUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const authClient = createClient(cookieStore);
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const supabase = getSupabaseAdmin();

  let projectId: string;
  if (user?.id) {
    const ownedProjectId = await findOwnedProjectByDomain(domain, user.id);
    if (ownedProjectId) {
      projectId = ownedProjectId;
    } else {
      const project = await createProject({ name: domain, websiteUrl, userId: user.id });
      projectId = project.id;
    }
  } else {
    const project = await createProject({ name: domain, websiteUrl });
    projectId = project.id;
  }

  const session = await createAuditSession({ projectId, websiteUrl, domain });

  let authenticated = false;
  if (user?.id && user.email) {
    try {
      await unlockAuditSession(session.id, {
        userId: user.id,
        email: user.email,
      });
      await claimProjectOwnership(projectId, user.id);
      authenticated = true;
    } catch (error) {
      console.error('[audit/start] unlock failed', error);
    }
  }

  after(async () => {
    try {
      await runAudit(projectId, 'free', null);
      const { data: auditRun } = await supabase
        .from('audit_runs')
        .select('id, site_only_analysis')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!auditRun) {
        await markAuditSessionFailed(session.id);
        return;
      }
      const { data: findings } = await supabase
        .from('findings')
        .select('id, type, category, severity, title, summary, priority_score')
        .eq('audit_run_id', auditRun.id)
        .order('priority_score', { ascending: false });
      const siteOnlySummary =
        (auditRun.site_only_analysis as {
          inferred?: { businessAppearance?: string | null };
          whatTheSiteSays?: string[];
          summary?: string;
        } | null)?.inferred?.businessAppearance ??
        (auditRun.site_only_analysis as { whatTheSiteSays?: string[] } | null)?.whatTheSiteSays?.[0] ??
        (auditRun.site_only_analysis as { summary?: string } | null)?.summary ??
        null;
      const teaser = buildTeaserSnapshot({
        domain,
        websiteUrl,
        siteOnlySummary,
        findings: findings ?? [],
      });
      await updateAuditSessionTeaser(session.id, teaser);
      await markAuditSessionFreeReady(session.id);
    } catch (error) {
      console.error('[audit/start] free audit failed', error);
      try {
        await markAuditSessionFailed(session.id);
      } catch {
        /* ignore */
      }
    }
  });

  const response = NextResponse.json({
    sessionId: session.id,
    projectId,
    domain,
    authenticated,
  });
  response.cookies.set(AUDIT_SESSION_COOKIE, session.id, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
