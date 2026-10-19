import { NextResponse } from 'next/server';
import { loadDashboardMetricsForProject } from '@/lib/db/connected-metrics';
import { loadBrandEvidenceForAuditRun } from '@/lib/evidence/persist';
import {
  getAuditWorkBundle,
  getGoogleConnection,
  getGrowthBriefForAuditRun,
  getPreferredCompletedAuditRunId,
  getProjectOverview,
  getWorkOrdersForAudit,
  listAuditRuns,
  listPropertyOptions,
  ProjectAccessError,
  requireProjectOwner,
} from '@/lib/db/projects';
import { loadProjectConnectorStatuses } from '@/lib/connectors/project-status';
import { deriveConnectionStatus } from '@/lib/google/connection-status';
import { getFreshGoogleConnection } from '@/lib/google/fresh-connection';
import { getMissingGoogleFeatures, getOperatorEmail } from '@/lib/google/oauth';
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

    const dash = await loadDashboardMetricsForProject(projectId);
    const runId = dash.auditRunId ?? (await getPreferredCompletedAuditRunId(projectId));

    const body: Record<string, unknown> = {
      projectId,
      auditRunId: dash.auditRunId,
      connected: dash.connected,
      growthBrief: dash.growthBrief,
      brief: null,
      monthly: null,
      connect: null,
    };

    if (includes.has('brief') && runId) {
      const work = await getAuditWorkBundle(runId);
      if (!body.growthBrief) {
        body.growthBrief = await getGrowthBriefForAuditRun(runId);
      }
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
      const work = await getAuditWorkBundle(runId);
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

    if (includes.has('connect')) {
      const [properties, storedConnection, connectorState, connectProject] = await Promise.all([
        listPropertyOptions(projectId),
        getGoogleConnection(projectId),
        loadProjectConnectorStatuses(projectId),
        getProjectOverview(projectId),
      ]);
      const freshConnection = storedConnection
        ? await getFreshGoogleConnection(storedConnection)
        : null;
      const connection = freshConnection?.connection ?? null;
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
        operatorEmail: getOperatorEmail(),
        connectedEmail: connection?.operator_email || null,
        tokenExpiry: connection?.token_expiry ?? null,
        lastSyncedAt: connection?.updated_at ?? null,
        scopes: connection?.scopes ?? [],
        missingFeatures: connection
          ? getMissingGoogleFeatures(connection.scopes ?? []).map((feature) => ({
              key: feature.key,
              label: feature.label,
            }))
          : [],
        connectionStatus: freshConnection?.needsReconnect
          ? 'needs_refresh'
          : deriveConnectionStatus(connection, hasSelectedProperty).status,
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
