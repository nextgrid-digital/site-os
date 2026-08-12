import type { ReactNode } from 'react';
import { SoftAuditTabLink } from '@/components/audit/soft-audit-tab-link';
import { ReportPdfButton } from '@/components/operator/report-pdf-button';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import type { MonthlyCompareSection } from '@/lib/workflow/monthly-compare';
import type { WorkItemView } from '@/lib/workflow/work-items';

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
    brief?.auditVerdict.verdict,
    brief?.businessInterpretation,
    ...(brief?.siteOnlySummary?.whatTheSiteSays.slice(0, 2) ?? []),
  ].filter((v): v is string => Boolean(v && v.trim()));

  const broken = brief?.priorityStack.slice(0, 6) ?? [];
  const firstFix = brief?.auditVerdict.firstFix ?? null;
  const recommends =
    brief?.siteOnlySummary?.recommendedNextSteps.slice(0, 5) ??
    (brief?.offerRecommendation.nextgridAction
      ? [brief.offerRecommendation.nextgridAction]
      : []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-zinc-500">
          Client-ready memo for {domain}. Send this into the meeting, then track fixes in Work.
        </p>
        <div className="flex flex-wrap gap-2">
          <ReportPdfButton
            targetSelector="#client-workflow-brief"
            filename={`${domain}-workflow-brief.pdf`}
            backgroundColor="#ffffff"
          />
          <SoftAuditTabLink
            href={`${workspaceBase}/work`}
            suffix="/work"
            className="inline-flex h-8 items-center rounded-lg bg-white px-3 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            Open Work
          </SoftAuditTabLink>
        </div>
      </div>

      <article
        id="client-workflow-brief"
        className="typeset typeset-docs space-y-8 rounded-[14px] bg-white p-6 shadow-sm sm:p-8"
      >
        <header>
          <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            NextGrid · Site-OS brief
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
            Audit action brief · {domain}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            What is happening, what is broken, what to fix first, and what we recommend next.
          </p>
        </header>

        <BriefSection title="What is happening">
          {happening.length > 0 ? (
            <ul className="space-y-2">
              {happening.map((line) => (
                <li key={line} className="text-sm leading-6 text-zinc-700">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Run an audit to populate this section.</Empty>
          )}
        </BriefSection>

        <BriefSection title="What is broken">
          {broken.length > 0 ? (
            <ul className="space-y-3">
              {broken.map((item) => (
                <li key={item.title} className="rounded-lg bg-zinc-50 px-3 py-2.5">
                  <p className="text-sm font-medium text-zinc-950">{item.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{item.summary}</p>
                  <p className="mt-1 text-xs text-zinc-400">{item.whyFirst}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No prioritized issues in this audit yet.</Empty>
          )}
        </BriefSection>

        <BriefSection title="What should be fixed first">
          {firstFix ? (
            <p className="text-sm leading-6 text-zinc-700">{firstFix}</p>
          ) : (
            <Empty>First-fix guidance appears after the audit completes.</Empty>
          )}
          {brief?.executionBriefs?.[0] ? (
            <p className="mt-3 text-sm text-zinc-600">
              Start with: {brief.executionBriefs[0].whatToChange}
            </p>
          ) : null}
        </BriefSection>

        <BriefSection title="What is still pending">
          {pending.length > 0 ? (
            <ul className="space-y-2">
              {pending.slice(0, 8).map((item) => (
                <li key={item.id} className="text-sm text-zinc-700">
                  <span className="font-medium">{item.issue}</span>
                  <span className="text-zinc-500"> — {item.nextAction}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No open work items. Close the loop or schedule the next monthly audit.</Empty>
          )}
        </BriefSection>

        <BriefSection title="What changed since last month">
          {monthly &&
          (monthly.improved.length > 0 ||
            monthly.regressed.length > 0 ||
            monthly.stillPending.length > 0) ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ChangeList label="Better" items={monthly.improved} />
              <ChangeList label="Worse" items={monthly.regressed} />
            </div>
          ) : (
            <Empty>
              Need at least two completed audits to compare months. Schedule the next review to
              unlock this section.
            </Empty>
          )}
        </BriefSection>

        <BriefSection title="What NextGrid recommends next">
          {recommends.length > 0 ? (
            <ul className="space-y-2">
              {recommends.map((line) => (
                <li key={line} className="text-sm leading-6 text-zinc-700">
                  {line}
                </li>
              ))}
            </ul>
          ) : brief?.offerRecommendation ? (
            <div className="space-y-2 text-sm text-zinc-700">
              <p>
                <span className="font-medium">{brief.offerRecommendation.tier}</span>
                {brief.offerRecommendation.priceRange
                  ? ` · ${brief.offerRecommendation.priceRange}`
                  : ''}
              </p>
              <p>{brief.offerRecommendation.rationale}</p>
              <p>{brief.offerRecommendation.nextgridAction}</p>
            </div>
          ) : (
            <Empty>Recommendations appear once the growth brief is available.</Empty>
          )}
          <p className="mt-4 text-sm text-zinc-500">
            Deep source detail:{' '}
            <a href={`${workspaceBase}/evidence`} className="underline underline-offset-2">
              Evidence
            </a>
            {' · '}
            <SoftAuditTabLink
              href={`${workspaceBase}/workflow`}
              suffix="/workflow"
              className="underline underline-offset-2"
            >
              Dashboard
            </SoftAuditTabLink>
          </p>
        </BriefSection>
      </article>
    </div>
  );
}

function BriefSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-zinc-950">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

function ChangeList({
  label,
  items,
}: {
  label: string;
  items: Array<{ title: string; detail?: string }>;
}) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">{label}</p>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {items.slice(0, 6).map((item) => (
            <li key={`${item.title}-${item.detail ?? ''}`} className="text-sm text-zinc-700">
              <p className="font-medium">{item.title}</p>
              {item.detail ? <p className="mt-0.5 text-zinc-500">{item.detail}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-zinc-500">None recorded.</p>
      )}
    </div>
  );
}
