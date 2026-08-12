'use client';

import { useMemo } from 'react';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { buildTrafficDashboardView } from '@/lib/audit/audit-dashboard-view';
import { AuditInteractiveDashboard } from '@/components/audit/report/audit-interactive-dashboard';

function ConnectionChip({
  label,
  connected,
  detail,
}: {
  label: string;
  connected: boolean;
  detail: string | null;
}) {
  return (
    <div
      className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
 connected
 ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
 : 'border-zinc-200 bg-zinc-50 text-zinc-600'
 }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
 connected ? 'bg-emerald-500' : 'bg-zinc-300'
 }`}
        aria-hidden
      />
      <span className="shrink-0">{label}</span>
      <span className="truncate font-normal text-zinc-500">
        {connected ? detail || 'Connected' : 'Not connected'}
      </span>
    </div>
  );
}

export function ConnectedSourcesView({
  data,
  projectId,
}: {
  data: ConnectedAuditMetrics;
  projectId: string;
}) {
  const hasAnyRows = useMemo(() => {
    const m = data.metrics;
    return (
      data.queryMetrics.length > 0 ||
      data.trafficByChannel.length > 0 ||
      data.pageMetrics.some(
        (p) =>
          p.gsc_clicks > 0 ||
          p.gsc_impressions > 0 ||
          p.ga_sessions > 0 ||
          p.ga_engaged_sessions > 0 ||
          p.ga_conversions > 0
      ) ||
      Boolean(
        m &&
          (m.total_clicks > 0 ||
            m.total_impressions > 0 ||
            m.total_sessions > 0 ||
            m.total_conversions > 0)
      )
    );
  }, [data]);

  const dashboard = useMemo(
    () =>
      buildTrafficDashboardView({
        projectId,
        googleConnected: data.googleConnected,
        trafficByChannel: data.trafficByChannel,
        pageMetrics: data.pageMetrics,
        queryMetrics: data.queryMetrics,
        totals: data.metrics
          ? {
              sessions: data.metrics.total_sessions,
              engagedSessions: data.metrics.total_engaged_sessions,
              conversions: data.metrics.total_conversions,
              clicks: data.metrics.total_clicks,
              impressions: data.metrics.total_impressions,
            }
          : null,
      }),
    [data, projectId]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <ConnectionChip
            label="Search Console"
            connected={data.gscConnected}
            detail={data.gscPropertyLabel}
          />
          <ConnectionChip
            label="GA4"
            connected={data.ga4Connected}
            detail={data.ga4PropertyLabel}
          />
        </div>
        {data.googleConnected && !hasAnyRows ? (
          <p className="max-w-md text-xs text-zinc-500">
            Properties are selected, but this audit stored no Google rows. Reconnect Google on the
            operator Connect page if the token expired, then re-run the full audit.
          </p>
        ) : null}
        {!data.googleConnected ? (
          <p className="text-xs text-zinc-500">
            Connect Search Console and GA4 on this project, then run a full audit.
          </p>
        ) : null}
      </div>

      <AuditInteractiveDashboard data={dashboard} trafficOnly />
    </div>
  );
}
