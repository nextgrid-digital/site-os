import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SitesDashboard, type SitesDashboardSite } from '@/components/audit/sites-dashboard';
import { listUnlockedAuditSessionsForUser } from '@/lib/db/audit-sessions';
import { getUserPlan } from '@/lib/db/profiles';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

function initialsFromEmail(email: string | null | undefined) {
  if (!email) return 'SO';
  const local = email.split('@')[0] || email;
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  if (!hasSupabaseConfig()) {
    redirect('/');
  }

  const cookieStore = await cookies();
  const supabaseAuth = createClient(cookieStore);
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    redirect('/?signin=1');
  }

  const { session: highlightSessionId } = await searchParams;
  const sessions = await listUnlockedAuditSessionsForUser(user.id);
  const latestByProject = new Map<string, (typeof sessions)[number]>();
  for (const session of sessions) {
    if (!latestByProject.has(session.project_id)) {
      latestByProject.set(session.project_id, session);
    }
  }
  const uniqueSessions = [...latestByProject.values()];
  const projectIds = uniqueSessions.map((s) => s.project_id);

  const findingsByProject = new Map<string, number>();
  if (projectIds.length > 0) {
    const admin = getSupabaseAdmin();
    const { data: audits } = await admin
      .from('audit_runs')
      .select('id, project_id, status, created_at')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false });

    const latestRunByProject = new Map<string, string>();
    for (const audit of audits ?? []) {
      if (!latestRunByProject.has(audit.project_id) && audit.status === 'completed') {
        latestRunByProject.set(audit.project_id, audit.id);
      }
    }

    const runIds = [...latestRunByProject.values()];
    if (runIds.length > 0) {
      const { data: metrics } = await admin
        .from('audit_metrics')
        .select('audit_run_id, findings_count')
        .in('audit_run_id', runIds);
      const runToProject = new Map(
        [...latestRunByProject.entries()].map(([projectId, runId]) => [runId, projectId])
      );
      for (const row of metrics ?? []) {
        const projectId = runToProject.get(row.audit_run_id);
        if (projectId) findingsByProject.set(projectId, row.findings_count ?? 0);
      }
    }
  }

  const sites: SitesDashboardSite[] = uniqueSessions.map((session) => ({
    sessionId: session.id,
    projectId: session.project_id,
    name: session.domain || 'My site',
    domain: session.domain,
    findingsCount: findingsByProject.get(session.project_id) ?? null,
    status: session.status,
  }));

  const plan = await getUserPlan(user.id);

  return (
    <SitesDashboard
      sites={sites}
      userInitials={initialsFromEmail(user.email)}
      highlightSessionId={highlightSessionId ?? null}
      showUpgradeBanner={plan !== 'paid'}
    />
  );
}
