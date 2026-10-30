'use client';

import { useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  Flag,
  ListTodo,
  Minus,
  Shuffle,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { RerunFullAuditButton } from '@/components/audit/rerun-full-audit-button';
import { CopyFixPrompt } from '@/components/audit/workflow/copy-fix-prompt';
import { PageChip, PriorityBadge } from '@/components/audit/workflow/workflow-badges';
import type {
  MonthlyCompareSection,
  MonthlyLine,
  MonthlyMetric,
} from '@/lib/workflow/monthly-compare';

const DAY_MS = 24 * 60 * 60 * 1000;
const CHECK_IN_INTERVAL_DAYS = 30;

// UTC keeps server and client renders identical.
const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : dateFormat.format(date);
}

function daysBetween(fromIso: string | null, toIso: string | null) {
  if (!fromIso || !toIso) return null;
  const diff = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Number.isFinite(diff) ? Math.max(0, Math.round(diff / DAY_MS)) : null;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

type Tone = 'good' | 'bad' | 'neutral' | 'mixed';

const TONE_STYLES: Record<Tone, { pill: string; ring: string; icon: ReactNode }> = {
  good: {
    pill: 'bg-success-soft text-success-ink',
    ring: 'from-success-soft/70',
    icon: <TrendingUp className="size-4" aria-hidden />,
  },
  bad: {
    pill: 'bg-danger-soft text-danger-ink',
    ring: 'from-danger-soft/70',
    icon: <TrendingDown className="size-4" aria-hidden />,
  },
  mixed: {
    pill: 'bg-warning-soft text-warning-ink',
    ring: 'from-warning-soft/70',
    icon: <Shuffle className="size-4" aria-hidden />,
  },
  neutral: {
    pill: 'bg-tint text-foreground/80',
    ring: 'from-muted',
    icon: <Minus className="size-4" aria-hidden />,
  },
};

function buildVerdict(compare: MonthlyCompareSection): {
  tone: Tone;
  label: string;
  headline: string;
} {
  const wins = compare.improved.length;
  const slips = compare.regressed.length;

  if (wins === 0 && slips === 0) {
    return {
      tone: 'neutral',
      label: 'Steady month',
      headline: 'Nothing major moved since the last audit',
    };
  }
  if (slips === 0) {
    return {
      tone: 'good',
      label: 'Good month',
      headline: `${plural(wins, 'thing')} got better — and nothing slipped`,
    };
  }
  if (wins === 0) {
    return {
      tone: 'bad',
      label: 'Needs attention',
      headline: `${plural(slips, 'thing')} slipped since the last audit`,
    };
  }
  return {
    tone: wins > slips ? 'good' : wins < slips ? 'bad' : 'mixed',
    label: wins > slips ? 'Mostly positive' : wins < slips ? 'Needs attention' : 'Mixed month',
    headline: `${plural(wins, 'thing')} got better, ${slips} slipped`,
  };
}

export function MonthlyReviewPanel({
  projectId,
  currentLabel,
  previousLabel,
  currentAt,
  previousAt,
  compare,
  hasPrevious,
}: {
  projectId: string;
  currentLabel: string;
  previousLabel: string | null;
  currentAt: string | null;
  previousAt: string | null;
  compare: MonthlyCompareSection | null;
  hasPrevious: boolean;
}) {
  const currentDate = formatDate(currentAt) ?? currentLabel;
  const previousDate = formatDate(previousAt) ?? previousLabel;
  const nextCheckInAt = currentAt
    ? new Date(new Date(currentAt).getTime() + CHECK_IN_INTERVAL_DAYS * DAY_MS).toISOString()
    : null;
  const [now] = useState(() => Date.now());
  const checkInDue = nextCheckInAt ? now >= new Date(nextCheckInAt).getTime() : false;

  if (!hasPrevious || !compare) {
    return (
      <FirstCheckIn
        projectId={projectId}
        currentDate={currentDate}
        checkInDue={checkInDue}
      />
    );
  }

  const verdict = buildVerdict(compare);
  const tone = TONE_STYLES[verdict.tone];
  const gapDays = daysBetween(previousAt, currentAt);
  const urgentTitles = new Set(compare.needsFollowUp.map((item) => item.title));
  const otherOpen = compare.stillPending.filter((item) => !urgentTitles.has(item.title));
  const wins = compare.improved.filter((item) => !item.metric);
  const slips = compare.regressed.filter((item) => !item.metric);

  return (
    <div className="space-y-4">
      {/* 1. The verdict — answer "how did we do?" in one glance. */}
      <section
        className={`rounded-xl bg-gradient-to-br ${tone.ring} to-raised to-60% p-5 shadow-sm sm:p-6`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone.pill}`}
            >
              {tone.icon}
              {verdict.label}
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {verdict.headline}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
              <span>Last audit {previousDate}</span>
              <ArrowRight className="size-3.5 text-line-strong" aria-hidden />
              <span className="font-medium text-foreground/80">This audit {currentDate}</span>
              {gapDays != null ? (
                <span className="text-muted-foreground">· {plural(gapDays, 'day')} apart</span>
              ) : null}
            </p>
          </div>
          <div className="shrink-0">
            <RerunFullAuditButton projectId={projectId} />
          </div>
        </div>

        {/* 2. The scorecard — two numbers everyone understands. */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <MetricTile
            label="Issues found"
            hint="Problems the audit spotted on the site"
            metric={compare.scorecard.issues}
          />
          <MetricTile
            label="Open tasks"
            hint="Fixes not yet marked done"
            metric={compare.scorecard.openTasks}
          />
        </div>
      </section>

      {/* 3. What changed — wins and slips side by side. */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChangeCard
          tone="good"
          title="What got better"
          subtitle="Wins since the last audit"
          icon={<TrendingUp className="size-4" aria-hidden />}
          items={wins}
          empty="No new wins detected yet. Ship a few fixes below and they'll show up here next month."
        />
        <ChangeCard
          tone="bad"
          title="What slipped"
          subtitle="Things that disappeared or got worse"
          icon={<TrendingDown className="size-4" aria-hidden />}
          items={slips}
          empty="Nothing slipped. Everything that was working is still working."
        />
      </div>

      {compare.changed.length > 0 ? (
        <ChangeCard
          tone="neutral"
          title="Other changes"
          subtitle="Noticed on the site — not clearly better or worse"
          icon={<Shuffle className="size-4" aria-hidden />}
          items={compare.changed}
          empty=""
        />
      ) : null}

      {/* 4. What to do next — turn the comparison into action. */}
      <section className="rounded-xl bg-raised p-5 shadow-sm">
        <SectionHeading
          icon={<Flag className="size-4" aria-hidden />}
          iconClass="bg-primary text-primary-foreground"
          title="Fix these before the next check-in"
          subtitle="High-impact tasks still open — knocking these out moves next month's numbers most."
        />

        {compare.needsFollowUp.length > 0 ? (
          <ol className="mt-4 space-y-2">
            {compare.needsFollowUp.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="flex items-start gap-3 rounded-xl bg-muted px-3.5 py-3"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-raised text-xs font-semibold text-foreground/80 shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-6 text-foreground">{item.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={item.priority} />
                    {item.pagePath ? <PageChip path={item.pagePath} /> : null}
                  </div>
                  {item.detail ? (
                    <p className="mt-1.5 text-sm leading-5 text-muted-foreground">Next step: {item.detail}</p>
                  ) : null}
                </div>
                {item.fixPrompt ? <CopyFixPrompt prompt={item.fixPrompt} /> : null}
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-success-soft px-3.5 py-3 text-sm text-success-ink">
            <CircleCheck className="size-4 shrink-0" aria-hidden />
            No urgent fixes left. Nice work — keep chipping away at the rest.
          </div>
        )}

        {otherOpen.length > 0 ? (
          <details className="group mt-4 rounded-xl border border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-3 text-sm font-medium text-foreground/80 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <ListTodo className="size-4 text-muted-foreground" aria-hidden />
                {plural(otherOpen.length, 'other open task')}
              </span>
              <ChevronDown
                className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <ul className="space-y-3 border-t border-border px-3.5 py-3">
              {otherOpen.map((item, index) => (
                <li key={`${item.title}-${index}`} className="text-sm">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium leading-6 text-foreground/90">{item.title}</p>
                    <PriorityBadge priority={item.priority} />
                    {item.fixPrompt ? <CopyFixPrompt prompt={item.fixPrompt} /> : null}
                  </div>
                  {item.detail ? (
                    <p className="mt-0.5 leading-5 text-muted-foreground">Next step: {item.detail}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
    </div>
  );
}

function FirstCheckIn({
  projectId,
  currentDate,
  checkInDue,
}: {
  projectId: string;
  currentDate: string;
  checkInDue: boolean;
}) {
  const steps: Array<{ title: string; body: string; done: boolean }> = [
    {
      title: 'Baseline audit',
      body: `Done on ${currentDate}. This is the starting line we'll measure against.`,
      done: true,
    },
    {
      title: 'Work through the fixes',
      body: 'Tackle the open tasks from this audit — the high-priority ones first.',
      done: false,
    },
    {
      title: 'Run your next check-in',
      body: "Re-run the audit next month. We'll show exactly what got better, what slipped, and what's left.",
      done: false,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-xl bg-gradient-to-br from-info-soft/70 to-raised to-60% p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-1 text-xs font-medium text-info-ink">
              <Sparkles className="size-4" aria-hidden />
              Baseline set
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {checkInDue
                ? "It's time for your first monthly check-in"
                : 'Your first month-over-month report is on its way'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Each month we re-audit the site and compare it to the last run, so you can see
              progress in plain English instead of digging through reports.
            </p>
          </div>
          <div className="shrink-0">
            <RerunFullAuditButton projectId={projectId} />
          </div>
        </div>

        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={`rounded-xl p-4 ${step.done ? 'bg-success-soft/70' : 'bg-raised ring-1 ring-border'}`}
            >
              <div className="flex items-center gap-2">
                {step.done ? (
                  <CircleCheck className="size-5 text-success-ink" aria-hidden />
                ) : (
                  <span className="flex size-5 items-center justify-center rounded-full bg-tint text-[11px] font-semibold text-foreground/70">
                    {index + 1}
                  </span>
                )}
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-foreground/70">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl bg-raised p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">What you&apos;ll see after the next audit</p>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <PreviewItem
            icon={<TrendingUp className="size-4" aria-hidden />}
            iconClass="bg-success-soft text-success-ink"
            title="What got better"
            body="New content, claims, and fewer issues."
          />
          <PreviewItem
            icon={<TrendingDown className="size-4" aria-hidden />}
            iconClass="bg-danger-soft text-danger-ink"
            title="What slipped"
            body="Anything that disappeared or got worse."
          />
          <PreviewItem
            icon={<Flag className="size-4" aria-hidden />}
            iconClass="bg-tint text-foreground/80"
            title="What to fix next"
            body="The highest-impact tasks still open."
          />
        </div>
      </section>
    </div>
  );
}

function MetricTile({
  label,
  hint,
  metric,
}: {
  label: string;
  hint: string;
  metric: MonthlyMetric;
}) {
  const { previous, current } = metric;
  const diff = previous == null ? null : current - previous;
  // Lower is better for both issues and open tasks.
  const deltaStyle =
    diff == null || diff === 0
      ? 'bg-tint text-foreground/70'
      : diff < 0
        ? 'bg-success-soft text-success-ink'
        : 'bg-danger-soft text-danger-ink';
  const deltaText =
    diff == null
      ? null
      : diff === 0
        ? 'No change'
        : `${Math.abs(diff)} ${diff < 0 ? 'fewer' : 'more'}`;

  return (
    <div className="rounded-xl bg-raised p-4 ring-1 ring-border">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground/80">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        {deltaText ? (
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${deltaStyle}`}
          >
            {diff != null && diff < 0 ? <ArrowDown className="size-3" aria-hidden /> : null}
            {diff != null && diff > 0 ? <ArrowUp className="size-3" aria-hidden /> : null}
            {deltaText}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        {previous != null ? (
          <>
            <span className="text-lg font-medium text-muted-foreground tabular-nums line-through decoration-line-strong">
              {previous}
            </span>
            <ArrowRight className="size-4 self-center text-line-strong" aria-hidden />
          </>
        ) : null}
        <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {current}
        </span>
      </div>
    </div>
  );
}

const CARD_TONES: Record<'good' | 'bad' | 'neutral', { icon: string; bullet: string }> = {
  good: { icon: 'bg-success-soft text-success-ink', bullet: 'bg-success' },
  bad: { icon: 'bg-danger-soft text-danger-ink', bullet: 'bg-destructive' },
  neutral: { icon: 'bg-tint text-foreground/70', bullet: 'bg-muted-foreground/60' },
};

function ChangeCard({
  tone,
  title,
  subtitle,
  icon,
  items,
  empty,
}: {
  tone: 'good' | 'bad' | 'neutral';
  title: string;
  subtitle: string;
  icon: ReactNode;
  items: MonthlyLine[];
  empty: string;
}) {
  const styles = CARD_TONES[tone];
  return (
    <section className="rounded-xl bg-raised p-5 shadow-sm">
      <SectionHeading
        icon={icon}
        iconClass={styles.icon}
        title={title}
        subtitle={subtitle}
        count={items.length}
      />
      {items.length > 0 ? (
        <ul className="mt-4 space-y-2.5">
          {items.map((item) => (
            <li key={`${item.title}-${item.detail ?? ''}`} className="flex gap-2.5 text-sm">
              <span className={`mt-2 size-1.5 shrink-0 rounded-full ${styles.bullet}`} aria-hidden />
              <div className="min-w-0">
                <p className="leading-6 text-foreground/90">{item.title}</p>
                {item.detail ? (
                  <p className="leading-5 text-muted-foreground">{item.detail}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-muted px-3.5 py-3 text-sm leading-6 text-muted-foreground">
          {empty}
        </p>
      )}
    </section>
  );
}

function SectionHeading({
  icon,
  iconClass,
  title,
  subtitle,
  count,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {title}
          {count ? (
            <span className="rounded-full bg-tint px-1.5 py-px text-[11px] font-medium text-foreground/70 tabular-nums">
              {count}
            </span>
          ) : null}
        </h3>
        <p className="text-xs leading-5 text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function PreviewItem({
  icon,
  iconClass,
  title,
  body,
}: {
  icon: ReactNode;
  iconClass: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-muted p-3.5">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        {icon}
      </span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-0.5 leading-5 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
