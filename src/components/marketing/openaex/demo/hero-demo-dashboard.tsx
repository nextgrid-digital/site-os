'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  useChartWidth,
  useOffset,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { motion } from 'motion/react';
import { ChatgptIcon, ClaudeIcon, GeminiIcon, PerplexityIcon } from '@/components/icons';
import { SpeedCounter } from '@/components/motion/speed-counter';
import { ShareList } from './breakdown-list';
import CardTitleIcon, { type CardTitleIconKind } from '../components/card-title-icon';
import Icon3 from '../svgs/svg-icon3';
import {
  DEMO_HERO_DASHBOARD,
  PAGES_TABS,
  SOURCES_TABS,
  type ChartPoint,
  type HeroDashboardData,
  type MetricDef,
  type MetricId,
  type PagesTab,
  type SourcesTab,
} from './landing-demo-data';
import {
  METRIC_TILE_ACTIVE,
  METRIC_TILE_GRID,
  METRIC_TILE_IDLE,
} from '@/components/audit/report/metric-tile-styles';

const AI_SOURCE_ICONS: Record<string, typeof ChatgptIcon> = {
  ChatGPT: ChatgptIcon,
  Perplexity: PerplexityIcon,
  Claude: ClaudeIcon,
  Gemini: GeminiIcon,
};

/** Brand icon for known AI sources, otherwise the row's favicon image. */
function SourceMark({ name, imgSrc }: { name: string; imgSrc: string }) {
  const BrandIcon = AI_SOURCE_ICONS[name];
  if (BrandIcon) return <BrandIcon aria-hidden className="block size-4 shrink-0" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="block h-4 w-4 max-w-full shrink-0 overflow-clip rounded-md bg-surface-7 object-contain"
      alt=""
      height={16}
      width={16}
      src={imgSrc}
      title={name}
    />
  );
}


const TILE_IDLE = METRIC_TILE_IDLE;
const TILE_ACTIVE = METRIC_TILE_ACTIVE;

/** Brand green, lifted slightly in dark mode for contrast. */
const AREA_STROKE = 'var(--chart-area, oklch(0.56 0.14 160))';

export function HeroDemoDashboard({
  data = DEMO_HERO_DASHBOARD,
  showBreakdowns = true,
  chartHint,
  variant = 'default',
}: {
  data?: HeroDashboardData;
  /** Live dashboard shows real breakdown tables elsewhere, so it hides the demo Pages/Sources cards. */
  showBreakdowns?: boolean;
  /** Optional help element rendered next to the chart title (e.g. an info tooltip). */
  chartHint?: ReactNode;
  /** 'landing' uses the larger marketing tiles; 'default' matches the in-app dashboard. */
  variant?: 'default' | 'landing';
}) {
  const landing = variant === 'landing';
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
  const [pagesTab, setPagesTab] = useState<PagesTab>('Top');
  const [sourcesTab, setSourcesTab] = useState<SourcesTab>(
    isLive ? 'Channels' : 'Referrers'
  );

  const metric = metrics.find((m) => m.id === activeMetric) ?? metrics[0];
  const series = useMemo(
    () => seriesByMetric[activeMetric] ?? [],
    [seriesByMetric, activeMetric]
  );

  const gradientId = useId();
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const pinnedPoint = pinnedIndex != null ? (series[pinnedIndex] ?? null) : null;
  // Landing series leave most labels empty, so the axis keys on the index instead.
  const chartData = useMemo(() => series.map((p, i) => ({ ...p, idx: i })), [series]);

  function selectMetric(id: MetricId) {
    setActiveMetric(id);
    setPinnedIndex(null);
  }

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
        <div
          className={
            landing
              ? 'grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-3'
              : METRIC_TILE_GRID
          }
        >
          {metrics.map((m) => {
            const selected = m.id === activeMetric;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={selected}
                onClick={() => selectMetric(m.id)}
                className={`relative block h-full w-full min-w-0 cursor-pointer border border-solid text-left ${
                  landing ? 'min-h-30 rounded-[18px] p-[18px]' : 'rounded-[14px] p-4'
                } ${selected ? TILE_ACTIVE : TILE_IDLE}`}
              >
                <div className="flex h-full w-full min-w-0 flex-col gap-1">
                  <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                    <span
                      className={`block overflow-hidden font-medium whitespace-nowrap ${
                        landing ? 'text-[13px] leading-4' : 'text-xs leading-[0.9375rem]'
                      } ${
                        selected ? 'text-color-004' : 'text-muted-foreground'
                      }`}
                    >
                      {m.label}
                    </span>
                    <span
                      className={`relative flex shrink-0 font-medium ${
                        landing ? 'text-[13px] leading-4' : 'text-xs leading-[0.9375rem]'
                      } ${
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
                  <div className="mt-auto min-w-0 font-mono">
                    <span
                      className={
                        landing
                          ? 'inline text-3xl leading-8 font-bold tracking-tight'
                          : `inline font-medium leading-5 tracking-[-0.4px] ${
                              m.id === 'revenue' ? 'text-lg leading-7 tracking-[-0.45px]' : ''
                            }`
                      }
                    >
                      {landing && selected && m.amount !== undefined ? (
                        <MetricValue metric={m} />
                      ) : (
                        m.value
                      )}
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
            <div className="flex items-center gap-2 font-medium leading-[1.1875rem]">{metric.chartTitle}{chartHint}</div>
            <div className="block text-xs font-medium leading-4 text-balance text-muted-foreground">
              {dateRangeLabel}
            </div>
            <div className={`col-start-2 row-start-1 row-end-[span_2] block self-start ${isLive ? 'hidden' : ''}`}>
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
            <div className="relative block w-full px-2 max-md:px-1">
              <p className="mb-2 px-2 text-xs text-muted-foreground">
                {pinnedPoint ? 'Click the pinned day again to unpin' : 'Click a day to pin its value'}
              </p>
              <div className="relative h-80 w-full text-xs leading-4 max-md:h-64 [&_*]:outline-none">
                {series.every((b) => b.value === 0) ? (
                  <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No chart data for this metric yet.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
                      accessibilityLayer={false}
                      style={{ cursor: 'pointer', outline: 'none' }}
                      onClick={(state) => {
                        const idx = Number(state?.activeTooltipIndex);
                        if (!Number.isFinite(idx) || !series[idx]) return;
                        setPinnedIndex((cur) => (cur === idx ? null : idx));
                      }}
                    >
                      <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={AREA_STROKE} stopOpacity={0.32} />
                          <stop offset="100%" stopColor={AREA_STROKE} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 4"
                        vertical={false}
                        stroke="var(--foreground)"
                        strokeOpacity={0.1}
                      />
                      <XAxis
                        dataKey="idx"
                        tickFormatter={(i) => series[Number(i)]?.label ?? ''}
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                        minTickGap={16}
                        tickMargin={10}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                        width={36}
                        tickFormatter={(v) => formatAxis(metric.id, Number(v))}
                      />
                      <Tooltip
                        isAnimationActive={false}
                        allowEscapeViewBox={{ x: false, y: true }}
                        wrapperStyle={{ zIndex: 20, outline: 'none' }}
                        cursor={{
                          stroke: 'var(--foreground)',
                          strokeOpacity: 0.25,
                          strokeDasharray: '3 3',
                        }}
                        content={<HoverTooltip metricId={activeMetric} metricLabel={metric.label} />}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={AREA_STROKE}
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        activeDot={{
                          r: 5,
                          fill: AREA_STROKE,
                          stroke: 'var(--card)',
                          strokeWidth: 2,
                        }}
                        isAnimationActive={false}
                      />
                      {pinnedPoint ? (
                        <>
                          <ReferenceLine
                            x={pinnedIndex ?? undefined}
                            stroke={AREA_STROKE}
                            strokeOpacity={0.6}
                          />
                          <ReferenceDot
                            x={pinnedIndex ?? undefined}
                            y={pinnedPoint.value}
                            r={6}
                            shape={
                              <PinnedMarker
                                date={formatPointDate(pinnedPoint)}
                                metricLabel={metric.label}
                                value={formatHover(activeMetric, pinnedPoint.value)}
                              />
                            }
                          />
                        </>
                      ) : null}
                    </AreaChart>
                  </ResponsiveContainer>
                )}

              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[0.6875rem] leading-[1.125rem] text-muted-foreground">
                <LegendDot className="bg-[var(--chart-area,oklch(0.56_0.14_160))]" label={metric.label} />
              </div>
            </div>
          </div>
        </div>

        {showBreakdowns ? (
        <div className="mb-4 grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          <BreakdownCard
            title="Pages"
            icon="pages"
            tabs={
              <div
                className="flex flex-wrap items-center gap-0.5 text-xs font-medium leading-4"
                role="tablist"
                aria-label="Page breakdown"
              >
                {pagesTabs.map((tab) => (
                  <TabButton key={tab} group="pages" active={pagesTab === tab} onClick={() => setPagesTab(tab)}>
                    {tab}
                  </TabButton>
                ))}
              </div>
            }
          >
            <ShareList
              rows={(pagesByTab[pagesTab] ?? []).map((row) => ({
                label: row.path,
                value: row.value,
              }))}
            />
          </BreakdownCard>

          <BreakdownCard
            title="Sources"
            icon="sources"
            tabs={
              <div
                className="flex flex-wrap items-center gap-0.5 text-xs font-medium leading-4"
                role="tablist"
                aria-label="Traffic sources"
              >
                {sourcesTabs.map((tab) => (
                  <TabButton
                    key={tab}
                    group="sources"
                    active={sourcesTab === tab}
                    onClick={() => setSourcesTab(tab)}
                  >
                    {tab}
                  </TabButton>
                ))}
              </div>
            }
          >
            <ShareList
              rows={(sourcesByTab[sourcesTab] ?? []).map((row) => ({
                label: row.name,
                value: row.value,
                leading: <SourceMark name={row.name} imgSrc={row.imgSrc} />,
              }))}
            />
          </BreakdownCard>
        </div>
        ) : null}
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

/** Time series carry an ISO date; categorical series (queries, pages) fall back to their label. */
function PinnedMarker({
  cx,
  cy,
  date,
  metricLabel,
  value,
}: {
  cx?: number;
  cy?: number;
  date: string;
  metricLabel: string;
  value: string;
}) {
  const chartWidth = useChartWidth() ?? 0;
  const offset = useOffset();
  if (cx == null || cy == null) return null;
  const w = 168;
  const h = 62;
  // Keep the card inside the plot area so it never covers the Y-axis labels.
  const minX = (offset?.left ?? 0) + 8;
  const maxX = chartWidth - (offset?.right ?? 0) - w - 4;
  const x = Math.min(Math.max(cx - w / 2, minX), Math.max(minX, maxX));
  const y = cy - h - 16 >= 0 ? cy - h - 16 : cy + 16;
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r={6} fill={AREA_STROKE} stroke="var(--card)" strokeWidth={2} />
      <foreignObject x={x} y={y} width={w} height={h} overflow="visible">
        <div className="rounded-[10px] border border-solid border-surface bg-surface-3 px-3 py-2 text-xs shadow-lg ">
          <p className="text-[0.625rem] font-medium uppercase tracking-wide text-muted-foreground">
            Pinned
          </p>
          <p className="font-medium text-foreground">{date}</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{metricLabel}</span>
            <span className="font-mono font-semibold text-foreground">{value}</span>
          </div>
        </div>
      </foreignObject>
    </g>
  );
}

function formatPointDate(point: ChartPoint) {
  if (/^\d{4}-\d{2}-\d{2}/.test(point.date)) {
    const d = new Date(point.date.slice(0, 10) + 'T12:00:00Z');
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    }
  }
  return point.label || point.date;
}

function HoverTooltip({
  active,
  payload,
  metricId,
  metricLabel,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartPoint }>;
  metricId: MetricId;
  metricLabel: string;
}) {
  if (!active || !payload?.[0]) return null;
  const point = payload[0].payload;
  const date = formatPointDate(point);
  return (
    <div className="min-w-36 rounded-[10px] border border-solid border-surface bg-surface-3 px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{date}</p>
      <div className="mt-1 flex items-center justify-between gap-4">
        <span className="text-muted-foreground">{metricLabel}</span>
        <span className="font-mono font-semibold text-foreground">
          {formatHover(metricId, point.value)}
        </span>
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
  group,
  children,
}: {
  active: boolean;
  onClick: () => void;
  /** Tabs sharing a group share one sliding highlight. */
  group: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative block cursor-pointer rounded-md px-2 py-1 text-center transition-colors ${
        active ? '' : 'text-muted-foreground hover:text-clr-26'
      }`}
    >
      {active ? (
        <motion.span
          layoutId={`tab-pill-${group}`}
          className="absolute inset-0 rounded-md bg-tint"
          transition={{ type: 'spring', stiffness: 700, damping: 38 }}
        />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}

function BreakdownCard({
  title,
  icon,
  tabs,
  children,
}: {
  title: string;
  icon: CardTitleIconKind;
  tabs: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="group/card flex h-full flex-col rounded-[14px] border border-solid border-surface bg-surface-3 text-sm leading-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] grid-rows-[24px] items-center gap-x-3 gap-y-2 rounded-tl-md rounded-tr-md px-4 pt-5 pb-4 [grid-auto-rows:min-content] max-md:grid-cols-1 max-md:grid-rows-[19.25px_24px] max-md:items-start max-md:gap-x-1 max-md:px-3 max-md:pt-4 max-md:pb-3">
        <div className="flex min-w-0 items-center gap-2 font-medium leading-[1.1875rem]">
          <CardTitleIcon kind={icon} />
          {title}
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-3 max-md:justify-start max-md:gap-2">
          {tabs}
        </div>
      </div>
      <div className="block min-w-0 px-4 pb-4 max-md:px-3 max-md:pb-3">{children}</div>
    </div>
  );
}

const COMPACT: Intl.NumberFormatOptions = { notation: 'compact', maximumFractionDigits: 1 };
const FORMAT_BY_UNIT: Record<MetricDef['unit'], Intl.NumberFormatOptions | undefined> = {
  count: COMPACT,
  percent: { style: 'percent' },
  currency: { ...COMPACT, style: 'currency', currency: 'USD' },
  duration: undefined,
};
const MINUTES: Intl.NumberFormatOptions = { style: 'unit', unit: 'minute', unitDisplay: 'narrow' };
const SECONDS: Intl.NumberFormatOptions = { style: 'unit', unit: 'second', unitDisplay: 'narrow' };

/** Only the selected tile mounts a counter, so a click races its digits and idle tiles stay plain text. */
function MetricValue({ metric }: { metric: MetricDef }) {
  const amount = metric.amount ?? 0;
  if (metric.unit === 'duration') {
    return (
      <span className="inline-flex gap-[0.5ch]">
        <SpeedCounter value={Math.floor(amount / 60)} format={MINUTES} locale="en-US" animateOnMount />
        <SpeedCounter value={Math.round(amount % 60)} format={SECONDS} locale="en-US" animateOnMount />
      </span>
    );
  }
  return (
    <SpeedCounter
      value={amount}
      format={FORMAT_BY_UNIT[metric.unit]}
      locale="en-US"
      animateOnMount
      spins={1}
      duration={1.2}
    />
  );
}
