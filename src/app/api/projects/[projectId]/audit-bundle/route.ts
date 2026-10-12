import { NextResponse } from 'next/server';
import { loadDashboardMetricsForProject } from '@/lib/db/connected-metrics';
import { getSessionPlan } from '@/lib/db/profiles';
import { loadBrandEvidenceForAuditRun } from '@/lib/evidence/persist';
import {
  getAuditWorkBundle,
  getGoogleConnection,
  getGrowthBriefForAuditRun,
  getLeadSummaryOnly,
  getPreferredCompletedAuditRunId,
  getProjectLeadReportingSummary,
  getProjectOverview,
  getWorkOrdersForAudit,
  listAuditRuns,
  listLeads,
  listPropertyOptions,
  ProjectAccessError,
  requireProjectOwner,
} from '@/lib/db/projects';
import { loadProjectConnectorStatuses } from '@/lib/connectors/project-status';
import { deriveConnectionStatus } from '@/lib/google/connection-status';
import { getOperatorEmail } from '@/lib/google/oauth';
import { getSupabaseAdmin, hasSupabaseConfig } from '@/lib/supabase/server';
import type { Finding } from '@/lib/supabase/types';
import { buildMonthlyCompare } from '@/lib/workflow/monthly-compare';
import { buildUnifiedWorkItems } from '@/lib/workflow/work-items';

type RouteContext = { params: Promise<{ projectId: string }> };

function parseIncludes(raw: string | null): Set<string> {
  if (!raw || raw === '1') return new Set(['dashboard']);
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export async function GET(request: Request, context: RouteContext) {
  try {
    if (!hasSupabaseConfig()) {
      return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 500 });
    }

    const { projectId } = await context.params;
    await requireProjectOwner(projectId);
    const includeParam = new URL(request.url).searchParams.get('include');
    const includes = parseIncludes(includeParam);
    // Legacy: include=work
    if (includeParam === 'work') {
      includes.add('work');
      includes.add('dashboard');
    }

    const dash = await loadDashboardMetricsForProject(projectId);
    const runId = dash.auditRunId ?? (await getPreferredCompletedAuditRunId(projectId));

    const body: Record<string, unknown> = {
      projectId,
      auditRunId: dash.auditRunId,
      connected: dash.connected,
      growthBrief: dash.growthBrief,
      leadSummary: null,
      work: null,
      brief: null,
      monthly: null,
      leads: null,
      connect: null,
    };

    if (includes.has('dashboard') || includes.has('leads')) {
      body.leadSummary = await getLeadSummaryOnly(projectId);
    }

    if (includes.has('work') || includes.has('brief') || includes.has('monthly')) {
      if (runId) {
        const work = await getAuditWorkBundle(runId);
        body.work = work;
        if (!body.growthBrief) {
          body.growthBrief = await getGrowthBriefForAuditRun(runId);
        }
      }
    }

    if (includes.has('brief') && runId) {
      const work = (body.work as Awaited<ReturnType<typeof getAuditWorkBundle>> | null) ??
        (await getAuditWorkBundle(runId));
      body.work = work;
      const promptsByFindingId = new Map(work.prompts.map((p) => [p.finding_id, p]));
      const workItems = buildUnifiedWorkItems({
        findings: work.findings,
        workOrders: work.workOrders,
        promptsByFindingId,
      });
      const pending = workItems.filter((i) => i.status === 'open' || i.status === 'in_progress');

      const runs = await listAuditRuns(projectId);
      const completed = runs.filter((r) => r.status === 'completed');
      const previous = completed[1] ?? null;
      let monthly = null;
      if (previous) {
        const supabase = getSupabaseAdmin();
        const [{ data: prevFindings }, prevOrders, evidence] = await Promise.all([
          supabase
            .from('findings')
            .select('id')
            .eq('audit_run_id', previous.id),
          getWorkOrdersForAudit(previous.id),
          loadBrandEvidenceForAuditRun(supabase, runId),
        ]);
        monthly = buildMonthlyCompare({
          historicalChanges: evidence?.historical_changes ?? [],
          openWorkItems: pending,
          currentFindingCount: work.findings.length,
          previousFindingCount: (prevFindings as Finding[] | null)?.length ?? 0,
          currentOpenWorkCount: pending.length,
          previousOpenWorkCount: prevOrders.filter((o) => (o.status ?? 'open') === 'open')
            .length,
        });
      }

      body.brief = {
        growthBrief: body.growthBrief,
        pending,
        monthly,
      };
    }

    if (includes.has('monthly') && runId) {
      const work = (body.work as Awaited<ReturnType<typeof getAuditWorkBundle>> | null) ??
        (await getAuditWorkBundle(runId));
      body.work = work;
      const promptsByFindingId = new Map(work.prompts.map((p) => [p.finding_id, p]));
      const workItems = buildUnifiedWorkItems({
        findings: work.findings,
        workOrders: work.workOrders,
        promptsByFindingId,
      });
      const pending = workItems.filter((i) => i.status === 'open' || i.status === 'in_progress');

      const runs = await listAuditRuns(projectId);
      const completed = runs.filter((r) => r.status === 'completed');
      const current = completed[0] ?? null;
      const previous = completed[1] ?? null;
      const supabase = getSupabaseAdmin();
      const evidence = await loadBrandEvidenceForAuditRun(supabase, runId);

      let previousFindingCount: number | null = null;
      let previousOpenWorkCount: number | null = null;
      if (previous) {
        const [{ data: prevFindings }, prevOrders] = await Promise.all([
          supabase.from('findings').select('id').eq('audit_run_id', previous.id),
          getWorkOrdersForAudit(previous.id),
        ]);
        previousFindingCount = (prevFindings as Finding[] | null)?.length ?? 0;
        previousOpenWorkCount = prevOrders.filter((o) => (o.status ?? 'open') === 'open').length;
      }

      const compare = previous
        ? buildMonthlyCompare({
            historicalChanges: evidence?.historical_changes ?? [],
            openWorkItems: pending,
            currentFindingCount: work.findings.length,
            previousFindingCount,
            currentOpenWorkCount: pending.length,
            previousOpenWorkCount,
          })
        : null;

      const formatRun = (createdAt: string, runType: string) =>
        `${new Date(createdAt).toLocaleDateString()} · ${runType}`;

      body.monthly = {
        compare,
        hasPrevious: Boolean(previous),
        currentLabel: current ? formatRun(current.created_at, current.run_type) : null,
        previousLabel: previous ? formatRun(previous.created_at, previous.run_type) : null,
      };
    }

    if (includes.has('leads')) {
      const [project, leads] = await Promise.all([
        getProjectOverview(projectId),
        listLeads(projectId),
      ]);
      const reporting = await getProjectLeadReportingSummary(projectId, leads);
      body.leads = {
        projectName: project?.name ?? 'Project',
        leads,
        reporting,
      };
    }

    if (includes.has('connect')) {
      const [properties, connection, connectorState, session, connectProject] = await Promise.all([
        listPropertyOptions(projectId),
        getGoogleConnection(projectId),
        loadProjectConnectorStatuses(projectId),
        getSessionPlan(),
        getProjectOverview(projectId),
      ]);
      const hasSelectedProperty =
        properties.gsc.some((p) => p.is_selected) ||
        properties.ga4.some((p) => p.is_selected) ||
        properties.ads.some((p) => p.is_selected);
      body.connect = {
        googleConnected: Boolean(connection),
        gscProperties: properties.gsc,
        ga4Properties: properties.ga4,
        adsAccounts: properties.ads,
        connectorStatuses: connectorState.statuses,
        operatorEmail: connection?.operator_email ?? getOperatorEmail(),
        tokenExpiry: connection?.token_expiry ?? null,
        lastSyncedAt: connection?.updated_at ?? null,
        scopes: connection?.scopes ?? [],
        isAdmin: session.isAdmin,
        plan: session.plan,
        connectionStatus: deriveConnectionStatus(connection, hasSelectedProperty).status,
        clientAccessConfirmedAt: connectProject?.client_access_confirmed_at ?? null,
      };
    }

    return NextResponse.json(body);
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load audit bundle.' },
      { status: 500 }
    );
  }
}
