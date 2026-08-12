import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SitesDashboard, type SitesDashboardSite } from '@/components/audit/sites-dashboard';
import { listUnlockedAuditSessionsForUser } from '@/lib/db/audit-sessions';
import {
  getStoredGoogleInventory,
  listGoogleInventoryCandidates,
} from '@/lib/db/google-inventory';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

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
    redirect('/login?next=/app');
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
  const existingDomains = uniqueSessions.map((s) => s.domain).filter(Boolean);

  const findingsByProject = new Map<string, number>();
  const connectionsByProject = new Map<
    string,
    { gsc: boolean; ga4: boolean; ads: boolean }
  >();

  if (projectIds.length > 0) {
    const admin = getSupabaseAdmin();
    const [{ data: audits }, { data: gscSelected }, { data: ga4Selected }, { data: adsSelected }] =
      await Promise.all([
        admin
          .from('audit_runs')
          .select('id, project_id, status, created_at')
          .in('project_id', projectIds)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(Math.max(projectIds.length * 3, 20)),
        admin
          .from('search_console_properties')
          .select('project_id')
          .in('project_id', projectIds)
          .eq('is_selected', true),
        admin
          .from('ga4_properties')
          .select('project_id')
          .in('project_id', projectIds)
          .eq('is_selected', true),
        admin
          .from('google_ads_accounts')
          .select('project_id')
          .in('project_id', projectIds)
          .eq('is_selected', true),
      ]);

    for (const projectId of projectIds) {
      connectionsByProject.set(projectId, { gsc: false, ga4: false, ads: false });
    }
    for (const row of gscSelected ?? []) {
      const current = connectionsByProject.get(row.project_id) ?? {
        gsc: false,
        ga4: false,
        ads: false,
      };
      connectionsByProject.set(row.project_id, { ...current, gsc: true });
    }
    for (const row of ga4Selected ?? []) {
      const current = connectionsByProject.get(row.project_id) ?? {
        gsc: false,
        ga4: false,
        ads: false,
      };
      connectionsByProject.set(row.project_id, { ...current, ga4: true });
    }
    for (const row of adsSelected ?? []) {
      const current = connectionsByProject.get(row.project_id) ?? {
        gsc: false,
        ga4: false,
        ads: false,
      };
      connectionsByProject.set(row.project_id, { ...current, ads: true });
    }

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
    connections: connectionsByProject.get(session.project_id) ?? {
      gsc: false,
      ga4: false,
      ads: false,
    },
  }));

  const storedInventory = await getStoredGoogleInventory();
  const candidates = await listGoogleInventoryCandidates(existingDomains, storedInventory);

  return (
    <SitesDashboard
      sites={sites}
      highlightSessionId={highlightSessionId ?? null}
      showUpgradeBanner={false}
      googleInventory={{
        connected: storedInventory?.connected ?? false,
        operatorEmail: storedInventory?.operatorEmail ?? null,
        syncedAt: storedInventory?.syncedAt ?? null,
        candidates,
      }}
    />
  );
}
