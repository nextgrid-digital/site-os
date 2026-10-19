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
    pill: 'bg-emerald-50 text-emerald-700',
    ring: 'from-emerald-50/70',
    icon: <TrendingUp className="size-4" aria-hidden />,
  },
  bad: {
    pill: 'bg-rose-50 text-rose-700',
    ring: 'from-rose-50/70',
    icon: <TrendingDown className="size-4" aria-hidden />,
  },
  mixed: {
    pill: 'bg-amber-50 text-amber-700',
    ring: 'from-amber-50/70',
    icon: <Shuffle className="size-4" aria-hidden />,
  },
  neutral: {
    pill: 'bg-zinc-100 text-zinc-700',
    ring: 'from-zinc-50',
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
  const nextCheckInDate = formatDate(nextCheckInAt);
  const [now] = useState(() => Date.now());
  const checkInDue = nextCheckInAt ? now >= new Date(nextCheckInAt).getTime() : false;

  if (!hasPrevious || !compare) {
    return (
      <FirstCheckIn
        projectId={projectId}
        currentDate={currentDate}
        nextCheckInDate={nextCheckInDate}
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
        className={`rounded-[14px] bg-gradient-to-br ${tone.ring} to-white to-60% p-5 shadow-sm sm:p-6`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone.pill}`}
            >
              {tone.icon}
              {verdict.label}
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
              {verdict.headline}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500">
              <CalendarDays className="size-4 text-zinc-500" aria-hidden />
              <span>Last audit {previousDate}</span>
              <ArrowRight className="size-3.5 text-zinc-300" aria-hidden />
              <span className="font-medium text-zinc-700">This audit {currentDate}</span>
              {gapDays != null ? (
                <span className="text-zinc-500">· {plural(gapDays, 'day')} apart</span>
              ) : null}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
            <RerunFullAuditButton projectId={projectId} />
            {nextCheckInDate ? (
              <p className={`text-xs ${checkInDue ? 'font-medium text-amber-700' : 'text-zinc-500'}`}>
                {checkInDue ? 'Next check-in is due' : `Next check-in ~${nextCheckInDate}`}
              </p>
            ) : null}
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
      <section className="rounded-[14px] bg-white p-5 shadow-sm">
        <SectionHeading
          icon={<Flag className="size-4" aria-hidden />}
          iconClass="bg-zinc-950 text-white"
          title="Fix these before the next check-in"
          subtitle="High-impact tasks still open — knocking these out moves next month's numbers most."
        />

        {compare.needsFollowUp.length > 0 ? (
          <ol className="mt-4 space-y-2">
            {compare.needsFollowUp.map((item, index) => (
              <li
                key={`${item.title}-${index}`}
                className="flex items-start gap-3 rounded-xl bg-zinc-50 px-3.5 py-3"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-zinc-700 shadow-sm">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-6 text-zinc-900">{item.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={item.priority} />
                    {item.pagePath ? <PageChip path={item.pagePath} /> : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
            <CircleCheck className="size-4 shrink-0" aria-hidden />
            No urgent fixes left. Nice work — keep chipping away at the rest.
          </div>
        )}

        {otherOpen.length > 0 ? (
          <details className="group mt-4 rounded-xl border border-zinc-100">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3.5 py-3 text-sm font-medium text-zinc-700 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <ListTodo className="size-4 text-zinc-500" aria-hidden />
                {plural(otherOpen.length, 'other open task')}
              </span>
              <ChevronDown
                className="size-4 text-zinc-500 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <ul className="space-y-3 border-t border-zinc-100 px-3.5 py-3">
              {otherOpen.map((item, index) => (
                <li key={`${item.title}-${index}`} className="text-sm">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="font-medium leading-6 text-zinc-800">{item.title}</p>
                    <PriorityBadge priority={item.priority} />
                  </div>
                  {item.detail ? (
                    <p className="mt-0.5 leading-5 text-zinc-500">Next step: {item.detail}</p>
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
  nextCheckInDate,
  checkInDue,
}: {
  projectId: string;
  currentDate: string;
  nextCheckInDate: string | null;
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
      body: nextCheckInDate
        ? `Re-run the audit around ${nextCheckInDate}. We'll show exactly what got better, what slipped, and what's left.`
        : "Re-run the audit next month. We'll show exactly what got better, what slipped, and what's left.",
      done: false,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-[14px] bg-gradient-to-br from-sky-50/70 to-white to-60% p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
              <Sparkles className="size-4" aria-hidden />
              Baseline set
            </span>
            <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
              {checkInDue
                ? "It's time for your first monthly check-in"
                : 'Your first month-over-month report is on its way'}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
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
              className={`rounded-xl p-4 ${step.done ? 'bg-emerald-50/70' : 'bg-white ring-1 ring-zinc-100'}`}
            >
              <div className="flex items-center gap-2">
                {step.done ? (
                  <CircleCheck className="size-5 text-emerald-600" aria-hidden />
                ) : (
                  <span className="flex size-5 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                    {index + 1}
                  </span>
                )}
                <p className="text-sm font-semibold text-zinc-900">{step.title}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-[14px] bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-zinc-950">What you&apos;ll see after the next audit</p>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
          <PreviewItem
            icon={<TrendingUp className="size-4" aria-hidden />}
            iconClass="bg-emerald-50 text-emerald-700"
            title="What got better"
            body="New content, claims, and fewer issues."
          />
          <PreviewItem
            icon={<TrendingDown className="size-4" aria-hidden />}
            iconClass="bg-rose-50 text-rose-700"
            title="What slipped"
            body="Anything that disappeared or got worse."
          />
          <PreviewItem
            icon={<Flag className="size-4" aria-hidden />}
            iconClass="bg-zinc-100 text-zinc-700"
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
      ? 'bg-zinc-100 text-zinc-600'
      : diff < 0
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-rose-50 text-rose-700';
  const deltaText =
    diff == null
      ? null
      : diff === 0
        ? 'No change'
        : `${Math.abs(diff)} ${diff < 0 ? 'fewer' : 'more'}`;

  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-100">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-700">{label}</p>
          <p className="text-xs text-zinc-500">{hint}</p>
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
            <span className="text-lg font-medium text-zinc-500 tabular-nums line-through decoration-zinc-300">
              {previous}
            </span>
            <ArrowRight className="size-4 self-center text-zinc-300" aria-hidden />
          </>
        ) : null}
        <span className="text-3xl font-semibold tracking-tight text-zinc-950 tabular-nums">
          {current}
        </span>
      </div>
    </div>
  );
}

const CARD_TONES: Record<'good' | 'bad' | 'neutral', { icon: string; bullet: string }> = {
  good: { icon: 'bg-emerald-50 text-emerald-700', bullet: 'bg-emerald-500' },
  bad: { icon: 'bg-rose-50 text-rose-700', bullet: 'bg-rose-500' },
  neutral: { icon: 'bg-zinc-100 text-zinc-600', bullet: 'bg-zinc-400' },
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
    <section className="rounded-[14px] bg-white p-5 shadow-sm">
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
                <p className="leading-6 text-zinc-800">{item.title}</p>
                {item.detail ? (
                  <p className="leading-5 text-zinc-500">{item.detail}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-zinc-50 px-3.5 py-3 text-sm leading-6 text-zinc-500">
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
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-950">
          {title}
          {count ? (
            <span className="rounded-full bg-zinc-100 px-1.5 py-px text-[11px] font-medium text-zinc-600 tabular-nums">
              {count}
            </span>
          ) : null}
        </h3>
        <p className="text-xs leading-5 text-zinc-500">{subtitle}</p>
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
    <div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3.5">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
        {icon}
      </span>
      <div>
        <p className="font-medium text-zinc-900">{title}</p>
        <p className="mt-0.5 leading-5 text-zinc-500">{body}</p>
      </div>
    </div>
  );
}
