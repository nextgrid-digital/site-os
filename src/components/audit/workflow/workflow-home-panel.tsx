import Link from 'next/link';
import { WorkflowStageStrip } from '@/components/audit/workflow/workflow-stage-strip';
import type { WorkflowNowAction, WorkflowStage } from '@/lib/workflow/stages';
import type { WorkItemView } from '@/lib/workflow/work-items';

export function WorkflowHomePanel({
  workspaceBase,
  stages,
  now,
  happening,
  broken,
  firstFix,
  pendingCount,
  oldestPending,
  sinceLast,
  moreTools,
}: {
  workspaceBase: string;
  stages: WorkflowStage[];
  now: WorkflowNowAction;
  happening: string[];
  broken: WorkItemView[];
  firstFix: string | null;
  pendingCount: number;
  oldestPending: WorkItemView | null;
  sinceLast: string | null;
  moreTools: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="space-y-6">
      <WorkflowStageStrip stages={stages} workspaceBase={workspaceBase} />

      <section className="rounded-[14px] bg-white p-5 shadow-sm">
        <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">Now</p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-950">{now.headline}</h2>
        <div className="mt-4">
          <Link
            href={`${workspaceBase}${now.ctaHrefSuffix}`}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-950 px-3.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            {now.ctaLabel}
          </Link>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[14px] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-950">What is happening</h3>
          {happening.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {happening.map((line) => (
                <li key={line} className="text-sm leading-6 text-zinc-600">
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              Connect sources and run an audit to see what is happening on this site.
            </p>
          )}
        </section>

        <section className="rounded-[14px] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-950">What is broken</h3>
          {broken.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {broken.map((item) => (
                <li key={`${item.source}-${item.id}`} className="text-sm">
                  <p className="font-medium text-zinc-950">{item.issue}</p>
                  <p className="mt-0.5 text-zinc-500">{item.whyItMatters}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">No open issues yet.</p>
          )}
        </section>

        <section className="rounded-[14px] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-950">What to do first</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {firstFix ?? 'Run an audit to generate the first fix.'}
          </p>
          {broken.slice(0, 3).length > 0 ? (
            <ol className="mt-3 list-decimal space-y-1 pl-4 text-sm text-zinc-700">
              {broken.slice(0, 3).map((item) => (
                <li key={`first-${item.id}`}>{item.nextAction}</li>
              ))}
            </ol>
          ) : null}
        </section>

        <section className="rounded-[14px] bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-950">Pending</h3>
          <p className="mt-3 text-sm text-zinc-600">
            {pendingCount} open work item{pendingCount === 1 ? '' : 's'}.
          </p>
          {oldestPending ? (
            <p className="mt-2 text-sm text-zinc-500">
              Next up: {oldestPending.issue}
            </p>
          ) : null}
          <Link
            href={`${workspaceBase}/work`}
            className="mt-3 inline-block text-sm font-medium text-zinc-800 underline underline-offset-2"
          >
            Open Work queue
          </Link>
        </section>
      </div>

      <section className="rounded-[14px] bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-950">Since last audit</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          {sinceLast ??
            'Run another audit next month to compare what improved, what regressed, and what is still pending.'}
        </p>
        <Link
          href={`${workspaceBase}/monthly`}
          className="mt-3 inline-block text-sm font-medium text-zinc-800 underline underline-offset-2"
        >
          Open Monthly review
        </Link>
      </section>

      {moreTools.length > 0 ? (
        <section className="rounded-[14px] bg-zinc-50/80 p-4">
          <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            More tools
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            {moreTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="text-sm text-zinc-600 underline-offset-2 hover:text-zinc-950 hover:underline"
              >
                {tool.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
