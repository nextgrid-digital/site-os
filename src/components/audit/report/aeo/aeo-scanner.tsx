'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import {
  AeoScoreGauge,
  scoreTone,
  TONE_TEXT,
} from '@/components/audit/report/aeo/aeo-score-gauge';
import { CitationProbeCard } from '@/components/audit/report/aeo/citation-probe-card';
import { TopicMapCard } from '@/components/audit/report/aeo/topic-map-card';
import type { TopicMap } from '@/lib/aeo/topic-map';
import { StatusBadge } from '@/components/ui/status-badge';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { AeoScanSummary } from '@/lib/aeo/summarize-scans';
import type { AeoPageScanRow } from '@/lib/db/aeo';
import { EASE_OUT, SPRING_LAYOUT } from '@/lib/ease';
import { cn } from '@/lib/utils';
import { SortIncreasingIcon, SortDecreasingIcon } from '@/components/icons';

export interface AeoPanelData {
  auditRunId: string;
  pages: AeoPageScanRow[];
  analysis: AeoAnalysis | null;
  topicMap?: TopicMap | null;
  summary: AeoScanSummary;
}

const TONE_BAR: Record<ReturnType<typeof scoreTone>, string> = {
  success: 'bg-success-ink',
  warning: 'bg-warning-ink',
  danger: 'bg-danger-ink',
};

const KIND_LABEL = { home: 'Homepage', article: 'Article', page: 'Page' } as const;

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('rounded-xl bg-raised p-5 shadow-sm', className)}>{children}</section>;
}

function SectionTitle({
  title,
  hint,
  order,
  onToggleOrder,
  ascLabel = 'Lowest first',
  descLabel = 'Highest first',
}: {
  title: string;
  hint: string;
  /** Omit for lists with no sortable key: no icon is shown. */
  order?: 'asc' | 'desc';
  /** When set, the sort indicator becomes a button that flips the order. */
  onToggleOrder?: () => void;
  ascLabel?: string;
  descLabel?: string;
}) {
  const Icon = order === 'asc' ? SortIncreasingIcon : SortDecreasingIcon;
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      {order && onToggleOrder ? (
        <button
          type="button"
          onClick={onToggleOrder}
          aria-label={`Sorted ${order === 'asc' ? ascLabel : descLabel}. Click to reverse.`}
          className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:bg-tint hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Icon className="size-4" aria-hidden />
          {order === 'asc' ? ascLabel : descLabel}
        </button>
      ) : order ? (
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
    </div>
  );
}

/** A bar that grows from zero to `pct` on mount. */
function GrowBar({ pct, className, delay = 0 }: { pct: number; className: string; delay?: number }) {
  const reduced = useReducedMotion();
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-tint">
      <motion.div
        className={cn('h-full rounded-full', className)}
        initial={{ width: reduced ? `${pct}%` : 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reduced ? 0 : 0.7, ease: EASE_OUT, delay: reduced ? 0 : delay }}
      />
    </div>
  );
}

function Hero({ data }: { data: AeoPanelData }) {
  const { summary, analysis } = data;
  const tone = scoreTone(summary.averageScore);
  const headline =
    tone === 'success'
      ? 'Your pages are well set up to be quoted by AI answers.'
      : tone === 'warning'
        ? 'AI engines can read your site, but few pages are easy to quote.'
        : 'Most of your pages are hard for AI engines to quote.';

  return (
    <Card className="flex flex-col gap-6 sm:flex-row sm:items-center">
      <AeoScoreGauge score={summary.averageScore} label="Score" />
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold tracking-tight text-foreground">{headline}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Based on {summary.pageCount} crawled {summary.pageCount === 1 ? 'page' : 'pages'}. This
          measures how easy each page is for an answer engine to lift an answer from. It is not a
          <strong> ranking</strong> or a <strong>count</strong> of citations.
        </p>
        {analysis ? (
          <div className="mt-4 flex flex-wrap gap-6">
            {[
              { label: 'Business clarity', value: analysis.clarity_score },
              { label: 'Answerability', value: analysis.answerability_score },
            ].map((metric, index) => (
              <div key={metric.label} className="w-40">
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>{metric.label}</span>
                  <span className={cn('font-medium tabular-nums', TONE_TEXT[scoreTone(metric.value)])}>
                    {Math.round(metric.value)}
                  </span>
                </div>
                <GrowBar
                  pct={metric.value}
                  className={TONE_BAR[scoreTone(metric.value)]}
                  delay={0.15 * index}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function CostliestGaps({ summary }: { summary: AeoScanSummary }) {
  const reduced = useReducedMotion();
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  // At most one row per check type, so every failing gap stays visible when sorting.
  const gaps = useMemo(
    () =>
      summary.checks
        .filter((c) => c.failing > 0)
        .toSorted((a, b) => (order === 'desc' ? b.weightLost - a.weightLost : a.weightLost - b.weightLost)),
    [summary.checks, order]
  );
  const max = Math.max(1, ...gaps.map((g) => g.weightLost));

  return (
    <Card>
      <SectionTitle
        order={order}
        onToggleOrder={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
        ascLabel="Least costly first"
        descLabel="Most costly first"
        title="Costliest gaps"
        hint="The checks losing the most score across your site. Fix the top one first."
      />
      {gaps.length === 0 ? (
        <p className="text-sm text-muted-foreground">No gaps found on the pages we scanned.</p>
      ) : (
        <ol className="space-y-4">
          {gaps.map((gap, index) => (
            <motion.li key={gap.id} layout={reduced ? false : 'position'} transition={SPRING_LAYOUT}>
              <div className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{gap.label}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums font-mono tracking-tighter">
                  {gap.failing} of {gap.applicable} pages
                </span>
              </div>
              <GrowBar pct={(gap.weightLost / max) * 100} className="bg-danger-ink" delay={0.08 * index} />
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{gap.fix}</p>
            </motion.li>
          ))}
        </ol>
      )}
    </Card>
  );
}

const BAND_FILL = ['var(--destructive)', 'var(--warning)', 'var(--success)'];

function Distribution({ summary }: { summary: AeoScanSummary }) {
  const reduced = useReducedMotion();
  const data = summary.bands.map((band) => ({ label: band.label, count: band.count }));

  return (
    <Card className="flex flex-col">
      <SectionTitle title="Score spread" hint="Number of pages (up) in each readiness score band (across)." />
      <motion.div
        className="min-h-72 flex-1"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.4, ease: EASE_OUT }}
        role="img"
        aria-label={`Pages per score band: ${data.map((d) => `${d.label}: ${d.count}`).join(', ')}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 4, bottom: 20, left: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--line-strong)" strokeOpacity={0.6} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              label={{
                value: 'Readiness score (%)',
                position: 'insideBottom',
                offset: -14,
                fontSize: 11,
                fill: 'var(--muted-foreground)',
              }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              label={{
                value: 'Pages',
                angle: -90,
                position: 'insideLeft',
                offset: 8,
                fontSize: 11,
                fill: 'var(--muted-foreground)',
                style: { textAnchor: 'middle' },
              }}
            />
            <Tooltip
              cursor={{ fill: 'var(--tint-strong)', opacity: 0.6 }}
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="rounded-lg border border-line-strong bg-raised px-3 py-2 text-xs shadow-md">
                    <span className="font-medium text-foreground">{payload[0].payload.label}</span>
                    <span className="ml-2 text-muted-foreground">
                      {payload[0].value} {payload[0].value === 1 ? 'page' : 'pages'}
                    </span>
                  </div>
                ) : null
              }
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              isAnimationActive={!reduced}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell key={entry.label} fill={BAND_FILL[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </Card>
  );
}

/** What an answer engine would most plausibly lift from the top of this page. */
function QuotePreview({ page }: { page: AeoPageScanRow }) {
  const { directAnswerText: text, directAnswerWords: words } = page.signals;
  const ok = words !== null && words >= 20 && words <= 80;

  return (
    <div className="rounded-lg bg-tint p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        What an AI answer would likely quote from this page
      </p>
      {text ? (
        <blockquote className="rounded-lg rounded-tl-sm bg-raised p-3 text-sm leading-6 text-foreground shadow-sm">
          {text}
          {words !== null && words > 50 ? '…' : ''}
        </blockquote>
      ) : (
        <p className="rounded-lg bg-raised p-3 text-sm text-muted-foreground shadow-sm">
          No opening paragraph found, so an engine has nothing clean to quote.
        </p>
      )}
      {words !== null ? (
        <StatusBadge tone={ok ? 'success' : 'warning'} className="mt-2">
          {words} words · {ok ? 'quotable length' : words < 20 ? 'too short to answer anything' : 'too long to quote'}
        </StatusBadge>
      ) : null}
    </div>
  );
}

function PageRow({ page, animateLayout }: { page: AeoPageScanRow; animateLayout: boolean }) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const tone = scoreTone(page.score);
  const applicable = page.checks.filter((c) => c.applicable);
  const failing = applicable.filter((c) => !c.passed);

  return (
    <motion.li
      layout={animateLayout ? 'position' : false}
      transition={SPRING_LAYOUT}
      className="rounded-lg bg-raised shadow-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className={cn('w-10 shrink-0 text-lg font-semibold font-mono', TONE_TEXT[tone])}>
          {page.score}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{page.path}</span>
          <span className="text-xs text-muted-foreground">
            {KIND_LABEL[page.kind]} · {failing.length === 0 ? 'all checks pass' : `${failing.length} to fix`}
          </span>
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-4 pb-4">
              <QuotePreview page={page} />
              <ul className="space-y-2.5">
                {applicable.map((check) => (
                  <li key={check.id} className="flex gap-3">
                    <span
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                        check.passed ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink'
                      )}
                    >
                      {check.passed ? <Check className="size-3" aria-hidden /> : <X className="size-3" aria-hidden />}
                      <span className="sr-only">{check.passed ? 'Passed' : 'Failed'}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{check.label}</p>
                      <p className="text-xs leading-5 text-muted-foreground">{check.detail}</p>
                      {check.passed ? null : (
                        <p className="mt-1 text-xs leading-5 text-foreground/80">Fix: {check.fix}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

/** Beyond this many rows, reorder instantly: layout animation cost grows with row count. */
const MAX_ANIMATED_ROWS = 25;

function Pages({ pages }: { pages: AeoPageScanRow[] }) {
  const reduced = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Sort the full list first, then truncate, so "highest first" shows the real best pages.
  const sorted = useMemo(
    () => pages.toSorted((a, b) => (order === 'asc' ? a.score - b.score : b.score - a.score)),
    [pages, order]
  );
  const visible = showAll ? sorted : sorted.slice(0, 10);
  const animateLayout = !reduced && visible.length <= MAX_ANIMATED_ROWS;

  return (
    <div>
      <SectionTitle
        title={order === 'asc' ? 'Pages, weakest first' : 'Pages, strongest first'}
        hint="Open a page to see the checks it fails and what an AI answer would lift from it."
        order={order}
        onToggleOrder={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
      />
      <ul className="space-y-2">
        {visible.map((page) => (
          <PageRow key={page.path} page={page} animateLayout={animateLayout} />
        ))}
      </ul>
      {pages.length > 10 ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          {showAll ? 'Show fewer' : `Show all ${pages.length} pages`}
        </button>
      ) : null}
    </div>
  );
}

export function AeoScanner({
  data,
  projectId,
  domain,
}: {
  data: AeoPanelData;
  projectId?: string;
  domain?: string;
}) {
  const rewrites = data.analysis?.suggested_aeo_rewrites ?? [];

  return (
    <div className="space-y-4">
      <Hero data={data} />
      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <CostliestGaps summary={data.summary} />
        <Distribution summary={data.summary} />
      </div>
      {rewrites.length > 0 ? (
        <Card>
          <SectionTitle
            title="Suggested rewrites"
            hint="AI-drafted from your crawled pages and intake. Treat as starting points, not facts."
          />
          <ul className="space-y-3">
            {rewrites.slice(0, 5).map((item, index) => (
              <li key={index} className="text-sm leading-6">
                {item.page_path ? (
                  <span className="mr-2 rounded bg-tint px-1.5 py-0.5 font-mono text-xs">{item.page_path}</span>
                ) : null}
                <span className="font-medium text-foreground">{item.change}</span>
                <span className="block text-xs text-muted-foreground">{item.why}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {projectId ? <TopicMapCard projectId={projectId} initial={data.topicMap ?? null} /> : null}
      {projectId && domain ? (
        <CitationProbeCard projectId={projectId} domain={domain} analysis={data.analysis} />
      ) : null}
      <Pages pages={data.pages} />
    </div>
  );
}
