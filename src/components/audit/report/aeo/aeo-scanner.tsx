'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ChevronDown, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { scoreTone, TONE_TEXT } from '@/components/audit/report/aeo/aeo-score-gauge';
import { CitationProbeCard } from '@/components/audit/report/aeo/citation-probe-card';
import {
  AeoSection,
  AeoSectionToggles,
  useHiddenAeoSections,
} from '@/components/audit/report/aeo/aeo-sections';
import { AiReferralsCard, type AiReferralsPayload } from '@/components/audit/report/aeo/ai-referrals-card';
import { TopicMapCard } from '@/components/audit/report/aeo/topic-map-card';
import { CITATION_PROBE_ENABLED } from '@/lib/aeo/citation-probe';
import { TOPIC_MAP_ENABLED, type TopicMap } from '@/lib/aeo/topic-map';
import { FIX_SNIPPETS, fixClipboardText, WHY_IT_HELPS } from '@/lib/aeo/fix-copy';
import { StatusBadge } from '@/components/ui/status-badge';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import type { AeoScanSummary } from '@/lib/aeo/summarize-scans';
import type { AeoPageScanRow } from '@/lib/db/aeo';
import { SCORE_BANDS } from '@/lib/aeo/score-bands';
import { useCopyClipboard } from '@/hooks/use-copy-clipboard';
import { EASE_OUT, SPRING_LAYOUT } from '@/lib/ease';
import { cn } from '@/lib/utils';
import { SortIncreasingIcon, SortDecreasingIcon } from '@/components/icons';
import { AEOScoreDistributionChart, BAND_NAMES } from '@/components/audit/report/aeo/aeo-score-distribution-chart';

export interface AeoPanelData {
  auditRunId: string;
  pages: AeoPageScanRow[];
  analysis: AeoAnalysis | null;
  topicMap?: TopicMap | null;
  ga4Connected?: boolean;
  aiReferrals?: AiReferralsPayload | null;
  summary: AeoScanSummary;
}

type BandId = (typeof SCORE_BANDS)[number]['id'];

const TONE_BAR = Object.fromEntries(SCORE_BANDS.map((band) => [band.id, band.bar])) as Record<BandId, string>;

const KIND_LABEL = { home: 'Homepage', article: 'Article', page: 'Page' } as const;

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn('rounded-2xl bg-raised p-6 shadow-sm', className)}>{children}</section>;
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground', className)}>
      {children}
    </span>
  );
}

function SectionHeader({
  title,
  hint,
  aside,
}: {
  title: string;
  hint: string;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      {aside}
    </div>
  );
}

function CopyButton({
  text,
  label,
  copiedLabel = 'Copied',
  primary,
  size = 'md',
  className,
}: {
  text: string;
  label: string;
  copiedLabel?: string;
  primary?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { copied, copy } = useCopyClipboard();
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        void copy(text);
      }}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring print:hidden',
        size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
        primary
          ? 'bg-foreground text-background hover:bg-foreground/90'
          : 'text-foreground ring-1 ring-border hover:bg-tint',
        className
      )}
    >
      {copied ? <Check className="size-3.5 text-success-ink" aria-hidden /> : null}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}

/** A bar that grows from zero to `pct` on mount. */
function GrowBar({
  pct,
  className,
  delay = 0,
  thin,
}: {
  pct: number;
  className: string;
  delay?: number;
  thin?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-tint-strong', thin ? 'h-1.5' : 'h-2')}>
      <motion.div
        className={cn('h-full rounded-full', className)}
        initial={{ width: reduced ? `${pct}%` : 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reduced ? 0 : 0.7, ease: EASE_OUT, delay: reduced ? 0 : delay }}
      />
    </div>
  );
}

/* ─── 1. What is AEO? ─────────────────────────────────────────────────────── */

const AEO_STEPS = [
  {
    title: 'Buyers ask AI',
    body: 'People ask ChatGPT, Gemini, Perplexity and Google’s AI answers which tool or service to pick, instead of scrolling results.',
    accent: false,
  },
  {
    title: 'AI quotes clear pages',
    body: 'It lifts answers from pages that state things plainly, label what they are, and look trustworthy. Messy pages get skipped.',
    accent: false,
  },
  {
    title: 'You’re in the answer',
    body: 'When your page is quoted, your name lands in front of buyers before they click anything. That’s how AEO brings in new customers.',
    accent: true,
  },
] as const;

function WhatIsAeo() {
  const [open, setOpen] = useState(true);
  return (
    <Card className="print:hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>What is AEO?</Eyebrow>
          <h2 className="font-display mt-2 text-balance text-2xl leading-tight tracking-tight text-foreground sm:text-[28px]">
            Answer Engine Optimization: making your pages easy for AI to quote.
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="h-7 shrink-0 cursor-pointer rounded-lg px-2.5 text-xs font-medium text-muted-foreground outline-none ring-1 ring-border transition-colors hover:bg-tint hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <ol className="mt-5 grid gap-3 md:grid-cols-3">
              {AEO_STEPS.map((step, index) => (
                <li key={step.title} className="rounded-xl bg-tint p-4">
                  <span
                    className={cn(
                      'text-xs font-bold uppercase tracking-wide',
                      step.accent ? 'text-success-ink' : 'text-muted-foreground'
                    )}
                  >
                    {index + 1} · {step.title}
                  </span>
                  <p className="mt-1.5 text-sm leading-6 text-foreground/85 text-pretty">{step.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-col justify-between gap-1 text-[13px] text-muted-foreground sm:flex-row sm:gap-6">
              <p className="text-pretty">
                This score shows how quotable your pages are. It is not a ranking or a count of citations.
              </p>
              <p className="text-pretty sm:text-right">
                On this page: your score, the fixes that matter most, and a copy-ready fix for each one.
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

/* ─── 2. Score overview ───────────────────────────────────────────────────── */

function ScoreCard({ summary }: { summary: AeoScanSummary }) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-[15px] font-semibold text-foreground">
        Your {summary.pageCount} {summary.pageCount === 1 ? 'page' : 'pages'} by AEO score
      </h2>
      <AEOScoreDistributionChart summary={summary} />
      <ul className="space-y-0.5">
        {summary.bands.map((band, index) => {
          const id = SCORE_BANDS[index].id;
          return (
            <li
              key={id}
              className="grid grid-cols-[12px_1fr_auto] items-center gap-2.5 px-2.5 py-2 text-[13px]"
            >
              <span className="size-2.5 rounded-[3px]" style={{ background: SCORE_BANDS[index].fill }} />
              <span>
                <b className="font-semibold text-foreground">{BAND_NAMES[id]}</b>{' '}
                <span className="text-muted-foreground">{band.label}</span>
              </span>
              <span className="font-bold text-foreground tabular-nums">
                {band.count} <span className="font-normal text-muted-foreground">pages</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Verdict({ data }: { data: AeoPanelData }) {
  const { summary, analysis } = data;
  const tone = scoreTone(summary.averageScore);
  const headline =
    tone === 'high'
      ? 'Your pages are well set up to be quoted by AI answers.'
      : tone === 'good'
        ? 'AI engines can read your site, but few pages are easy to quote.'
        : 'Most of your pages are hard for AI engines to quote.';
  const weak = summary.bands[0].count;
  const topGaps = summary.checks.filter((c) => c.failing > 0).length;
  const body =
    tone === 'high'
      ? `${summary.bands[3].count} of ${summary.pageCount} pages score 80 or higher. Keep the weakest pages in line with them.`
      : `${weak} of ${summary.pageCount} pages score below 40. The pages aren’t built so an AI can lift a clean answer from them. That’s fixable page by page${
          topGaps > 0 ? ', starting with the gaps below.' : '.'
        }`;

  return (
    <Card className="flex flex-col justify-center gap-6 p-8">
      <div>
        <Eyebrow className={TONE_TEXT[tone]}>Verdict</Eyebrow>
        <h2 className="font-display mt-3 max-w-[22ch] text-balance text-[34px] leading-[1.15] tracking-tight text-foreground">
          {headline}
        </h2>
        <p className="mt-3 max-w-[60ch] text-[15px] leading-6 text-muted-foreground text-pretty">{body}</p>
      </div>
      {analysis ? (
        <div className="grid gap-x-7 gap-y-4 sm:grid-cols-2">
          {[
            { label: 'Business clarity', value: analysis.clarity_score, hint: 'Can AI tell what you do and who it’s for?' },
            {
              label: 'Answerability',
              value: analysis.answerability_score,
              hint: 'Does the site answer the questions buyers ask?',
            },
          ].map((metric, index) => {
            const metricTone = scoreTone(metric.value);
            return (
              <div key={metric.label}>
                <div className="mb-1.5 flex justify-between text-[13px]">
                  <span className="font-semibold text-foreground">{metric.label}</span>
                  <span className={cn('font-bold tabular-nums', TONE_TEXT[metricTone])}>
                    {Math.round(metric.value)}
                  </span>
                </div>
                <GrowBar pct={metric.value} className={TONE_BAR[metricTone]} delay={0.15 * index} />
                <p className="mt-1.5 text-xs text-muted-foreground">{metric.hint}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}

/* ─── 3. Fix these first ──────────────────────────────────────────────────── */

function FixRow({
  index,
  gap,
  max,
  open,
  onToggle,
}: {
  index: number;
  gap: AeoScanSummary['checks'][number];
  max: number;
  open: boolean;
  onToggle: () => void;
}) {
  const reduced = useReducedMotion();
  const snippet = FIX_SNIPPETS[gap.id];
  const panelId = `aeo-fix-${gap.id}`;

  return (
    <li className="border-b border-line-strong/60 last:border-b-0">
      <div className="grid grid-cols-[28px_1fr_auto] items-center gap-3.5 px-3 py-3 sm:grid-cols-[28px_1fr_110px_150px_auto]">
        <span
          className={cn(
            'flex size-6 items-center justify-center rounded-full text-xs font-bold',
            index === 0 ? 'bg-foreground text-background' : 'bg-tint-strong text-foreground'
          )}
        >
          {index + 1}
        </span>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          className="-mx-2 flex min-w-0 cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[15px] font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">{gap.label}</span>
          <ChevronDown
            className={cn('size-3.5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        </button>
        <span className="hidden text-right text-[13px] text-foreground/80 tabular-nums sm:block">
          {gap.failing} of {gap.applicable} pages
        </span>
        <div className="hidden sm:block">
          <GrowBar pct={(gap.weightLost / max) * 100} className="bg-danger-ink" delay={0.06 * index} thin />
        </div>
        <CopyButton
          text={fixClipboardText(gap.id, gap.label, gap.fix)}
          label="Copy fix"
          primary={open}
        />
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                'grid gap-6 pb-5 pl-[54px] pr-3',
                snippet ? 'md:grid-cols-[1fr_1fr]' : 'md:grid-cols-1'
              )}
            >
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-success-ink">
                    Why it helps you grow
                  </span>
                  <p className="mt-1 text-sm leading-6 text-foreground/85 text-pretty">{WHY_IT_HELPS[gap.id]}</p>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    What to do
                  </span>
                  <p className="mt-1 text-sm leading-6 text-foreground/85 text-pretty">{gap.fix}</p>
                </div>
              </div>
              {snippet ? (
                <pre className="overflow-x-auto rounded-xl bg-tint p-4 font-mono text-xs leading-[19px] text-foreground/90">
                  {snippet}
                </pre>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function FixTheseFirst({ summary }: { summary: AeoScanSummary }) {
  const gaps = useMemo(() => summary.checks.filter((c) => c.failing > 0), [summary.checks]);
  const [openId, setOpenId] = useState<string | null>(gaps[0]?.id ?? null);
  const max = Math.max(1, ...gaps.map((g) => g.weightLost));

  return (
    <section>
      <SectionHeader
        title="Fix these first"
        hint="The checks costing you the most score across the site. Each fix is copy-ready: one click, paste into your editor or AI assistant."
        aside={<span className="hidden shrink-0 text-xs text-muted-foreground sm:block">Bar = score lost</span>}
      />
      {gaps.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">No gaps found on the pages we scanned.</p>
        </Card>
      ) : (
        <ul className="rounded-2xl bg-raised px-2 py-1.5 shadow-sm">
          {gaps.map((gap, index) => (
            <FixRow
              key={gap.id}
              index={index}
              gap={gap}
              max={max}
              open={openId === gap.id}
              onToggle={() => setOpenId((id) => (id === gap.id ? null : gap.id))}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ─── 4. Suggested rewrites ───────────────────────────────────────────────── */

function Rewrites({ items }: { items: NonNullable<AeoAnalysis['suggested_aeo_rewrites']> }) {
  return (
    <section>
      <SectionHeader
        title="Suggested rewrites"
        hint="AI-drafted from your crawled pages and intake. Treat them as starting points, not facts."
      />
      <ul className="grid gap-3.5 md:grid-cols-3">
        {items.slice(0, 3).map((item, index) => (
          <li key={index} className="flex flex-col items-start gap-3 rounded-2xl bg-raised p-5 shadow-sm">
            {item.page_path ? (
              <span className="rounded-md bg-tint px-2 py-0.5 font-mono text-xs text-foreground">
                {item.page_path}
              </span>
            ) : null}
            <p className="text-[15px] font-medium leading-[22px] text-foreground text-pretty">{item.change}</p>
            <p className="text-[13px] leading-[19px] text-muted-foreground text-pretty">{item.why}</p>
            <CopyButton text={item.change} label="Copy rewrite" copiedLabel="Copied" className="mt-auto" />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ─── 5. Pages ────────────────────────────────────────────────────────────── */

/** What an answer engine would most plausibly lift from the top of this page. */
function QuotePreview({ page }: { page: AeoPageScanRow }) {
  const { directAnswerText: text, directAnswerWords: words } = page.signals;
  const ok = words !== null && words >= 20 && words <= 80;

  return (
    <div className="rounded-xl bg-tint p-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        What an AI answer would likely quote from this page
      </p>
      {text ? (
        <blockquote className="rounded-lg bg-raised p-3 text-sm leading-6 text-foreground shadow-sm">
          {text}
          {words !== null && words > 50 ? '…' : ''}
        </blockquote>
      ) : (
        <p className="rounded-lg bg-raised p-3 text-sm text-muted-foreground shadow-sm">
          No opening paragraph found, so an engine has nothing clean to quote.
        </p>
      )}
      {words !== null ? (
        <StatusBadge tone={ok ? 'success' : 'warning'} className="mt-2.5">
          {words} words · {ok ? 'quotable length' : words < 20 ? 'too short to answer anything' : 'too long to quote'}
        </StatusBadge>
      ) : null}
    </div>
  );
}

function PageRow({
  page,
  animateLayout,
  defaultOpen,
}: {
  page: AeoPageScanRow;
  animateLayout: boolean;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();
  const tone = scoreTone(page.score);
  const applicable = page.checks.filter((c) => c.applicable);
  const failing = applicable.filter((c) => !c.passed);
  const bodyId = `aeo-page-${page.path}`;

  return (
    <motion.li
      layout={animateLayout ? 'position' : false}
      transition={SPRING_LAYOUT}
      className="rounded-2xl bg-raised shadow-sm"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="grid w-full cursor-pointer grid-cols-[52px_1fr_16px] items-center gap-4 rounded-2xl px-5 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          className={cn(
            'flex h-[30px] w-11 items-center justify-center rounded-lg text-[15px] font-bold tabular-nums ring-[1.5px] ring-current',
            TONE_TEXT[tone]
          )}
        >
          {page.score}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold text-foreground">{page.path}</span>
          <span className="text-[13px] text-muted-foreground">
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
            id={bodyId}
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="space-y-4 px-5 pb-5">
              <QuotePreview page={page} />
              {failing.length > 0 ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-muted-foreground">{failing.length} to fix</span>
                  <CopyButton
                    primary
                    label={`Copy all ${failing.length} fixes`}
                    text={failing.map((c) => `- ${c.label}: ${c.fix}`).join('\n')}
                  />
                </div>
              ) : null}
              <ul>
                {applicable.map((check) => (
                  <li
                    key={check.id}
                    className="grid grid-cols-[24px_1fr_auto] items-center gap-3 border-t border-line-strong/60 py-2.5"
                  >
                    <span
                      className={cn(
                        'flex size-6 items-center justify-center rounded-full',
                        check.passed ? 'bg-success-soft text-success-ink' : 'bg-danger-soft text-danger-ink'
                      )}
                    >
                      {check.passed ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
                      <span className="sr-only">{check.passed ? 'Passed' : 'Failed'}</span>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{check.label}</p>
                      <p className="text-[13px] leading-[19px] text-muted-foreground">{check.detail}</p>
                    </div>
                    {check.passed ? null : (
                      <CopyButton
                        size="sm"
                        label="Copy fix"
                        text={fixClipboardText(check.id, check.label, check.fix)}
                      />
                    )}
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
const PAGE_LIMIT = 7;

function Pages({
  pages,
  summary,
  filter,
  onFilter,
}: {
  pages: AeoPageScanRow[];
  summary: AeoScanSummary;
  filter: BandId | 'all';
  onFilter: (band: BandId | 'all') => void;
}) {
  const reduced = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  // Filter, sort the full list, then truncate, so "highest first" shows the real best pages.
  const sorted = useMemo(() => {
    const band = SCORE_BANDS.find((b) => b.id === filter);
    const inBand = band ? pages.filter((p) => p.score >= band.min && p.score <= band.max) : pages;
    return inBand.toSorted((a, b) => (order === 'asc' ? a.score - b.score : b.score - a.score));
  }, [pages, filter, order]);
  const visible = showAll ? sorted : sorted.slice(0, PAGE_LIMIT);
  const animateLayout = !reduced && visible.length <= MAX_ANIMATED_ROWS;
  const Icon = order === 'asc' ? SortIncreasingIcon : SortDecreasingIcon;

  return (
    <section id="aeo-pages">
      <SectionHeader
        title={order === 'asc' ? 'Pages, weakest first' : 'Pages, strongest first'}
        hint="Open a page to see what an AI answer would quote, which checks it fails, and copy the fix."
        aside={
          <button
            type="button"
            onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
            aria-label={`Sorted ${order === 'asc' ? 'lowest' : 'highest'} first. Click to reverse.`}
            className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-foreground outline-none ring-1 ring-border transition-colors hover:bg-tint focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon className="size-4" aria-hidden />
            {order === 'asc' ? 'Lowest first' : 'Highest first'}
          </button>
        }
      />
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter pages by score band">
        {[
          { id: 'all' as const, label: 'All', count: summary.pageCount },
          ...summary.bands.map((band, index) => ({
            id: SCORE_BANDS[index].id as BandId,
            label: BAND_NAMES[SCORE_BANDS[index].id],
            count: band.count,
          })),
        ].map((chip) => {
          const active = filter === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              aria-pressed={active}
              onClick={() => onFilter(chip.id)}
              className={cn(
                'cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'bg-foreground text-background' : 'text-foreground ring-1 ring-border hover:bg-tint'
              )}
            >
              {chip.label} <span className="ml-0.5 opacity-70 tabular-nums">{chip.count}</span>
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">No pages in this band.</p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {visible.map((page, index) => (
            <PageRow key={page.path} page={page} animateLayout={animateLayout} defaultOpen={index === 0 && !showAll && filter === 'all' && order === 'asc'} />
          ))}
        </ul>
      )}
      {sorted.length > PAGE_LIMIT ? (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Showing {visible.length} of {sorted.length} pages.{' '}
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="cursor-pointer font-medium text-foreground underline-offset-4 hover:underline"
          >
            {showAll ? 'Show fewer' : 'Show all pages'}
          </button>
        </p>
      ) : null}
    </section>
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
  const { hidden, toggle } = useHiddenAeoSections();
  const [filter, setFilter] = useState<BandId | 'all'>('all');

  return (
    <div className="space-y-9">
      <WhatIsAeo />
      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <ScoreCard summary={data.summary} />
        <Verdict data={data} />
      </div>
      <FixTheseFirst summary={data.summary} />
      {rewrites.length > 0 ? <Rewrites items={rewrites} /> : null}
      {projectId ? (
        <div>
          <AeoSectionToggles hidden={hidden} onToggle={toggle} />
          {data.ga4Connected !== undefined ? (
            <AeoSection visible={!hidden.has('ai-traffic')}>
              <AiReferralsCard
                projectId={projectId}
                ga4Connected={data.ga4Connected}
                initial={data.aiReferrals ?? null}
              />
            </AeoSection>
          ) : null}
          {TOPIC_MAP_ENABLED ? (
            <AeoSection visible={!hidden.has('topic-map')}>
              <TopicMapCard projectId={projectId} initial={data.topicMap ?? null} />
            </AeoSection>
          ) : null}
          {domain && CITATION_PROBE_ENABLED ? (
            <AeoSection visible={!hidden.has('citation-probe')}>
              <CitationProbeCard projectId={projectId} domain={domain} analysis={data.analysis} />
            </AeoSection>
          ) : null}
        </div>
      ) : null}
      <Pages pages={data.pages} summary={data.summary} filter={filter} onFilter={setFilter} />
    </div>
  );
}
