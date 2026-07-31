'use client';

import { useMemo, useState, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { LockedPanel } from '@/components/audit/dashboard/locked-panel';
import {
  defaultHealthTile,
  type AuditDashboardView,
  type ChartBar,
  type DashboardMode,
  type DashboardTileId,
  type DetailCard,
  type HealthTileId,
  type ListRow,
  type TrafficTileId,
} from '@/lib/audit/audit-dashboard-view';

const BAR_FILL = '#10b981';
const BAR_ACTIVE = '#18181b';

interface AuditInteractiveDashboardProps {
  data: AuditDashboardView;
  /** When true, only show live traffic (Connected tab). */
  trafficOnly?: boolean;
}

export function AuditInteractiveDashboard({
  data,
  trafficOnly = false,
}: AuditInteractiveDashboardProps) {
  const canTraffic = Boolean(data.traffic);
  const hasHealth = data.health.tiles.length > 0;
  const [mode, setMode] = useState<DashboardMode>(
    trafficOnly || !hasHealth ? 'traffic' : 'health'
  );
  const [healthTile, setHealthTile] = useState<HealthTileId>(
    defaultHealthTile(data.health.tiles)
  );
  const [trafficTile, setTrafficTile] = useState<TrafficTileId>('sessions');
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const activeMode: DashboardMode =
    trafficOnly || !hasHealth
      ? canTraffic
        ? 'traffic'
        : 'health'
      : mode === 'traffic' && canTraffic
        ? 'traffic'
        : 'health';

  const tiles =
    activeMode === 'traffic' && data.traffic
      ? data.traffic.tiles
      : data.health.tiles;

  const activeTileId: DashboardTileId =
    activeMode === 'traffic' ? trafficTile : healthTile;

  const chartBars: ChartBar[] = useMemo(() => {
    if (activeMode === 'traffic' && data.traffic) {
      return data.traffic.charts[trafficTile] ?? [];
    }
    return data.health.charts[healthTile] ?? [];
  }, [activeMode, data, healthTile, trafficTile]);

  const leftRows: ListRow[] =
    activeMode === 'traffic' && data.traffic
      ? trafficTile === 'keywords'
        ? data.traffic.queryRows
        : trafficTile === 'channels'
          ? data.traffic.channelRows
          : data.traffic.pageRows
      : data.health.structureRows;

  const rightRows: ListRow[] =
    activeMode === 'traffic' && data.traffic
      ? trafficTile === 'keywords'
        ? data.traffic.pageRows
        : data.traffic.channelRows.length
          ? data.traffic.channelRows
          : data.traffic.queryRows
      : data.health.findingRows;

  const leftTitle =
    activeMode === 'traffic'
      ? trafficTile === 'keywords'
        ? 'Keywords'
        : trafficTile === 'channels'
          ? 'Channels'
          : 'Pages'
      : 'Site structure';

  const rightTitle =
    activeMode === 'traffic'
      ? trafficTile === 'keywords'
        ? 'Top pages'
        : 'Sources'
      : 'Priority findings';

  const detail: DetailCard | null = useMemo(() => {
    if (selectedListId) {
      const row =
        leftRows.find((r) => r.id === selectedListId) ??
        rightRows.find((r) => r.id === selectedListId);
      if (row) {
        return {
          title: row.label,
          body: row.detail || row.value,
          meta: row.severity ? `Severity · ${row.severity}` : row.value,
        };
      }
    }
    if (selectedBarId) {
      const bar = chartBars.find((b) => b.id === selectedBarId);
      if (bar) {
        if (activeMode === 'health' && (healthTile === 'confidence' || healthTile === 'clarity' || healthTile === 'answerability')) {
          const status = bar.id as 'strong' | 'weak' | 'missing';
          const steps = data.health.storyByStatus[status] ?? [];
          return {
            title: `${bar.label} story steps`,
            body:
              steps.length > 0
                ? steps.map((s) => `${s.label}: ${s.detail}`).join('\n')
                : bar.detail || 'No steps in this status.',
            meta: `${bar.value} step${bar.value === 1 ? '' : 's'}`,
          };
        }
        if (activeMode === 'health' && healthTile === 'findings') {
          const list = data.health.findingsBySeverity[bar.id] ?? [];
          return {
            title: `${bar.label} findings`,
            body:
              list.length > 0
                ? list
                    .slice(0, 5)
                    .map((f) => f.title)
                    .join('\n')
                : bar.detail || 'No findings.',
            meta: `${bar.value} finding${bar.value === 1 ? '' : 's'}`,
          };
        }
        if (activeMode === 'health' && healthTile === 'blockers') {
          return {
            title: 'Conversion blocker',
            body: bar.detail || bar.label,
            meta: undefined,
          };
        }
        return {
          title: bar.label,
          body: bar.detail || `${bar.value.toLocaleString()}`,
          meta: bar.value > 0 ? bar.value.toLocaleString() : undefined,
        };
      }
    }
    return null;
  }, [
    selectedListId,
    selectedBarId,
    leftRows,
    rightRows,
    chartBars,
    activeMode,
    healthTile,
    data.health,
  ]);

  function selectTile(id: DashboardTileId) {
    setSelectedBarId(null);
    setSelectedListId(null);
    if (activeMode === 'traffic') {
      setTrafficTile(id as TrafficTileId);
    } else {
      setHealthTile(id as HealthTileId);
    }
  }

  function selectBar(id: string) {
    setSelectedBarId(id);
    setSelectedListId(null);
  }

  function selectList(id: string) {
    setSelectedListId(id);
    setSelectedBarId(null);
  }

  const chartTitle =
    activeMode === 'traffic'
      ? tiles.find((t) => t.id === trafficTile)?.label ?? 'Traffic'
      : healthTile === 'findings'
        ? 'Findings by severity'
        : healthTile === 'pages'
          ? 'Page types present'
          : healthTile === 'blockers'
            ? 'Conversion blockers'
            : 'Story flow health';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-[0.16em] text-zinc-400 uppercase">
          {activeMode === 'traffic' ? 'Live traffic' : 'Audit health'}
        </p>
        {canTraffic && hasHealth && !trafficOnly ? (
          <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs font-medium">
            <ModeButton active={activeMode === 'health'} onClick={() => setMode('health')}>
              Audit health
            </ModeButton>
            <ModeButton active={activeMode === 'traffic'} onClick={() => setMode('traffic')}>
              Live traffic
            </ModeButton>
          </div>
        ) : null}
      </div>

      {activeMode === 'traffic' && data.traffic && !data.hasLiveTraffic ? (
        <LockedPanel
          projectId={data.projectId}
          title={
            data.googleConnected
              ? 'No traffic rows in this run'
              : 'Connect Google to unlock live traffic'
          }
          description={
            data.googleConnected
              ? 'Search Console or GA4 is selected, but this audit run has no page, channel, or query metrics. Reconnect Google if the token expired, then re-run the full audit.'
              : 'Upgrade and connect Search Console + GA4 to populate sessions, channels, and keywords for this site.'
          }
        />
      ) : (
        <>
          <section aria-label="Key metrics">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {tiles.map((tile) => {
                const selected = tile.id === activeTileId;
                return (
                  <button
                    key={tile.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => selectTile(tile.id)}
                    className={
                      selected
                        ? 'flex min-h-[7rem] flex-col rounded-2xl border border-zinc-950 bg-zinc-950 p-4 text-left text-white shadow-sm'
                        : 'flex min-h-[7rem] flex-col rounded-2xl border border-zinc-200 bg-white p-4 text-left text-zinc-950 shadow-sm transition hover:border-zinc-300'
                    }
                  >
                    <span
                      className={`text-[11px] font-medium tracking-[0.12em] uppercase ${
                        selected ? 'text-zinc-400' : 'text-zinc-500'
                      }`}
                    >
                      {tile.label}
                    </span>
                    <span className="mt-auto truncate text-2xl font-semibold tracking-tight">
                      {tile.value}
                    </span>
                    {tile.hint ? (
                      <span
                        className={`mt-1 truncate text-[11px] ${
                          selected ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        {tile.hint}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-4 sm:px-5">
              <p className="text-sm font-semibold text-zinc-950">{chartTitle}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                From this audit run — click a bar for detail
              </p>
            </div>
            <div className="relative px-3 pt-3 pb-4 sm:px-4">
              {chartBars.every((b) => b.value === 0) ? (
                <p className="flex h-56 items-center justify-center text-sm text-zinc-500">
                  No chart data for this metric yet.
                </p>
              ) : (
                <div className="h-64 w-full sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartBars}
                      margin={{ top: 8, right: 8, left: 0, bottom: 28 }}
                      onClick={(state) => {
                        const label = state?.activeLabel;
                        if (typeof label === 'string') {
                          const match = chartBars.find((b) => b.label === label || b.id === label);
                          if (match) selectBar(match.id);
                        }
                        const idx = state?.activeTooltipIndex;
                        if (idx != null) {
                          const i = typeof idx === 'number' ? idx : Number(idx);
                          if (Number.isFinite(i) && chartBars[i]) selectBar(chartBars[i].id);
                        }
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#71717a' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                        height={48}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: '#71717a' }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(24,24,27,0.04)' }}
                        contentStyle={{
                          borderRadius: 8,
                          border: '1px solid #e4e4e7',
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={48} cursor="pointer">
                        {chartBars.map((entry) => (
                          <Cell
                            key={entry.id}
                            fill={entry.id === selectedBarId ? BAR_ACTIVE : BAR_FILL}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {detail ? (
                <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                  <p className="text-[11px] font-medium tracking-[0.14em] text-zinc-400 uppercase">
                    Detail
                  </p>
                  <p className="mt-1 text-sm font-semibold text-zinc-950">{detail.title}</p>
                  {detail.meta ? (
                    <p className="mt-0.5 text-xs text-zinc-500">{detail.meta}</p>
                  ) : null}
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-700">
                    {detail.body}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <BreakdownCard title={leftTitle}>
              <BreakdownList
                rows={leftRows}
                selectedId={selectedListId}
                onSelect={selectList}
                empty="No rows for this audit yet."
              />
            </BreakdownCard>
            <BreakdownCard title={rightTitle}>
              <BreakdownList
                rows={rightRows}
                selectedId={selectedListId}
                onSelect={selectList}
                empty="No rows for this audit yet."
              />
            </BreakdownCard>
          </div>
        </>
      )}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'rounded-md bg-white px-2.5 py-1 text-zinc-950 shadow-sm'
          : 'rounded-md px-2.5 py-1 text-zinc-500 hover:text-zinc-800'
      }
    >
      {children}
    </button>
  );
}

function BreakdownCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-[12rem] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold text-zinc-950">{title}</p>
      </div>
      <div className="px-2 py-2">{children}</div>
    </div>
  );
}

function BreakdownList({
  rows,
  selectedId,
  onSelect,
  empty,
}: {
  rows: ListRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="px-2 py-6 text-center text-sm text-zinc-500">{empty}</p>;
  }
  const max = Math.max(...rows.map((r) => Number(r.value.replace(/,/g, '')) || 1), 1);
  return (
    <ul className="space-y-0.5">
      {rows.map((row) => {
        const numeric = Number(String(row.value).replace(/,/g, ''));
        const width =
          Number.isFinite(numeric) && numeric > 0
            ? `${Math.max(12, Math.round((numeric / max) * 100))}%`
            : '28%';
        const selected = row.id === selectedId;
        return (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => onSelect(row.id)}
              className={`relative w-full overflow-hidden rounded-lg text-left transition ${
                selected ? 'ring-1 ring-zinc-950' : 'hover:bg-zinc-50'
              }`}
            >
              <div
                className="pointer-events-none absolute inset-y-1 left-0 rounded-md bg-zinc-100"
                style={{ width }}
                aria-hidden
              />
              <div className="relative z-10 flex items-center justify-between gap-3 px-2.5 py-2">
                <span className="min-w-0 truncate text-xs text-zinc-800" title={row.label}>
                  {row.label}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums capitalize text-zinc-500">
                  {row.value}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
