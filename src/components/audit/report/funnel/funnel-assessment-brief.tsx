import Link from 'next/link';
import { SectionHeading } from '@/components/audit/report/section-heading';
import type { FunnelAssessment } from '@/lib/audit/funnel-assessment';

/**
 * Compact funnel pulse: one-line verdict + summary metric cards only.
 */
export function FunnelAssessmentBrief({
  assessment,
  connectHref,
}: {
  assessment: FunnelAssessment;
  connectHref?: string;
}) {
  if (!assessment.hasData) {
    return (
      <section className="block pt-4">
        <div className="mx-auto max-w-280 space-y-6 px-8 py-12">
          <SectionHeading
            title="Funnel pulse"
            lead="Key funnel metrics once Search Console and GA4 data are in this audit."
          />
          <div className="rounded-[14px] border border-dashed border-surface bg-surface-5 p-5">
            <p className="text-sm font-medium text-zinc-950">{assessment.verdict}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {assessment.emptyReason}
            </p>
            {assessment.connectHint && connectHref ? (
              <Link
                href={connectHref}
                className="mt-3 inline-block text-sm font-medium underline underline-offset-2 hover:text-foreground"
              >
                Open Settings
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="block pt-4">
      <div className="mx-auto max-w-280 space-y-6 px-8 py-12">
        <SectionHeading
          title="Funnel pulse"
          lead="Snapshot metrics for traffic, drop-off, leak pages, and weak channels."
        />

        <div
          className={`rounded-[14px] border border-solid px-4 py-3 ${
            assessment.hasFunnelProblem
              ? 'border-amber-200 bg-amber-50/60'
              : 'border-surface bg-surface-3'
          }`}
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Funnel status
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-zinc-950">
            {assessment.verdict}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assessment.summaryCards.map((card) => (
            <div
              key={card.id}
              className="rounded-[14px] border border-solid border-surface bg-surface-3 p-4"
            >
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-1 text-base font-semibold tracking-tight break-words text-zinc-950">
                {card.value}
              </p>
              {card.hint ? (
                <p className="mt-1 text-xs leading-5 text-zinc-500">{card.hint}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
