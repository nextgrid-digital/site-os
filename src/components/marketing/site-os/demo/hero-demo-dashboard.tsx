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
import Icon3 from '../svgs/svg-icon3';
import Icon4 from '../svgs/svg-icon4';
import Icon5 from '../svgs/svg-icon5';
import Icon6 from '../svgs/svg-icon6';
import {
  DEMO_HERO_DASHBOARD,
  PAGES_TABS,
  SOURCES_TABS,
  barWidthForIndex,
  pinForLivePoint,
  pinForPoint,
  type ChartPoint,
  type HeroDashboardData,
  type MetricId,
  type PagesTab,
  type PinPayload,
  type SourcesTab,
} from './landing-demo-data';

const TILE_IDLE =
  'border-surface bg-surface-3 hover:bg-clr-25 hover:shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--foreground)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px]';
const TILE_ACTIVE =
  'border-clr-0 text-surface-3 bg-foreground shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--surface-3)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px]';

const BAR_FILL = 'oklch(0.565 0.11 164.584)';
const BAR_ACTIVE = 'oklch(0.205 0 0)';

export function HeroDemoDashboard({
  data = DEMO_HERO_DASHBOARD,
}: {
  data?: HeroDashboardData;
}) {
  const metrics = data.metrics;
  const seriesByMetric = data.seriesByMetric;
  const pagesByTab = data.pagesByTab;
  const sourcesByTab = data.sourcesByTab;
  const dateRangeLabel = data.dateRangeLabel;
  const isLive = Boolean(data.live);
  const initialMetric =
    data.defaultMetricId && metrics.some((m) => m.id === data.defaultMetricId)
      ? data.defaultMetricId
      : (metrics[0]?.id ?? 'visitors');

  const [activeMetric, setActiveMetric] = useState<MetricId>(initialMetric);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(
    Math.min(3, (seriesByMetric[initialMetric]?.length ?? 1) - 1)
  );
  const [extraNotes, setExtraNotes] = useState<Record<string, string[]>>({});
  const [pagesTab, setPagesTab] = useState<PagesTab>('Top');
  const [sourcesTab, setSourcesTab] = useState<SourcesTab>(
    isLive ? 'Channels' : 'Referrers'
  );

  const metric = metrics.find((m) => m.id === activeMetric) ?? metrics[0];
  const series = seriesByMetric[activeMetric] ?? [];

  const pinned = useMemo(() => {
    if (!metric || pinnedIndex == null || !series[pinnedIndex]) return null;
    const point = series[pinnedIndex];
    const base = isLive
      ? pinForLivePoint(metric, point)
      : pinForPoint(activeMetric, point);
    const key = `${activeMetric}:${point.date}`;
    const added = isLive ? [] : (extraNotes[key] ?? []);
    return { point, payload: { ...base, notes: [...base.notes, ...added] }, index: pinnedIndex };
  }, [activeMetric, pinnedIndex, series, extraNotes, isLive, metric]);

  function selectMetric(id: MetricId) {
    setActiveMetric(id);
    const next = seriesByMetric[id] ?? [];
    setPinnedIndex(Math.min(3, Math.max(0, next.length - 1)));
  }

  function addNote() {
    if (isLive || !pinned) return;
    const key = `${activeMetric}:${pinned.point.date}`;
    const label = `Note ${((extraNotes[key]?.length ?? 0) + pinned.payload.notes.length) + 1}`;
    setExtraNotes((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), label],
    }));
  }

  function removeNote(note: string) {
    if (isLive || !pinned) return;
    const key = `${activeMetric}:${pinned.point.date}`;
    const base = pinForPoint(activeMetric, pinned.point).notes;
    if (base.includes(note)) return;
    setExtraNotes((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((n) => n !== note),
    }));
  }

  const pinLeftPct =
    pinned && series.length > 1 ? (pinned.index / (series.length - 1)) * 100 : 12;

  if (!metric) return null;

  const pagesTabs = (Object.keys(pagesByTab) as PagesTab[]).filter((t) =>
    PAGES_TABS.includes(t)
  );
  const sourcesTabs = (Object.keys(sourcesByTab) as SourcesTab[]).filter((t) =>
    SOURCES_TABS.includes(t)
  );

  return (
    <div className="block w-full">
      <section className="mt-2 block" aria-label="Key metrics">
        <div className="relative grid grid-cols-6 grid-rows-[166px] items-stretch gap-3 max-md:grid-cols-2 max-md:grid-rows-[77px_77px_77px] md:max-lg:grid-cols-3 md:max-lg:grid-rows-[77px_81px]">
          {metrics.map((m) => {
            const selected = m.id === activeMetric;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectMetric(m.id)}
                className={`relative block h-full w-full min-w-0 cursor-pointer rounded-[14px] border border-solid p-4 text-left ${
                  selected ? TILE_ACTIVE : TILE_IDLE
                }`}
              >
                <div className="flex h-full w-full min-w-0 flex-col gap-1">
                  <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                    <span
                      className={`block overflow-hidden text-xs font-medium leading-[0.9375rem] whitespace-nowrap ${
                        selected ? 'text-color-004' : 'text-muted-foreground'
                      }`}
                    >
                      {m.label}
                    </span>
                    <span
                      className={`relative flex shrink-0 text-xs font-medium leading-[0.9375rem] ${
                        selected
                          ? 'text-color-004'
                          : m.changePositive
                            ? 'text-primary'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {m.change}
                    </span>
                  </div>
                  <div className="mt-auto min-w-0">
                    <span
                      className={`inline font-medium leading-5 tracking-[-0.4px] ${
                        m.id === 'revenue' ? 'text-lg leading-7 tracking-[-0.45px]' : ''
                      }`}
                    >
                      {m.value}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-2 block">
        <div className="mb-4 flex h-auto flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5">
          <div className="grid grid-cols-[1fr_auto] grid-rows-[19.25px_16px] items-start gap-1 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:px-3 max-md:pt-4 max-md:pb-3">
            <div className="block font-medium leading-[1.1875rem]">{metric.chartTitle}</div>
            <div className="block text-xs font-medium leading-4 text-balance text-muted-foreground">
              {dateRangeLabel}
            </div>
            <div className="col-start-2 row-start-1 row-end-[span_2] block self-start">
              <button
                type="button"
                className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-center text-muted-foreground hover:bg-surface-4"
                aria-label="Share chart"
              >
                <Icon3 cid="demo-share" />
              </button>
            </div>
          </div>

          <div className="block h-auto w-full min-w-0 pb-5 max-md:pb-4">
            <div className="relative block w-full px-4 max-md:px-3">
              <div className="relative h-72 w-full text-xs leading-4 max-md:h-64">
                {series.every((b) => b.value === 0) ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No chart data for this metric yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={series}
                      margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                      onClick={(state) => {
                        if (state?.activeTooltipIndex == null) return;
                        const idx =
                          typeof state.activeTooltipIndex === 'number'
                            ? state.activeTooltipIndex
                            : Number(state.activeTooltipIndex);
                        if (Number.isFinite(idx)) setPinnedIndex(idx);
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="oklab(0.922 0 0 / 0.7)"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: 'oklch(0.556 0 0)' }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        minTickGap={28}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'oklch(0.556 0 0)' }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                        tickFormatter={(v) => formatAxis(metric.id, Number(v))}
                      />
                      <Tooltip
                        cursor={{ fill: 'oklab(0.145 0 0 / 0.04)' }}
                        content={<HoverTooltip metricId={activeMetric} />}
                      />
                      <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={10} cursor="pointer">
                        {series.map((entry, index) => (
                          <Cell
                            key={entry.date}
                            fill={index === pinnedIndex ? BAR_ACTIVE : BAR_FILL}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {pinned && !series.every((b) => b.value === 0) ? (
                  <PinnedPopover
                    payload={pinned.payload}
                    leftPct={pinLeftPct}
                    onAddNote={addNote}
                    onRemoveNote={removeNote}
                    allowNotes={!isLive}
                  />
                ) : null}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[0.6875rem] leading-[1.125rem] text-muted-foreground">
                <LegendDot className="bg-color-002" label={metric.label} />
                {!isLive ? <LegendDot className="bg-accent" label="Revenue" /> : null}
                {!isLive ? (
                  <LegendDot className="bg-muted-foreground" label="Notes" square />
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 grid w-full grid-cols-1 items-start gap-4 md:grid-cols-2">
          <BreakdownCard
            title="Pages"
            tabs={
              <div
                className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4"
                role="tablist"
                aria-label="Page breakdown"
              >
                {pagesTabs.map((tab) => (
                  <TabButton key={tab} active={pagesTab === tab} onClick={() => setPagesTab(tab)}>
                    {tab}
                  </TabButton>
                ))}
              </div>
            }
          >
            <ul className="flex list-outside flex-col [list-style-type:none]">
              {(pagesByTab[pagesTab] ?? []).map((row, i, arr) => (
                <li key={`${row.path}-${i}`} className="list-item">
                  <div className="relative block w-full overflow-hidden rounded-lg">
                    <div
                      className="pointer-events-none absolute top-1 left-0 block h-6 rounded-md bg-color-001"
                      style={{ width: barWidthForIndex(i, arr.length) }}
                      aria-hidden
                    />
                    <div className="relative z-10 flex items-center justify-between gap-3 px-2.5 py-2">
                      <span
                        className="min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap"
                        title={row.path}
                      >
                        {row.path}
                      </span>
                      <p className="w-14 shrink-0 text-right text-[0.6875rem] leading-[0.6875rem] text-muted-foreground max-md:w-12">
                        {row.value}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </BreakdownCard>

          <BreakdownCard
            title="Sources"
            tabs={
              <div
                className="flex flex-wrap items-center gap-3 text-xs font-medium leading-4"
                role="tablist"
                aria-label="Traffic sources"
              >
                {sourcesTabs.map((tab) => (
                  <TabButton
                    key={tab}
                    active={sourcesTab === tab}
                    onClick={() => setSourcesTab(tab)}
                  >
                    {tab}
                  </TabButton>
                ))}
              </div>
            }
          >
            <ul className="flex list-outside flex-col [list-style-type:none]">
              {(sourcesByTab[sourcesTab] ?? []).map((row, i, arr) => (
                <li key={`${row.name}-${i}`} className="list-item">
                  <div className="relative block w-full overflow-hidden rounded-lg">
                    <div
                      className="pointer-events-none absolute top-1 left-0 block h-6 rounded-md bg-color-001"
                      style={{ width: barWidthForIndex(i, arr.length) }}
                      aria-hidden
                    />
                    <div className="relative z-10 flex items-center justify-between gap-3 px-2.5 py-2">
                      <span className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="block h-4 w-4 max-w-full shrink-0 overflow-clip rounded-md bg-surface-7 object-contain"
                          alt=""
                          height={16}
                          width={16}
                          src={row.imgSrc}
                          title={row.name}
                        />
                        <span className="min-w-0 flex-1 overflow-hidden text-xs leading-4 whitespace-nowrap">
                          {row.name}
                        </span>
                      </span>
                      <span className="w-14 shrink-0 text-right text-[0.6875rem] leading-[0.6875rem] text-muted-foreground max-md:w-12">
                        {row.value}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </BreakdownCard>
        </div>
      </div>
    </div>
  );
}

function formatAxis(metric: MetricId, value: number) {
  if (metric === 'bounce') return `${Math.round(value)}`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return String(Math.round(value));
}

function formatHover(metric: MetricId, value: number) {
  switch (metric) {
    case 'bounce':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}

function HoverTooltip({
  active,
  payload,
  metricId,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  metricId: MetricId;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  const date =
    point.date.includes('-') && point.date.length >= 10
      ? new Date(point.date.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : point.label || point.date;
  return (
    <div className="rounded-[10px] border border-solid border-surface bg-surface-3 px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-medium">{date}</p>
      <p className="text-muted-foreground">{formatHover(metricId, point.value)}</p>
    </div>
  );
}

function PinnedPopover({
  payload,
  leftPct,
  onAddNote,
  onRemoveNote,
  allowNotes,
}: {
  payload: PinPayload;
  leftPct: number;
  onAddNote: () => void;
  onRemoveNote: (note: string) => void;
  allowNotes: boolean;
}) {
  const clamped = Math.min(78, Math.max(4, leftPct - 8));
  return (
    <div
      className="pointer-events-auto absolute top-8 z-20 w-60 max-w-xs"
      style={{ left: `${clamped}%` }}
    >
      <div className="grid min-w-60 grid-cols-1 gap-1.5 rounded-[10px] border border-solid border-surface-8 bg-foreground px-2.5 pt-1.5 pb-2 text-xs leading-4 text-surface-3 shadow-[var(--clr-1)_0px_12px_36px_0px,var(--clr-2)_0px_18px_24px_-8px,var(--clr-3)_0px_0px_2px_0px,var(--clr-3)_0px_2px_4px_0px]">
        <div className="block text-[0.625rem] font-medium leading-[0.8125rem] tracking-[0.25px] text-color-004 uppercase">
          Pinned
        </div>
        <div className="block font-medium">{payload.date}</div>
        <div className="flex w-full flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center justify-between gap-4 leading-3">
            <span className="block text-color-004">{payload.valueLabel}</span>
            <span className="block font-medium [font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace]">
              {payload.valueDisplay}
            </span>
          </div>
        </div>

        {payload.referrer ? (
          <div className="grid grid-cols-1 grid-rows-[13.3281px_16px_15.125px] gap-1.5 border-t border-solid border-t-clr-4 pt-1.5">
            <div className="block text-[0.625rem] font-medium leading-[0.8125rem] tracking-[0.25px] text-color-004 uppercase">
              Top referrer
            </div>
            <div className="flex h-4 items-center justify-between gap-3 leading-3">
              <span className="flex h-4 min-w-0 items-center gap-1.5 text-color-006">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="block h-4 w-4 max-w-full shrink-0 overflow-clip rounded-md bg-surface-7 object-contain"
                  alt=""
                  height={16}
                  width={16}
                  src={payload.referrer.imgSrc}
                  title={payload.referrer.name}
                />
                <span className="block overflow-hidden whitespace-nowrap">{payload.referrer.name}</span>
              </span>
              <span className="block shrink-0 font-medium [font-family:ui-monospace,_SFMono-Regular,_Menlo,_Monaco,_Consolas,_'Liberation_Mono',_'Courier_New',_monospace]">
                {payload.referrer.count}
              </span>
            </div>
            <p className="block text-[0.6875rem] leading-[0.9375rem] whitespace-nowrap text-clr-5">
              {payload.referrer.share}
            </p>
          </div>
        ) : null}

        {allowNotes ? (
          <div className="grid min-w-0 grid-cols-1 gap-1.5 border-t border-solid border-t-clr-4 pt-1.5">
            <ul className="grid min-w-0 list-outside grid-cols-1 gap-1 [list-style-type:none]">
              {payload.notes.map((note) => (
                <li key={note} className="flex min-w-0 items-center gap-1.5 text-color-006">
                  <span className="block h-2 w-2 shrink-0 rounded-xs bg-clr-6" aria-hidden />
                  <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">{note}</span>
                  <button
                    type="button"
                    className="cursor-pointer rounded-sm p-0.5 text-center text-color-009 opacity-50 hover:bg-surface-8 hover:text-surface-3 hover:opacity-100"
                    aria-label={`Delete note "${note}"`}
                    onClick={() => onRemoveNote(note)}
                  >
                    <Icon5 cid="demo-del" />
                  </button>
                  <button
                    type="button"
                    className="cursor-default rounded-sm p-0.5 text-center text-color-009 opacity-50"
                    aria-label={`Edit note "${note}"`}
                    disabled
                  >
                    <Icon4 cid="demo-edit" />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onAddNote}
              className="w-full cursor-pointer rounded-sm bg-surface-8 px-2 py-1.5 text-center font-medium hover:bg-clr-4"
            >
              Add a note
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LegendDot({
  className,
  label,
  square,
}: {
  className: string;
  label: string;
  square?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block h-1.5 w-1.5 ${square ? 'rounded-sm' : 'rounded-full'} ${className}`}
        aria-hidden
      />
      {label}
    </span>
  );
}

function TabButton({
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
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? 'block cursor-pointer rounded-sm text-center'
          : 'block cursor-pointer rounded-sm text-center text-muted-foreground hover:text-clr-26'
      }
    >
      {children}
    </button>
  );
}

function BreakdownCard({
  title,
  tabs,
  children,
}: {
  title: string;
  tabs: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
        <div className="block min-w-0 font-medium leading-[1.1875rem]">{title}</div>
        <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-3 max-md:justify-start max-md:gap-2">
          {tabs}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-center text-muted-foreground hover:bg-surface-4"
              aria-label="Open full breakdown"
            >
              <Icon6 cid="demo-expand" />
            </button>
            <button
              type="button"
              className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg text-center text-muted-foreground hover:bg-surface-4"
              aria-label="Share breakdown"
            >
              <Icon3 cid="demo-share2" />
            </button>
          </div>
        </div>
      </div>
      <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">{children}</div>
    </div>
  );
}
