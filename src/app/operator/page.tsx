import { AddSiteDialog } from '@/components/operator/add-site-dialog';
import { OperatorShell } from '@/components/operator/operator-shell';
import { SiteCard, type SiteCardData } from '@/components/operator/site-card';
import type { AuditReadiness } from '@/lib/audit/audit-readiness';
import { deriveConnectionStatus } from '@/lib/google/connection-status';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { Project, Website } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

async function listSiteCards(): Promise<SiteCardData[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('projects')
    .select('*, websites(*)')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(error.message);

  const projects = (data ?? []).map((row) => {
    const record = row as Project & { websites: Website | Website[] | null };
    const websites = record.websites;
    const website = Array.isArray(websites) ? (websites[0] ?? null) : websites;
    return {
      id: record.id,
      name: record.name,
      status: record.status,
      user_id: record.user_id,
      client_access_confirmed_at: record.client_access_confirmed_at,
      created_at: record.created_at,
      updated_at: record.updated_at,
      website,
    };
  });

  if (projects.length === 0) return [];

  const projectIds = projects.map((project) => project.id);
  const { data: audits } = await supabase
    .from('audit_runs')
    .select('id, project_id, status, run_type, audit_readiness, completed_at, created_at')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false });

  const latestByProject = new Map<
    string,
    {
      id: string;
      status: string;
      run_type: string;
      audit_readiness: AuditReadiness | null;
      completed_at: string | null;
    }
  >();

  for (const audit of audits ?? []) {
    if (!latestByProject.has(audit.project_id)) {
      latestByProject.set(audit.project_id, {
        id: audit.id,
        status: audit.status,
        run_type: audit.run_type,
        audit_readiness: (audit.audit_readiness as AuditReadiness | null) ?? null,
        completed_at: audit.completed_at,
      });
    }
  }

  const completedIds = Array.from(latestByProject.values())
    .filter((audit) => audit.status === 'completed')
    .map((audit) => audit.id);

  const metricsByRun = new Map<string, number>();
  if (completedIds.length > 0) {
    const { data: metrics } = await supabase
      .from('audit_metrics')
      .select('audit_run_id, findings_count')
      .in('audit_run_id', completedIds);
    for (const row of metrics ?? []) {
      metricsByRun.set(row.audit_run_id, row.findings_count);
    }
  }

  const ownerIds = Array.from(
    new Set(projects.map((project) => project.user_id).filter((id): id is string => Boolean(id)))
  );
  const planByOwner = new Map<string, 'free' | 'paid'>();
  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, plan')
      .in('user_id', ownerIds);
    for (const row of profiles ?? []) {
      planByOwner.set(row.user_id, row.plan === 'paid' ? 'paid' : 'free');
    }
  }

  const [{ data: connections }, { data: gscSelected }, { data: ga4Selected }, { data: adsSelected }] =
    await Promise.all([
      supabase
        .from('google_connections')
        .select('project_id, token_expiry, updated_at')
        .in('project_id', projectIds),
      supabase
        .from('search_console_properties')
        .select('project_id')
        .in('project_id', projectIds)
        .eq('is_selected', true),
      supabase.from('ga4_properties').select('project_id').in('project_id', projectIds).eq('is_selected', true),
      supabase
        .from('google_ads_accounts')
        .select('project_id')
        .in('project_id', projectIds)
        .eq('is_selected', true),
    ]);

  const connectionByProject = new Map<string, { token_expiry: string | null; updated_at: string }>();
  for (const row of connections ?? []) {
    connectionByProject.set(row.project_id, { token_expiry: row.token_expiry, updated_at: row.updated_at });
  }
  const mappedProjectIds = new Set([
    ...(gscSelected ?? []).map((row) => row.project_id),
    ...(ga4Selected ?? []).map((row) => row.project_id),
    ...(adsSelected ?? []).map((row) => row.project_id),
  ]);

  return projects.map((project) => {
    const latest = latestByProject.get(project.id) ?? null;
    const ownerId = project.user_id;
    const connectionStatus = deriveConnectionStatus(
      connectionByProject.get(project.id) ?? null,
      mappedProjectIds.has(project.id)
    );
    return {
      id: project.id,
      name: project.name,
      domain: project.website?.domain ?? null,
      url: project.website?.url ?? null,
      updatedAt: project.updated_at,
      plan: ownerId ? (planByOwner.get(ownerId) ?? 'free') : null,
      connectionStatus: connectionStatus.status,
      clientConfirmedAt: project.client_access_confirmed_at,
      latestAudit: latest
        ? {
            status: latest.status,
            runType: latest.run_type,
            readiness: latest.audit_readiness,
            findingsCount: metricsByRun.get(latest.id) ?? null,
            completedAt: latest.completed_at,
          }
        : null,
    };
  });
}

export default async function OperatorHomePage() {
  if (!hasSupabaseConfig()) {
    return (
      <OperatorShell>
        <div className="rounded-2xl border border-white/10 bg-[#141416] px-5 py-8 text-center">
          <p className="text-sm font-medium text-white">Supabase configuration required</p>
          <p className="mt-2 text-sm text-white/55">
            Copy <code className="text-white/80">env.example.txt</code> to{' '}
            <code className="text-white/80">.env.local</code> and set your credentials.
          </p>
        </div>
      </OperatorShell>
    );
  }

  const sites = await listSiteCards();

  return (
    <OperatorShell>
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-end">
          <AddSiteDialog />
        </div>

        <section className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-white/40 uppercase">All</p>

          {sites.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/12 bg-[#141416]/60 px-5 py-14 text-center">
              <p className="text-sm font-medium text-white">No websites yet</p>
              <p className="mt-1 text-sm text-white/50">Add a site to start auditing.</p>
              <div className="mt-5 flex justify-center">
                <AddSiteDialog triggerLabel="Add site" />
              </div>
            </div>
          ) : (
            <ul className="grid gap-3">
              {sites.map((site) => (
                <li key={site.id}>
                  <SiteCard site={site} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </OperatorShell>
  );
}
