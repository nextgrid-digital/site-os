import type { ReactNode } from 'react';
import {
  ArrowRight,
  Compass,
  Eye,
  Lightbulb,
  ListTodo,
  Target,
  TrendingDown,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { SoftAuditTabLink } from '@/components/audit/soft-audit-tab-link';
import { PageChip, PriorityBadge } from '@/components/audit/workflow/workflow-badges';
import { ReportPdfButton } from '@/components/workspace/report-pdf-button';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import type { MonthlyCompareSection, MonthlyLine } from '@/lib/workflow/monthly-compare';
import type { WorkItemView } from '@/lib/workflow/work-items';

const MAX_TASKS = 8;

export function ClientWorkflowBrief({
  domain,
  brief,
  pending,
  monthly,
  workspaceBase,
}: {
  domain: string;
  brief: GrowthBrief | null;
  pending: WorkItemView[];
  monthly: MonthlyCompareSection | null;
  workspaceBase: string;
}) {
  const happening = [
    brief?.businessInterpretation,
    ...(brief?.siteOnlySummary?.whatTheSiteSays.slice(0, 2) ?? []),
  ].filter((v): v is string => Boolean(v && v.trim()));

  const broken = brief?.priorityStack.slice(0, 6) ?? [];
  const verdict = brief?.auditVerdict.verdict?.trim() || null;
  const mainIssue = brief?.auditVerdict.mainIssue?.trim() || null;
  const firstFix = brief?.auditVerdict.firstFix?.trim() || null;
  const firstBrief = brief?.executionBriefs?.[0] ?? null;
  const recommends =
    brief?.siteOnlySummary?.recommendedNextSteps.slice(0, 5) ??
    (brief?.offerRecommendation.nextgridAction
      ? [brief.offerRecommendation.nextgridAction]
      : []);
  const urgentCount = pending.filter(
    (item) => item.priority === 'critical' || item.priority === 'high'
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="max-w-xl text-sm text-zinc-500">
          A one-page summary of {domain} you can share as-is. Download it as a PDF or walk through
          it on a call.
        </p>
        <ReportPdfButton
          targetSelector="#client-workflow-brief"
          filename={`${domain}-workflow-brief.pdf`}
          backgroundColor="#ffffff"
        />
      </div>

      <article
        id="client-workflow-brief"
        className="typeset typeset-docs space-y-8 rounded-[14px] bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
              NextGrid · Site-OS brief
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">{domain}</h1>
            <p className="mt-1 text-sm text-zinc-500">Website action brief</p>
          </div>
          {brief?.readinessLabel ? (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
              {brief.readinessLabel}
            </span>
          ) : null}
        </header>

        {/* The bottom line — what a busy reader needs in ten seconds. */}
        <section className="rounded-xl bg-gradient-to-br from-zinc-50 to-white p-5 ring-1 ring-zinc-100 sm:p-6">
          <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            The bottom line
          </p>
          {verdict ? (
            <p className="mt-2 text-lg leading-7 font-semibold text-zinc-950">{verdict}</p>
          ) : (
            <p className="mt-2 text-base text-zinc-500">
              Run an audit and the headline finding will appear here.
            </p>
          )}
          {mainIssue && mainIssue !== verdict ? (
            <p className="mt-2 text-sm leading-6 text-zinc-600">{mainIssue}</p>
          ) : null}

          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatTile
              label="Issues to fix"
              value={brief?.priorityStack.length ?? 0}
              hint="Problems the audit flagged"
            />
            <StatTile
              label="Open tasks"
              value={pending.length}
              hint={urgentCount > 0 ? `${urgentCount} high-impact` : 'None urgent'}
            />
            <MonthTile monthly={monthly} />
          </dl>
        </section>

        {/* Start here */}
        {firstFix || firstBrief ? (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Target className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-semibold text-emerald-900">Start here</p>
                {firstFix ? (
                  <p className="text-sm leading-6 text-emerald-950">{firstFix}</p>
                ) : null}
                {firstBrief?.whatToChange ? (
                  <p className="text-sm leading-6 text-emerald-900/80">
                    <span className="font-medium">What to change:</span> {firstBrief.whatToChange}
                  </p>
                ) : null}
                {firstBrief?.expectedEffect ? (
                  <p className="text-sm leading-6 text-emerald-900/80">
                    <span className="font-medium">Expected result:</span>{' '}
                    {firstBrief.expectedEffect}
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <BriefSection
          icon={<Eye className="size-4" aria-hidden />}
          title="What we're seeing"
          subtitle="How the site comes across today."
        >
          {happening.length > 0 ? (
            <ul className="space-y-2">
              {happening.map((line) => (
                <li key={line} className="flex gap-2.5 text-sm leading-6 text-zinc-700">
                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-zinc-300" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Run an audit to populate this section.</Empty>
          )}
        </BriefSection>

        <BriefSection
          icon={<Wrench className="size-4" aria-hidden />}
          title="What's holding the site back"
          subtitle="Ranked by business impact. The top one matters most."
        >
          {broken.length > 0 ? (
            <ol className="space-y-2.5">
              {broken.map((item, index) => (
                <li key={item.title} className="flex gap-3 rounded-xl bg-zinc-50 px-4 py-3.5">
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      index === 0 ? 'bg-zinc-950 text-white' : 'bg-white text-zinc-700 shadow-sm'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-950">{item.title}</p>
                    {item.summary ? (
                      <p className="mt-1 text-sm leading-6 text-zinc-600">{item.summary}</p>
                    ) : null}
                    {item.whyFirst ? (
                      <p className="mt-1 text-xs leading-5 text-zinc-500">
                        <span className="font-medium text-zinc-600">Why it matters:</span>{' '}
                        {item.whyFirst}
                      </p>
                    ) : null}
                    {item.page_path || item.estimated_value ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.page_path ? <PageChip path={item.page_path} /> : null}
                        {item.estimated_value ? (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                            {item.estimated_value}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <Empty>No prioritized issues in this audit yet.</Empty>
          )}
        </BriefSection>

        <BriefSection
          icon={<ListTodo className="size-4" aria-hidden />}
          title="Open tasks"
          subtitle="Work that's still to do, with the next step for each."
        >
          {pending.length > 0 ? (
            <>
              <ul className="divide-y divide-zinc-100 rounded-xl ring-1 ring-zinc-100">
                {pending.slice(0, MAX_TASKS).map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-medium text-zinc-900">{item.issue}</p>
                      <PriorityBadge priority={item.priority} />
                    </div>
                    {item.nextAction && item.nextAction.trim() !== item.issue.trim() ? (
                      <p className="mt-0.5 text-sm leading-6 text-zinc-500">
                        Next step: {item.nextAction}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {pending.length > MAX_TASKS ? (
                <p className="mt-2 text-xs text-zinc-400">
                  + {pending.length - MAX_TASKS} more in the Dashboard.
                </p>
              ) : null}
            </>
          ) : (
            <Empty>All caught up — no open tasks. Re-run the audit next month to check progress.</Empty>
          )}
        </BriefSection>

        <BriefSection
          icon={<Compass className="size-4" aria-hidden />}
          title="Since last month"
          subtitle="Compared to the previous audit."
        >
          {monthly && (monthly.improved.length > 0 || monthly.regressed.length > 0) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <ChangeList
                label="Got better"
                icon={<TrendingUp className="size-4" aria-hidden />}
                tone="good"
                items={monthly.improved}
              />
              <ChangeList
                label="Slipped"
                icon={<TrendingDown className="size-4" aria-hidden />}
                tone="bad"
                items={monthly.regressed}
              />
            </div>
          ) : monthly ? (
            <Empty>Steady month — nothing major changed since the last audit.</Empty>
          ) : (
            <Empty>
              This is the first audit, so there&apos;s nothing to compare yet. Next month&apos;s
              re-run will show what got better and what slipped.
            </Empty>
          )}
        </BriefSection>

        <BriefSection
          icon={<Lightbulb className="size-4" aria-hidden />}
          title="What we recommend next"
          subtitle="Our suggested next moves."
        >
          {recommends.length > 0 ? (
            <ol className="space-y-2">
              {recommends.map((line, index) => (
                <li key={line} className="flex gap-3 text-sm leading-6 text-zinc-700">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600">
                    {index + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>
          ) : (
            <Empty>Recommendations appear once the audit is complete.</Empty>
          )}
          <p className="mt-5 text-sm text-zinc-500 print:hidden">
            <SoftAuditTabLink
              href={`${workspaceBase}/workflow`}
              suffix="/workflow"
              className="inline-flex items-center gap-1 font-medium text-zinc-800 underline-offset-2 hover:underline"
            >
              See the full data in Dashboard
              <ArrowRight className="size-3.5" aria-hidden />
            </SoftAuditTabLink>
          </p>
        </BriefSection>
      </article>
    </div>
  );
}

function BriefSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
          {icon}
        </span>
        <div>
          <div className="text-base font-semibold text-zinc-950">{title}</div>
          <div className="text-xs leading-5 text-zinc-500">{subtitle}</div>
        </div>
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-500">{children}</p>;
}

function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint: string }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-zinc-100">
      <dt className="text-xs font-medium text-zinc-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 tabular-nums">
        {value}
      </dd>
      <dd className="text-xs text-zinc-400">{hint}</dd>
    </div>
  );
}

function MonthTile({ monthly }: { monthly: MonthlyCompareSection | null }) {
  if (!monthly) {
    return <StatTile label="Since last month" value="—" hint="First audit — baseline set" />;
  }
  const wins = monthly.improved.length;
  const slips = monthly.regressed.length;
  return (
    <StatTile
      label="Since last month"
      value={
        <span className="flex items-baseline gap-2">
          <span className="text-emerald-600">+{wins}</span>
          <span className="text-base text-zinc-300">/</span>
          <span className={slips > 0 ? 'text-rose-600' : 'text-zinc-400'}>−{slips}</span>
        </span>
      }
      hint={`${wins} better · ${slips} slipped`}
    />
  );
}

function ChangeList({
  label,
  icon,
  tone,
  items,
}: {
  label: string;
  icon: ReactNode;
  tone: 'good' | 'bad';
  items: MonthlyLine[];
}) {
  const styles =
    tone === 'good'
      ? { head: 'text-emerald-700', dot: 'bg-emerald-500' }
      : { head: 'text-rose-700', dot: 'bg-rose-500' };
  return (
    <div className="rounded-xl bg-zinc-50 p-4">
      <p className={`flex items-center gap-1.5 text-sm font-semibold ${styles.head}`}>
        {icon}
        {label}
      </p>
      {items.length > 0 ? (
        <ul className="mt-2.5 space-y-2">
          {items.slice(0, 6).map((item) => (
            <li key={`${item.title}-${item.detail ?? ''}`} className="flex gap-2.5 text-sm">
              <span className={`mt-2 size-1.5 shrink-0 rounded-full ${styles.dot}`} aria-hidden />
              <div className="min-w-0">
                <p className="leading-6 text-zinc-800">{item.title}</p>
                {item.detail ? <p className="text-zinc-500">{item.detail}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2.5 text-sm text-zinc-500">
          {tone === 'good' ? 'No new wins yet.' : 'Nothing slipped.'}
        </p>
      )}
    </div>
  );
}
