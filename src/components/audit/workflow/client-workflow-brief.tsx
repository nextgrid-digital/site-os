import type { ReactNode } from "react";
import {
  ArrowRight,
  Compass,
  Eye,
  InfoIcon,
  Lightbulb,
  Lock,
  ListTodo,
  Target,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { CalendarIcon, IssuesListIcon } from "@/components/icons";
import { SiteCardFavicon } from "@/components/audit/site-card-favicon";
import { SoftAuditTabLink } from "@/components/audit/soft-audit-tab-link";
import {
  PageChip,
  PriorityBadge,
} from "@/components/audit/workflow/workflow-badges";
import { CopyFixPrompt } from "@/components/audit/workflow/copy-fix-prompt";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReportPdfButton } from "@/components/workspace/report-pdf-button";
import { displayFactLabel, parseBriefFacts } from '@/lib/reports/brief-facts';
import type { GrowthBrief } from "@/lib/reports/build-growth-brief";
import type {
  MonthlyCompareSection,
  MonthlyLine,
} from "@/lib/workflow/monthly-compare";
import { buildFixPrompt, type WorkItemView } from "@/lib/workflow/work-items";

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
  const facts = parseBriefFacts(happening);
  const aiReading = facts.find((fact) => fact.label === 'AI inference') ?? null;
  const otherFacts = facts.filter((fact) => fact !== aiReading);

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
    (item) => item.priority === "critical" || item.priority === "high",
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="max-w-xl text-sm text-muted-foreground">
          A one-page summary of {domain} you can share as-is. Download it as a
          PDF or walk through it on a call.
        </p>
        <ReportPdfButton
          targetSelector="#client-workflow-brief"
          filename={`${domain}-workflow-brief.pdf`}
          backgroundColor="#ffffff"
        />
      </div>

      <article
        id="client-workflow-brief"
        className="typeset typeset-docs space-y-8 rounded-xl bg-raised p-6 shadow-sm sm:p-8"
      >
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <SiteCardFavicon domain={domain} name={domain} />
            <div className="min-w-0">
              <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                NextGrid · Site-OS brief
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground hover:shimmer shimmer-duration-2000">
                <a
                  href={
                    /^https?:\/\//.test(domain) ? domain : `https://${domain}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline"
                >
                  {domain}
                </a>
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Website action brief
              </p>
            </div>
          </div>
          {brief?.readinessLabel ? (
            <span className="rounded-full bg-tint px-2.5 py-1 text-xs font-medium text-foreground/70">
              {brief.readinessLabel}
            </span>
          ) : null}
        </header>

        {/* The bottom line — what a busy reader needs in ten seconds. */}
        <section className="rounded-xl bg-gradient-to-br from-muted to-raised p-5 ring-1 ring-border sm:p-6">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            The bottom line
          </p>
          {verdict ? (
            <p className="mt-2 text-lg leading-7 font-semibold text-foreground">
              {verdict}
            </p>
          ) : (
            <p className="mt-2 text-base text-muted-foreground">
              Run an audit and the headline finding will appear here.
            </p>
          )}
          {mainIssue && mainIssue !== verdict ? (
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              {mainIssue}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatTile
              icon={<IssuesListIcon />}
              label="Issues to fix"
              value={brief?.priorityStack.length ?? 0}
              hint="Problems the audit flagged"
            />
            <StatTile
              icon={<ListTodo className="size-4" />}
              label="Open tasks"
              value={pending.length}
              hint={
                urgentCount > 0
                  ? `${urgentCount} high-impact · not fixed yet`
                  : "Not fixed yet"
              }
            />
            <MonthTile monthly={monthly} />
          </div>
        </section>

        {/* Start here */}
        {firstFix || firstBrief ? (
          <section className="rounded-xl border border-success-ink/20 bg-success-soft/60 p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success text-success-foreground">
                <Target className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-semibold text-success-ink">
                  Start here
                </p>
                {firstFix ? (
                  <p className="text-sm leading-6 text-success-ink">
                    {firstFix}
                  </p>
                ) : null}
                {firstBrief?.whatToChange ? (
                  <p className="text-sm leading-6 text-success-ink/80">
                    <span className="font-medium">What to change:</span>{" "}
                    {firstBrief.whatToChange}
                  </p>
                ) : null}
                {firstBrief?.expectedEffect ? (
                  <p className="text-sm leading-6 text-success-ink/80">
                    <span className="font-medium">Expected result:</span>{" "}
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
          {facts.length > 0 ? (
            <div className="space-y-4">
              {aiReading ? (
                <div className="rounded-xl bg-tint p-4 ml-[1.5em]">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    How an AI would describe you
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          aria-label="About this reading"
                          className="inline-flex cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <InfoIcon className="size-3 stroke-2" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-64 normal-case tracking-normal text-left leading-5">
                          This is a machine reading of your site, not a fact. If it misses how you describe
                          your business, your pages are not making it clear enough.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </p>
                  <p className="mt-1.5 text-base leading-7 text-foreground">{aiReading.value}</p>
                </div>
              ) : null}
              {otherFacts.length > 0 ? (
                <ul className="space-y-3">
                  {otherFacts.map((fact, index) => (
                    <li
                      key={`${fact.label ?? 'note'}-${index}`}
                      className="grid gap-x-4 gap-y-0.5 text-sm leading-6 sm:grid-cols-[9.5rem_1fr] items-center"
                    >
                      {fact.label ? (
                        <div className="font-semibold text-foreground">{displayFactLabel(fact.label)}</div>
                      ) : null}
                      <div className={`min-w-0 break-words text-foreground/80 ${fact.label ? '' : 'sm:col-span-2'}`}>
                        {fact.value}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
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
                <li
                  key={item.title}
                  className="flex gap-3 rounded-xl bg-tint px-4 py-3.5"
                >
                  <span
                    className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-raised text-foreground/80 shadow-sm"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    {item.summary ? (
                      <p className="mt-1 text-sm leading-6 text-foreground/70">
                        {item.summary}
                      </p>
                    ) : null}
                    {item.whyFirst ? (
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        <span className="font-medium text-foreground/70">
                          Why it matters:
                        </span>{" "}
                        {item.whyFirst}
                      </p>
                    ) : null}
                    {item.page_path || item.estimated_value ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.page_path ? (
                          <PageChip path={item.page_path} />
                        ) : null}
                        {item.estimated_value ? (
                          <StatusBadge tone="success">
                            {item.estimated_value}
                          </StatusBadge>
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
          action={pending.length > 0 ? <LockedCopyAll /> : undefined}
          subtitle="Fixes the audit found that haven't been done yet. Copy a ready-made prompt for each and paste it into your AI assistant."
        >
          {pending.length > 0 ? (
            <>
              <ul className="divide-y divide-border rounded-xl ring-1 ring-border">
                {pending.slice(0, MAX_TASKS).map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-sm font-medium text-foreground">
                        {item.issue}
                      </p>
                      <PriorityBadge priority={item.priority} />
                      <CopyFixPrompt prompt={buildFixPrompt(item, domain)} />
                    </div>
                    {item.nextAction &&
                    item.nextAction.trim() !== item.issue.trim() ? (
                      <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
                        Next step: {item.nextAction}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
              {pending.length > MAX_TASKS ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  + {pending.length - MAX_TASKS} more in the Dashboard.
                </p>
              ) : null}
            </>
          ) : (
            <Empty>
              All caught up — no open tasks. Re-run the audit next month to
              check progress.
            </Empty>
          )}
        </BriefSection>

        <BriefSection
          icon={<Compass className="size-4" aria-hidden />}
          title="Since last month"
          subtitle="Compared to the previous audit."
        >
          {monthly &&
          (monthly.improved.length > 0 || monthly.regressed.length > 0) ? (
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
            <Empty>
              Steady month — nothing major changed since the last audit.
            </Empty>
          ) : (
            <Empty>
              This is the first audit, so there&apos;s nothing to compare yet.
              Next month&apos;s re-run will show what got better and what
              slipped.
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
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-6 text-foreground/80"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-tint text-[11px] font-semibold text-foreground/70">
                    {index + 1}
                  </span>
                  {line}
                </li>
              ))}
            </ol>
          ) : (
            <Empty>Recommendations appear once the audit is complete.</Empty>
          )}
          <p className="mt-5 text-sm text-muted-foreground print:hidden">
            <SoftAuditTabLink
              href={`${workspaceBase}/workflow`}
              suffix="/workflow"
              className="inline-flex items-center gap-1 font-medium text-foreground/90 underline-offset-2 hover:underline"
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
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tint text-foreground/80">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-semibold text-foreground">{title}</div>
          <div className="text-xs leading-5 text-muted-foreground">
            {subtitle}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Placeholder for a future "copy every prompt at once" action. Locked for now. */
function LockedCopyAll() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          aria-disabled="true"
          aria-label="Copy all prompts (locked)"
          onClick={(event) => event.preventDefault()}
          className="inline-flex shrink-0 cursor-not-allowed items-center gap-1.5 rounded-md bg-tint px-2.5 py-1.5 text-xs font-medium text-muted-foreground opacity-70 print:hidden"
        >
          <Lock className="size-3.5" aria-hidden />
          Copy all prompts
        </TooltipTrigger>
        <TooltipContent>Locked for now — coming soon</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl bg-tint px-4 py-3 text-sm leading-6 text-muted-foreground">
      {children}
    </p>
  );
}

/** Plain elements, not dl/dt/dd: the typeset stylesheet indents and recolours definition-list children. */
function StatTile({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-tint p-4 ring-1 ring-border">
      <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        {icon ? (
          <span
            className="flex shrink-0 text-base text-foreground/70"
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        {label}
      </p>
      <div className="mt-2 text-2xl font-bold leading-7 text-foreground font-mono">
        {value}
      </div>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{hint}</p>
    </div>
  );
}

function MonthTile({ monthly }: { monthly: MonthlyCompareSection | null }) {
  if (!monthly) {
    return (
      <StatTile
        icon={<CalendarIcon />}
        label="Since last month"
        value="—"
        hint="First audit — baseline set"
      />
    );
  }
  const wins = monthly.improved.length;
  const slips = monthly.regressed.length;
  return (
    <StatTile
      icon={<CalendarIcon />}
      label="Since last month"
      value={
        <span className="flex items-baseline gap-2">
          <span className="text-success-ink">+{wins}</span>
          <span className="text-base text-line-strong">/</span>
          <span
            className={slips > 0 ? "text-danger-ink" : "text-muted-foreground"}
          >
            −{slips}
          </span>
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
  tone: "good" | "bad";
  items: MonthlyLine[];
}) {
  const styles =
    tone === "good"
      ? { head: "text-success-ink", dot: "bg-success" }
      : { head: "text-danger-ink", dot: "bg-destructive" };
  return (
    <div className="rounded-xl bg-tint p-4">
      <p
        className={`flex items-center gap-1.5 text-sm font-semibold ${styles.head}`}
      >
        {icon}
        {label}
      </p>
      {items.length > 0 ? (
        <ul className="mt-2.5 space-y-2">
          {items.slice(0, 6).map((item) => (
            <li
              key={`${item.title}-${item.detail ?? ""}`}
              className="flex gap-2.5 text-sm"
            >
              <span
                className={`mt-2 size-1.5 shrink-0 rounded-full ${styles.dot}`}
                aria-hidden
              />
              <div className="min-w-0">
                <p className="leading-6 text-foreground/90">{item.title}</p>
                {item.detail ? (
                  <p className="text-muted-foreground">{item.detail}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2.5 text-sm text-muted-foreground">
          {tone === "good" ? "No new wins yet." : "Nothing slipped."}
        </p>
      )}
    </div>
  );
}
