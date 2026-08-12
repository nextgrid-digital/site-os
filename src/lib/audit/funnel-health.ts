import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';

export type FunnelHealthFlag = {
  id: string;
  severity: 'info' | 'warn';
  message: string;
};

export type FunnelHealthReport = {
  overviewSessions: number;
  channelSessions: number;
  landingSessions: number;
  overviewEngaged: number;
  overviewConversions: number;
  flags: FunnelHealthFlag[];
  note: string;
};

function gapPct(a: number, b: number) {
  const base = Math.max(a, b, 1);
  return (Math.abs(a - b) / base) * 100;
}

/**
 * Compare property overview vs channel rollup vs landing page sums so operators
 * can explain client mismatches without treating approximations as journeys.
 */
export function buildFunnelHealth(
  connected: ConnectedAuditMetrics | null
): FunnelHealthReport | null {
  if (!connected) return null;

  const overviewSessions = connected.ga4Overview?.sessions ?? connected.metrics?.total_sessions ?? 0;
  const overviewEngaged =
    connected.ga4Overview?.engagedSessions ?? connected.metrics?.total_engaged_sessions ?? 0;
  const overviewConversions =
    connected.ga4Overview?.conversions ?? connected.metrics?.total_conversions ?? 0;
  const channelSessions = (connected.trafficByChannel ?? []).reduce(
    (s, c) => s + (c.sessions || 0),
    0
  );
  const landingSessions = (connected.pageMetrics ?? []).reduce(
    (s, p) => s + (p.ga_sessions || 0),
    0
  );

  if (overviewSessions <= 0 && channelSessions <= 0 && landingSessions <= 0) {
    return null;
  }

  const flags: FunnelHealthFlag[] = [];

  if (overviewSessions > 0 && channelSessions > 0 && gapPct(overviewSessions, channelSessions) >= 20) {
    flags.push({
      id: 'overview-vs-channels',
      severity: 'warn',
      message: `Overview sessions (${overviewSessions.toLocaleString()}) and channel sum (${channelSessions.toLocaleString()}) differ by ~${gapPct(overviewSessions, channelSessions).toFixed(0)}%. Channel rows are capped landing×source samples — prefer overview for site totals.`,
    });
  }

  if (overviewSessions > 0 && landingSessions > 0 && gapPct(overviewSessions, landingSessions) >= 25) {
    flags.push({
      id: 'overview-vs-landings',
      severity: 'warn',
      message: `Overview sessions (${overviewSessions.toLocaleString()}) and crawled landing sum (${landingSessions.toLocaleString()}) disagree. Landings only cover crawled entry paths.`,
    });
  }

  if (channelSessions > overviewSessions * 1.05 && overviewSessions > 0) {
    flags.push({
      id: 'channels-exceed-overview',
      severity: 'warn',
      message:
        'Channel sessions exceed property overview — re-run a full audit after the paid/organic channel fix so snapshots refresh.',
    });
  }

  if (flags.length === 0 && overviewSessions > 0) {
    flags.push({
      id: 'totals-aligned',
      severity: 'info',
      message: 'Overview, channels, and landings are roughly aligned for this audit window.',
    });
  }

  return {
    overviewSessions,
    channelSessions,
    landingSessions,
    overviewEngaged,
    overviewConversions,
    flags,
    note: 'Page bars are popular pages by sessions, not a click path. Channel −% is non-conversion rate, not step drop-off.',
  };
}
