import { SoftAuditTabLink } from '@/components/audit/soft-audit-tab-link';
import { RerunFullAuditButton } from '@/components/audit/rerun-full-audit-button';
import type { MonthlyCompareSection, MonthlyLine } from '@/lib/workflow/monthly-compare';

export function MonthlyReviewPanel({
  workspaceBase,
  projectId,
  currentLabel,
  previousLabel,
  compare,
  hasPrevious,
}: {
  workspaceBase: string;
  projectId: string;
  currentLabel: string;
  previousLabel: string | null;
  compare: MonthlyCompareSection | null;
  hasPrevious: boolean;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[14px] bg-white p-5 shadow-sm">
        <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
          Monthly check-in
        </p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-950">
          {hasPrevious ? 'Comparing this audit to the last one' : 'Ready for the next monthly audit'}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {hasPrevious
            ? `This audit: ${currentLabel}. Last audit: ${previousLabel}.`
            : `This audit: ${currentLabel}. Run another full audit next month to compare.`}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <RerunFullAuditButton projectId={projectId} />
          <SoftAuditTabLink
            href={`${workspaceBase}/work`}
            suffix="/work"
            className="inline-flex h-9 items-center rounded-lg bg-white px-3.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            Review open tasks
          </SoftAuditTabLink>
        </div>
      </section>

      {!hasPrevious || !compare ? (
        <section className="rounded-[14px] bg-zinc-50 px-5 py-8 text-sm text-zinc-500">
          You need two completed audits to compare. Keep open tasks so follow-ups stay visible next
          month.
        </section>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <CompareCard title="Better" items={compare.improved} empty="Nothing better yet." />
          <CompareCard title="Worse" items={compare.regressed} empty="Nothing worse." />
          <CompareCard
            title="Still open"
            items={compare.stillPending}
            empty="No open tasks from this audit."
          />
          <CompareCard
            title="Fix next"
            items={compare.needsFollowUp}
            empty="No urgent follow-ups."
          />
        </div>
      )}
    </div>
  );
}

function CompareCard({
  title,
  items,
  empty,
}: {
  title: string;
  items: MonthlyLine[];
  empty: string;
}) {
  return (
    <section className="rounded-[14px] bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-950">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={`${item.title}-${item.detail ?? ''}`} className="text-sm">
              <p className="font-medium leading-6 text-zinc-800">{item.title}</p>
              {item.detail ? (
                <p className="mt-0.5 leading-5 text-zinc-500">{item.detail}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">{empty}</p>
      )}
    </section>
  );
}
