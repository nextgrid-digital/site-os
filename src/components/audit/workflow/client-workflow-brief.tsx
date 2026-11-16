import type { ReactNode } from "react";
import {
  ArrowRight,
  CircleAlert,
  Compass,
  Eye,
  InfoIcon,
  Lightbulb,
  Lock,
  ListTodo,
  TrendingDown,
  TrendingUp,
  Wrench,
  MoveRight,
  Cuboid,
} from "lucide-react";
import { CalendarIcon } from "@/components/icons";
import { SiteCardFavicon } from "@/components/audit/site-card-favicon";
import { SoftAuditTabLink } from "@/components/audit/soft-audit-tab-link";
import { StartCopyButton } from "@/components/audit/workflow/start-copy-button";
import { FindingTaskList } from "@/components/audit/workflow/finding-task-list";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReportPdfButton } from "@/components/workspace/report-pdf-button";
import { displayFactLabel, parseBriefFacts } from '@/lib/reports/brief-facts';
import { buildAiBriefReport } from "@/lib/reports/ai-brief-pdf";
import type { GrowthBrief } from "@/lib/reports/build-growth-brief";
import type {
  MonthlyCompareSection,
  MonthlyLine,
} from "@/lib/workflow/monthly-compare";
import { buildFixPrompt, type WorkItemView } from "@/lib/workflow/work-items";

type PriorityItem = GrowthBrief['priorityStack'][number];

/** Which data source surfaced the issue. */
function buildIssuePrompt(item: PriorityItem, domain: string) {
  return [
    `You are helping me fix an issue on my website ${domain}.`,
    item.page_path ? `Page: ${item.page_path}` : null,
    `Issue: ${item.title}`,
    item.summary ? `Details: ${item.summary}` : null,
    item.estimated_value ? `Expected result: ${item.estimated_value}` : null,
    'Make the smallest change that fixes it, show me the exact code or copy to use, and tell me how to check that it worked.',
  ]
    .filter(Boolean)
    .join('\n');
}

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** Turns a run-on instruction into short steps, moving "such as ..." examples into a detail line. */
function splitFixSteps(text: string) {
  const parts = text
    .replace(/(such as [^;]*?)(?=,\s+and\s|$)/gi, (m) => m.replace(/,/g, '\u0000'))
    .split(/,\s+(?:and\s+)?|\.\s+|;\s+/)
    .map((part) => part.replace(/\u0000/g, ',').replace(/\.$/, '').trim())
    .filter(Boolean)
    .slice(0, 4);
  return parts.map((part) => {
    const [title, detail] = part.split(/\s+(?:such as|like)\s+/i);
    return {
      title: capitalize(title.trim()),
      detail: detail ? capitalize(detail.replace(/,\s+or\s+/i, ' or ')) : null,
    };
  });
}

const BUSINESS_TYPES = [
  'studio',
  'agency',
  'consulting',
  'consultancy',
  'platform',
  'software',
  'marketplace',
  'shop',
  'store',
];

/** Flags when the headline and the AI reading name different kinds of business. */
function findBusinessTypeMismatch(headline: string, aiText: string) {
  const find = (text: string) => {
    const lower = text.toLowerCase();
    return BUSINESS_TYPES.find((type) =>
      new RegExp(`\\b${type}\\b`).test(lower),
    );
  };
  const site = find(headline);
  const ai = find(aiText);
  return site && ai && site !== ai ? { site, ai } : null;
}

function TaskList({
  items,
  domain,
}: {
  items: WorkItemView[];
  domain: string;
}) {
  return (
    <FindingTaskList
      rows={items.map((item) => ({ item, fixPrompt: buildFixPrompt(item, domain) }))}
    />
  );
}

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
  const headline =
    otherFacts.find(
      (fact) => fact.label && displayFactLabel(fact.label) === 'Main headline',
    )?.value ?? null;
  const mismatch =
    aiReading && headline ? findBusinessTypeMismatch(headline, aiReading.value) : null;

  const verdict = brief?.auditVerdict.verdict?.trim() || null;
  const mainIssue = brief?.auditVerdict.mainIssue?.trim() || null;
  const firstFix = brief?.auditVerdict.firstFix?.trim() || null;
  const firstBrief = brief?.executionBriefs?.[0] ?? null;
  const topIssue =
    brief?.priorityStack.find((item) => item.title === firstBrief?.title) ??
    brief?.priorityStack[0] ??
    null;
  // First sentence is the heading, the rest is the body.
  const [fixHead, ...fixRest] = (firstBrief?.whatToChange ?? '').split(/(?<=\.)\s+/);
  const fixTitle = fixHead.replace(/\.$/, '').trim() || null;
  const fixBody = fixRest.join(' ').trim() || null;
  const fixSteps = splitFixSteps(fixRest.join(' '));
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
          filename={`${domain}-workflow-brief.pdf`}
          report={buildAiBriefReport({ domain, brief, pending, monthly })}
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
                NextGrid · OpenAEX brief
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
            <p className="mt-2 text-2xl font-semibold text-foreground font-display">
              {verdict}
            </p>
          ) : (
            <p className="mt-2 text-base text-muted-foreground">
              Run an audit and the headline finding will appear here.
            </p>
          )}
          {mainIssue && mainIssue !== verdict ? (
            <p
              title={mainIssue}
              className="mt-2 line-clamp-3 text-sm leading-6 text-foreground/70"
            >
              {mainIssue}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
          <section className="grid gap-6 rounded-2xl bg-tint p-6 ring-1 ring-border sm:p-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="flex min-w-0 flex-col">
              <p className="text-sm font-semibold text-success-ink">
                Start here
              </p>
              <h2 className="mt-3 font-display text-4xl leading-tighter font-normal text-foreground">
                {fixTitle ?? topIssue?.title ?? firstFix}
                {fixTitle ? '.' : ''}
              </h2>
              {(topIssue?.summary ?? fixBody) ? (
                <p className="mt-4 text-base leading-7 text-foreground/70">
                  {topIssue?.summary ?? fixBody}
                </p>
              ) : null}
              <div className="mt-auto flex flex-col gap-3 pt-8">
                <div className="flex flex-wrap items-center gap-3">
                   <a
                  href="#open-tasks"
                  className="inline-flex items-center rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-success-foreground no-underline print:hidden"
                >
                  See the fix steps
                </a>
                {topIssue ? (
                  <StartCopyButton
                    prompt={buildIssuePrompt(topIssue, domain)}
                  />
                ) : null}
                </div>
                {firstBrief?.expectedEffect ? (
                  <p className="min-w-40 flex-1 text-sm leading-5 text-muted-foreground">
                    Result: {firstBrief.expectedEffect}
                  </p>
                ) : null}
              </div>
            </div>
            {fixSteps.length > 0 ? (
              <div className="rounded-2xl bg-raised p-6">
                <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  What the page needs
                </p>
                <ol className="mt-4 divide-y divide-border px-0">
                  {fixSteps.map((step, index) => (
                    <li
                      key={step.title}
                      className="flex gap-2 py-4 first:pt-0 last:pb-0"
                    >
                      <span className="w-4 shrink-0 pt-0.5 text-sm font-semibold text-muted-foreground">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-base leading-6 font-medium text-foreground">
                          {step.title}.
                        </p>
                        {step.detail ? (
                          <p className="text-sm leading-6 text-muted-foreground">
                            {step.detail}.
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </section>
        ) : null}

        <BriefSection
          icon={<Eye className="size-4" aria-hidden />}
          title="What we're seeing"
          subtitle="How the site comes across today, to people and to AI."
        >
          {facts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-[1.15fr_1fr]">
              {aiReading ? (
                <div className="rounded-xl bg-tint p-5">
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
                  <p className="mt-3 font-display text-xl leading-8 text-foreground">
                    &ldquo;{aiReading.value}&rdquo;
                  </p>
                </div>
              ) : null}
              {otherFacts.length > 0 || mismatch ? (
                <div
                  className={`rounded-xl bg-tint p-5 ${aiReading ? '' : 'md:col-span-2'}`}
                >
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    What your site says
                  </p>
                  <ul className="mt-3 space-y-3">
                    {otherFacts.map((fact, index) => (
                      <li
                        key={`${fact.label ?? 'note'}-${index}`}
                        className="text-sm leading-6"
                      >
                        {fact.label ? (
                          <div className="text-muted-foreground">
                            {displayFactLabel(fact.label)}
                          </div>
                        ) : null}
                        <div className="min-w-0 break-words text-foreground">
                          {fact.value}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {mismatch ? (
                    <div className="mt-4 flex gap-2.5 rounded-lg bg-raised p-3.5 text-sm leading-6 text-foreground/80">
                      <CircleAlert
                        className="mt-1.25 size-4 shrink-0 text-warning-ink"
                        aria-hidden
                      />
                      <p>
                        <span className="font-semibold text-foreground">
                          Worth checking:
                        </span>{' '}
                        your headline says &ldquo;{mismatch.site}&rdquo;, the AI
                        says &ldquo;{mismatch.ai}&rdquo;. Is that the first
                        impression you want?
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <Empty>Run an audit to populate this section.</Empty>
          )}
        </BriefSection>

        <BriefSection
          icon={<ListTodo className="size-4" aria-hidden />}
          id="open-tasks"
          title="Open tasks"
          action={pending.length > 0 ? <LockedCopyAll /> : undefined}
          subtitle="What's still open, most important first."
        >
          {pending.length > 0 ? (
            <TaskList items={pending} domain={domain} />
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
              <MoveRight className="size-3.5" aria-hidden />
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
  id,
  children,
}: {
  id?: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tint text-foreground/80">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-foreground">{title}</div>
          <div className="text-sm leading-5 text-muted-foreground">
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
      <div className="my-4 text-4xl font-bold leading-7 text-foreground font-mono">
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
