export type MetricId =
  | 'visitors'
  | 'visits'
  | 'views'
  | 'bounce'
  | 'session'
  | 'revenue';

export type ChartPoint = {
  date: string;
  label: string;
  value: number;
};

export type PinPayload = {
  date: string;
  valueLabel: string;
  valueDisplay: string;
  referrer?: { name: string; count: number; share: string; imgSrc: string };
  notes: string[];
};

export type MetricDef = {
  id: MetricId;
  label: string;
  change: string;
  changePositive: boolean;
  value: string;
  chartTitle: string;
  unit: 'count' | 'percent' | 'currency' | 'duration';
};

export const METRICS: MetricDef[] = [
  {
    id: 'visitors',
    label: 'Visitors',
    change: '+18.4%',
    changePositive: true,
    value: '32.6K',
    chartTitle: 'Visitors over time',
    unit: 'count',
  },
  {
    id: 'visits',
    label: 'Visits',
    change: '+15.2%',
    changePositive: true,
    value: '33.4K',
    chartTitle: 'Visits over time',
    unit: 'count',
  },
  {
    id: 'views',
    label: 'Views',
    change: '+22.1%',
    changePositive: true,
    value: '68.8K',
    chartTitle: 'Views over time',
    unit: 'count',
  },
  {
    id: 'bounce',
    label: 'Bounce rate',
    change: '-6.3%',
    changePositive: true,
    value: '29%',
    chartTitle: 'Bounce rate over time',
    unit: 'percent',
  },
  {
    id: 'session',
    label: 'Session time',
    change: '+9.8%',
    changePositive: true,
    value: '1m 56s',
    chartTitle: 'Session time over time',
    unit: 'duration',
  },
  {
    id: 'revenue',
    label: 'Revenue',
    change: '130 paid',
    changePositive: false,
    value: '$54.4K',
    chartTitle: 'Revenue over time',
    unit: 'currency',
  },
];

const DATE_RANGE_LABEL = 'May 2 – Jul 19';

export { DATE_RANGE_LABEL };

function buildSeries(
  seed: number,
  base: number,
  variance: number,
  transform: (n: number) => number = (n) => Math.round(n)
): ChartPoint[] {
  const points: ChartPoint[] = [];
  const start = new Date(Date.UTC(2026, 4, 2));
  const end = new Date(Date.UTC(2026, 6, 19));
  let i = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 2), i++) {
    const wave = Math.sin((i + seed) / 3.2) * variance;
    const noise = ((i * 17 + seed * 13) % 7) - 3;
    const value = transform(base + wave + noise);
    const iso = d.toISOString().slice(0, 10);
    const label =
      i === 0 || i % 8 === 0 || d.getTime() === end.getTime()
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
        : '';
    points.push({ date: iso, label, value: Math.max(0, value) });
  }
  return points;
}

export const SERIES_BY_METRIC: Record<MetricId, ChartPoint[]> = {
  visitors: buildSeries(1, 420, 90),
  visits: buildSeries(2, 440, 95),
  views: buildSeries(3, 880, 160),
  bounce: buildSeries(4, 32, 10, (n) => Math.round(Math.min(70, Math.max(12, n)) * 10) / 10),
  session: buildSeries(5, 116, 28),
  revenue: buildSeries(6, 680, 140),
};

const REFERRER_IMG = '/assets/cloned/images/690416ff916a.png';

export function pinForPoint(metric: MetricId, point: ChartPoint): PinPayload {
  const displayDate = new Date(point.date + 'T12:00:00Z').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  switch (metric) {
    case 'bounce':
      return {
        date: displayDate,
        valueLabel: 'Bounce rate',
        valueDisplay: `${point.value.toFixed(1)}%`,
        referrer: {
          name: 'lexingtonthemes.com',
          count: 312,
          share: 'Accounted for 37% of visitors that day.',
          imgSrc: REFERRER_IMG,
        },
        notes: ['X launch on 28.5.26'],
      };
    case 'revenue':
      return {
        date: displayDate,
        valueLabel: 'Revenue',
        valueDisplay: `$${point.value.toLocaleString()}`,
        referrer: {
          name: 'google.com',
          count: 84,
          share: 'Accounted for 41% of paid conversions.',
          imgSrc: '/assets/cloned/images/4afefff04e61.png',
        },
        notes: ['Pricing page A/B live'],
      };
    case 'session':
      return {
        date: displayDate,
        valueLabel: 'Avg session',
        valueDisplay: `${Math.floor(point.value / 60)}m ${Math.round(point.value % 60)}s`,
        notes: ['Docs traffic spiked'],
      };
    default:
      return {
        date: displayDate,
        valueLabel: METRICS.find((m) => m.id === metric)?.label ?? 'Value',
        valueDisplay: point.value.toLocaleString(),
        referrer: {
          name: 'direct',
          count: Math.round(point.value * 0.18),
          share: 'Largest single source that day.',
          imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        },
        notes: [],
      };
  }
}

export type PageRow = { path: string; value: string };
export type SourceRow = { name: string; value: string; imgSrc: string };

export const PAGES_TABS = ['Top', 'Entered', 'Exited'] as const;
export type PagesTab = (typeof PAGES_TABS)[number];

export const PAGES_BY_TAB: Record<PagesTab, PageRow[]> = {
  Top: [
    { path: '/', value: '9,842' },
    { path: '/pricing', value: '4,118' },
    { path: '/docs/install-astro', value: '2,906' },
    { path: '/docs/overview', value: '2,442' },
    { path: '/demo/site-os', value: '1,885' },
  ],
  Entered: [
    { path: '/', value: '7,210' },
    { path: '/pricing', value: '2,640' },
    { path: '/demo/site-os', value: '1,902' },
    { path: '/docs/overview', value: '1,114' },
    { path: '/blog', value: '886' },
  ],
  Exited: [
    { path: '/pricing', value: '3,404' },
    { path: '/', value: '2,918' },
    { path: '/docs/install-astro', value: '1,552' },
    { path: '/demo/site-os', value: '1,208' },
    { path: '/contact', value: '974' },
  ],
};

export const SOURCES_TABS = ['Referrers', 'Hostnames', 'Channels', 'AI'] as const;
export type SourcesTab = (typeof SOURCES_TABS)[number];

export const SOURCES_BY_TAB: Record<SourcesTab, SourceRow[]> = {
  Referrers: [
    {
      name: 'google.com',
      value: '6,140',
      imgSrc: '/assets/cloned/images/4afefff04e61.png',
    },
    { name: 't.co', value: '2,284', imgSrc: '/assets/cloned/images/7da7fa93e500.png' },
    {
      name: 'github.com',
      value: '1,903',
      imgSrc: '/assets/cloned/images/5a4e0f1b4609.png',
    },
    {
      name: 'producthunt.com',
      value: '1,522',
      imgSrc: '/assets/cloned/images/32d2558b75df.png',
    },
    {
      name: 'direct',
      value: '1,177',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
  ],
  Hostnames: [
    {
      name: 'site-os.com',
      value: '18,420',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'docs.site-os.com',
      value: '4,812',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'app.site-os.com',
      value: '3,104',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
  ],
  Channels: [
    {
      name: 'Organic Search',
      value: '12,640',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'Direct',
      value: '6,210',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'Referral',
      value: '4,088',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'Social',
      value: '2,774',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
  ],
  AI: [
    {
      name: 'ChatGPT',
      value: '842',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'Perplexity',
      value: '516',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'Claude',
      value: '388',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
    {
      name: 'Gemini',
      value: '241',
      imgSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    },
  ],
};

export type HeroDashboardData = {
  metrics: MetricDef[];
  seriesByMetric: Record<MetricId, ChartPoint[]>;
  pagesByTab: Record<PagesTab, PageRow[]>;
  sourcesByTab: Record<SourcesTab, SourceRow[]>;
  dateRangeLabel: string;
  /** When true, hide add-note controls. */
  live?: boolean;
  defaultMetricId?: MetricId;
};

export const DEMO_HERO_DASHBOARD: HeroDashboardData = {
  metrics: METRICS,
  seriesByMetric: SERIES_BY_METRIC,
  pagesByTab: PAGES_BY_TAB,
  sourcesByTab: SOURCES_BY_TAB,
  dateRangeLabel: DATE_RANGE_LABEL,
  live: false,
  defaultMetricId: 'bounce',
};

/** Simple pin payload for live data (no demo notes). */
export function pinForLivePoint(metric: MetricDef, point: ChartPoint): PinPayload {
  const displayDate = point.date.includes('-')
    ? new Date(point.date + (point.date.length === 10 ? 'T12:00:00Z' : '')).toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }
      )
    : point.date;

  let valueDisplay = point.value.toLocaleString();
  if (metric.unit === 'percent') valueDisplay = `${point.value.toFixed(1)}%`;
  if (metric.unit === 'currency') valueDisplay = point.value.toLocaleString();

  return {
    date: displayDate,
    valueLabel: metric.label,
    valueDisplay,
    notes: [],
  };
}

/** Bar width fraction for breakdown rows (visual only). */
export function barWidthForIndex(index: number, total: number): string {
  const pct = Math.max(18, 92 - index * (70 / Math.max(1, total - 1)));
  return `${pct}%`;
}
