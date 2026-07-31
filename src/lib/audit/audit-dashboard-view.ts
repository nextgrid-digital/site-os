import type { FreeReportViewModel, StoryFlowStep } from '@/lib/audit/free-report-view';
import type {
  ChannelTrafficRow,
  Finding,
  PageMetric,
  QueryMetric,
} from '@/lib/supabase/types';

export type DashboardMode = 'health' | 'traffic';

export type HealthTileId =
  | 'confidence'
  | 'clarity'
  | 'answerability'
  | 'pages'
  | 'blockers'
  | 'findings';

export type TrafficTileId =
  | 'sessions'
  | 'engaged'
  | 'conversions'
  | 'pages_with_traffic'
  | 'channels'
  | 'keywords';

export type DashboardTileId = HealthTileId | TrafficTileId;

export type ChartBar = {
  id: string;
  label: string;
  value: number;
  detail?: string;
};

export type ListRow = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  severity?: string;
};

export type DetailCard = {
  title: string;
  body: string;
  meta?: string;
};

export type DashboardTile = {
  id: DashboardTileId;
  label: string;
  value: string;
  hint?: string;
};

export type AuditDashboardView = {
  projectId: string;
  hasLiveTraffic: boolean;
  googleConnected: boolean;
  health: {
    tiles: DashboardTile[];
    charts: Record<HealthTileId, ChartBar[]>;
    structureRows: ListRow[];
    findingRows: ListRow[];
    storyByStatus: Record<'strong' | 'weak' | 'missing', StoryFlowStep[]>;
    findingsBySeverity: Record<string, Finding[]>;
    blockers: string[];
  };
  traffic: {
    tiles: DashboardTile[];
    charts: Record<TrafficTileId, ChartBar[]>;
    pageRows: ListRow[];
    channelRows: ListRow[];
    queryRows: ListRow[];
  } | null;
};

export type HumanTrafficInput = {
  projectId: string;
  googleConnected: boolean;
  trafficByChannel: ChannelTrafficRow[];
  pageMetrics: PageMetric[];
  queryMetrics: QueryMetric[];
  /** Optional totals from audit_metrics when page-level GA is sparse. */
  totals?: {
    sessions?: number;
    engagedSessions?: number;
    conversions?: number;
    clicks?: number;
    impressions?: number;
  } | null;
};

function pageHasTraffic(p: PageMetric) {
  return (
    p.ga_sessions > 0 ||
    p.ga_engaged_sessions > 0 ||
    p.gsc_clicks > 0 ||
    p.gsc_impressions > 0
  );
}

function buildTrafficBlock(
  traffic: HumanTrafficInput
): { hasLiveTraffic: boolean; traffic: NonNullable<AuditDashboardView['traffic']> } {
  const pagesWithTraffic = traffic.pageMetrics
    .filter(pageHasTraffic)
    .toSorted((a, b) => {
      const scoreA = a.ga_sessions || a.gsc_impressions || a.gsc_clicks;
      const scoreB = b.ga_sessions || b.gsc_impressions || b.gsc_clicks;
      return scoreB - scoreA;
    });

  const channels = traffic.trafficByChannel
    .filter((c) => c.sessions > 0)
    .toSorted((a, b) => b.sessions - a.sessions);

  const queries = traffic.queryMetrics
    .filter((q) => q.impressions > 0 || q.clicks > 0)
    .toSorted((a, b) => b.impressions - a.impressions);

  const hasLiveTraffic = pagesWithTraffic.length > 0 || channels.length > 0 || queries.length > 0;

  const sessionsFromPages = pagesWithTraffic.reduce((sum, p) => sum + p.ga_sessions, 0);
  const engagedFromPages = pagesWithTraffic.reduce((sum, p) => sum + p.ga_engaged_sessions, 0);
  const conversionsFromPages = pagesWithTraffic.reduce((sum, p) => sum + p.ga_conversions, 0);

  const sessions = Math.max(sessionsFromPages, traffic.totals?.sessions ?? 0);
  const engaged = Math.max(engagedFromPages, traffic.totals?.engagedSessions ?? 0);
  const conversions = Math.max(conversionsFromPages, traffic.totals?.conversions ?? 0);
  const engagedPct = sessions > 0 ? Math.round((engaged / sessions) * 100) : null;

  const pageBars: ChartBar[] = pagesWithTraffic.slice(0, 10).map((p) => ({
    id: p.id,
    label: p.path || '/',
    value: p.ga_sessions > 0 ? p.ga_sessions : p.gsc_impressions || p.gsc_clicks,
    detail:
      p.ga_sessions > 0
        ? `${p.ga_sessions} sessions · ${p.ga_engaged_sessions} engaged`
        : `${p.gsc_clicks} clicks · ${p.gsc_impressions} impressions`,
  }));

  const channelBars: ChartBar[] = channels.slice(0, 10).map((c, i) => ({
    id: `${c.channel}-${c.sourceMedium}-${i}`,
    label: c.channel || c.sourceMedium || 'Other',
    value: c.sessions,
    detail: `${c.sourceMedium} · ${c.conversions} conversions`,
  }));

  const queryBars: ChartBar[] = queries.slice(0, 10).map((q) => ({
    id: q.id,
    label: q.query,
    value: q.impressions > 0 ? q.impressions : q.clicks,
    detail: `${q.clicks} clicks · ${q.impressions} impressions`,
  }));

  const trafficCharts: Record<TrafficTileId, ChartBar[]> = {
    sessions: pageBars,
    engaged: pageBars,
    conversions: channelBars.length ? channelBars : pageBars,
    pages_with_traffic: pageBars,
    channels: channelBars,
    keywords: queryBars,
  };

  return {
    hasLiveTraffic,
    traffic: {
      tiles: [
        { id: 'sessions', label: 'Sessions', value: sessions.toLocaleString() },
        {
          id: 'engaged',
          label: 'Engaged',
          value: engagedPct != null ? `${engagedPct}%` : engaged.toLocaleString(),
          hint: engagedPct != null ? `${engaged.toLocaleString()} engaged` : undefined,
        },
        { id: 'conversions', label: 'Conversions', value: conversions.toLocaleString() },
        {
          id: 'pages_with_traffic',
          label: 'Pages',
          value: String(pagesWithTraffic.length),
          hint: 'with traffic',
        },
        { id: 'channels', label: 'Channels', value: String(channels.length) },
        { id: 'keywords', label: 'Keywords', value: String(queries.length) },
      ],
      charts: trafficCharts,
      pageRows: pagesWithTraffic.slice(0, 8).map((p) => ({
        id: p.id,
        label: p.path || '/',
        value: (p.ga_sessions || p.gsc_impressions || p.gsc_clicks).toLocaleString(),
        detail:
          p.ga_sessions > 0
            ? `${p.ga_engaged_sessions} engaged`
            : `${p.gsc_clicks} clicks · ${p.gsc_impressions} impr.`,
      })),
      channelRows: channels.slice(0, 8).map((c, i) => ({
        id: `${c.channel}-${i}`,
        label: c.channel || 'Other',
        value: c.sessions.toLocaleString(),
        detail: c.sourceMedium,
      })),
      queryRows: queries.slice(0, 8).map((q) => ({
        id: q.id,
        label: q.query,
        value: q.impressions.toLocaleString(),
        detail: `${q.clicks} clicks`,
      })),
    },
  };
}

const EMPTY_HEALTH: AuditDashboardView['health'] = {
  tiles: [],
  charts: {
    confidence: [],
    clarity: [],
    answerability: [],
    pages: [],
    blockers: [],
    findings: [],
  },
  structureRows: [],
  findingRows: [],
  storyByStatus: { strong: [], weak: [], missing: [] },
  findingsBySeverity: {},
  blockers: [],
};

/** Traffic-only dashboard for the Connected tab (no free-report health scores). */
export function buildTrafficDashboardView(input: HumanTrafficInput): AuditDashboardView {
  const { hasLiveTraffic, traffic } = buildTrafficBlock(input);
  return {
    projectId: input.projectId,
    hasLiveTraffic,
    googleConnected: Boolean(input.googleConnected),
    health: EMPTY_HEALTH,
    traffic,
  };
}

function kindLabel(kind: string) {
  return kind.replace(/_/g, ' ');
}

function severityOrder(s: string) {
  switch (s) {
    case 'critical':
      return 0;
    case 'high':
      return 1;
    case 'medium':
      return 2;
    case 'low':
      return 3;
    default:
      return 4;
  }
}

export function buildAuditDashboardView(input: {
  projectId: string;
  view: FreeReportViewModel;
  findings: Finding[];
  traffic?: HumanTrafficInput | null;
}): AuditDashboardView {
  const { view, findings, traffic, projectId } = input;

  const healthTiles: DashboardTile[] = view.scoreStrip.map((item) => ({
    id: item.id as HealthTileId,
    label: item.label,
    value: item.value,
  }));

  const severityKeys = ['critical', 'high', 'medium', 'low', 'info'] as const;
  const findingsBySeverity: Record<string, Finding[]> = {};
  for (const key of severityKeys) findingsBySeverity[key] = [];
  for (const f of findings) {
    const key = (f.severity || 'info').toLowerCase();
    if (!findingsBySeverity[key]) findingsBySeverity[key] = [];
    findingsBySeverity[key].push(f);
  }

  const severityBars: ChartBar[] = severityKeys
    .map((key) => ({
      id: key,
      label: key,
      value: findingsBySeverity[key]?.length ?? 0,
      detail: `${findingsBySeverity[key]?.length ?? 0} ${key} findings`,
    }))
    .filter((b) => b.value > 0);

  const storyByStatus: Record<'strong' | 'weak' | 'missing', StoryFlowStep[]> = {
    strong: view.storyFlow.filter((s) => s.status === 'strong'),
    weak: view.storyFlow.filter((s) => s.status === 'weak'),
    missing: view.storyFlow.filter((s) => s.status === 'missing'),
  };

  const storyBars: ChartBar[] = (['strong', 'weak', 'missing'] as const).map((status) => ({
    id: status,
    label: status.charAt(0).toUpperCase() + status.slice(1),
    value: storyByStatus[status].length,
    detail: storyByStatus[status].map((s) => s.label).join(', ') || `No ${status} steps`,
  }));

  const pageTypeBars: ChartBar[] = view.presentPages.map((p) => ({
    id: p.kind,
    label: kindLabel(p.kind),
    value: Math.max(1, p.paths.length),
    detail: p.paths.slice(0, 3).join(', ') || kindLabel(p.kind),
  }));

  const blockerBars: ChartBar[] =
    view.blockers.length > 0
      ? view.blockers.slice(0, 8).map((b, i) => ({
          id: `blocker-${i}`,
          label: b.length > 28 ? `${b.slice(0, 28)}…` : b,
          value: 1,
          detail: b,
        }))
      : [{ id: 'none', label: 'None flagged', value: 0, detail: 'No conversion blockers flagged.' }];

  const healthCharts: Record<HealthTileId, ChartBar[]> = {
    confidence: storyBars,
    clarity: storyBars,
    answerability: storyBars,
    pages: pageTypeBars.length
      ? pageTypeBars
      : [{ id: 'none', label: 'No inventory', value: 0, detail: 'No page types detected yet.' }],
    blockers: blockerBars,
    findings: severityBars.length
      ? severityBars
      : [{ id: 'none', label: 'No findings', value: 0, detail: 'No findings in this run.' }],
  };

  const structureRows: ListRow[] = view.presentPages.slice(0, 8).map((p) => ({
    id: p.kind,
    label: kindLabel(p.kind),
    value: String(p.paths.length || 1),
    detail: p.paths.slice(0, 4).join(', ') || undefined,
  }));

  const findingRows: ListRow[] = view.priorityFindings.slice(0, 8).map((f) => ({
    id: f.id,
    label: f.title,
    value: f.severity,
    detail: f.summary,
    severity: f.severity,
  }));

  const trafficBuilt = traffic ? buildTrafficBlock(traffic) : null;

  return {
    projectId,
    hasLiveTraffic: trafficBuilt?.hasLiveTraffic ?? false,
    googleConnected: Boolean(traffic?.googleConnected),
    health: {
      tiles: healthTiles,
      charts: healthCharts,
      structureRows,
      findingRows,
      storyByStatus,
      findingsBySeverity,
      blockers: view.blockers,
    },
    traffic: trafficBuilt?.traffic ?? null,
  };
}

export function defaultHealthTile(tiles: DashboardTile[]): HealthTileId {
  const ids = new Set(tiles.map((t) => t.id));
  if (ids.has('findings')) return 'findings';
  return (tiles[0]?.id as HealthTileId) ?? 'findings';
}

export function sortFindingsBySeverity(findings: Finding[]) {
  return [...findings].sort(
    (a, b) => severityOrder(a.severity) - severityOrder(b.severity)
  );
}
