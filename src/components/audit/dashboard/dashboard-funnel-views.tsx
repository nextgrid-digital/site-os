'use client';

import type { FunnelAssessment } from '@/lib/audit/funnel-assessment';
import type { AnalyticsFunnelStepView } from '@/lib/audit/connected-analytics';

function pct(n: number | null) {
  if (n == null || Number.isNaN(n)) return '—';
  return `${n.toFixed(0)}%`;
}

function qualityTag(
  quality: FunnelAssessment['channels'][number]['quality']
): string {
  switch (quality) {
    case 'best_visitors':
      return 'best traffic';
    case 'converting':
      return 'converts';
    case 'weak_quality':
      return 'weak quality';
    case 'high_drop_off':
      return 'wastes traffic';
    case 'neutral':
      return 'neutral';
    default: {
      const _exhaustive: never = quality;
      return _exhaustive;
    }
  }
}

function leakTag(label: FunnelAssessment['landings'][number]['leakLabel']): string {
  switch (label) {
    case 'looks_like_a_leak':
      return 'leak';
    case 'ok':
      return 'ok';
    case 'unclear':
      return 'thin signal';
    default: {
      const _exhaustive: never = label;
      return _exhaustive;
    }
  }
}

function StepBars({
  steps,
}: {
  steps: Array<{ label: string; visitors: number; dropOffPct: number | null; tag?: string }>;
}) {
  if (steps.length === 0) {
    return <p className="text-sm text-zinc-500">No steps in this audit yet.</p>;
  }
  const max = Math.max(...steps.map((s) => s.visitors), 1);
  let worstIdx = -1;
  let worstDrop = -1;
  steps.forEach((s, i) => {
    if (s.dropOffPct != null && s.dropOffPct > worstDrop) {
      worstDrop = s.dropOffPct;
      worstIdx = i;
    }
  });

  return (
    <ul className="space-y-3">
      {steps.map((step, index) => (
        <li key={`${step.label}-${index}`}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="font-medium text-zinc-800">{step.label}</span>
            <span className="tabular-nums text-zinc-500">
              {step.visitors.toLocaleString()}
              {step.dropOffPct != null ? ` · −${pct(step.dropOffPct)}` : ''}
              {index === worstIdx && worstDrop >= 40 ? '· biggest drop' : ''}
              {step.tag ? ` · ${step.tag}` : ''}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className={
                index === worstIdx && worstDrop >= 40
                  ? 'h-full rounded-full bg-amber-500'
                  : 'h-full rounded-full bg-zinc-800'
              }
              style={{ width: `${Math.max(4, (step.visitors / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DashboardFunnelViews({
  assessment,
  pathSteps,
}: {
  assessment: FunnelAssessment;
  pathSteps: AnalyticsFunnelStepView[];
}) {
  const channelSteps = assessment.channels.slice(0, 6).map((c) => ({
    label: c.channel,
    visitors: c.sessions,
    // Non-conversion rate — not sequential step drop-off.
    dropOffPct:
      c.sessions > 0 ? Math.max(0, 100 - c.conversionRate * 100) : null,
    tag: qualityTag(c.quality),
  }));

  const pageSteps =
    pathSteps.length >= 2
      ? pathSteps.map((s) => ({
          label: s.path,
          visitors: s.visitors,
          // Relative volume vs previous popular page — not journey abandonment.
          dropOffPct: s.dropOffPct,
        }))
      : assessment.landings.slice(0, 5).map((l) => ({
          label: l.path,
          visitors: l.sessions,
          dropOffPct:
            l.sessions > 0
              ? Math.max(0, 100 - (l.engagedSessions / l.sessions) * 100)
              : null,
          tag: leakTag(l.leakLabel),
        }));

  const { sessions, engaged, conversions } = assessment.goalTotals;
  const goalStepsRaw: Array<{ label: string; visitors: number }> = [
    { label: 'Visit', visitors: sessions },
  ];
  if (engaged > 0 || sessions > 0) {
    goalStepsRaw.push({ label: 'Engaged', visitors: engaged });
  }
  if (conversions > 0 || sessions > 0) {
    goalStepsRaw.push({ label: 'GA4 conversion', visitors: conversions });
  }

  const goalSteps = goalStepsRaw.map((step, index) => {
    const prev = index === 0 ? step.visitors : goalStepsRaw[index - 1]!.visitors;
    return {
      ...step,
      dropOffPct:
        index === 0 || prev <= 0 ? null : Math.max(0, ((prev - step.visitors) / prev) * 100),
    };
  });

  const leakHint =
    assessment.bottlenecks[0]?.title ??
    (assessment.hasFunnelProblem ? assessment.verdict : null);

  return (
    <div className="space-y-4">
      {leakHint ? (
        <p className="rounded-lg bg-amber-50/70 px-3 py-2 text-sm text-amber-950">
          {leakHint}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[14px] bg-white p-4">
          <h3 className="text-sm font-semibold text-zinc-950">By channel</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Ranked sources · −% = sessions that did not convert
          </p>
          <div className="mt-4">
            <StepBars steps={channelSteps} />
          </div>
        </section>

        <section className="rounded-[14px] bg-white p-4">
          <h3 className="text-sm font-semibold text-zinc-950">Top pages by sessions</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Popular pages — not a click path / journey
          </p>
          <div className="mt-4">
            <StepBars steps={pageSteps} />
          </div>
        </section>

        <section className="rounded-[14px] bg-white p-4">
          <h3 className="text-sm font-semibold text-zinc-950">Goal funnel</h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            Property totals · Visit → engagement → GA4 conversion
          </p>
          <div className="mt-4">
            <StepBars steps={goalSteps} />
          </div>
        </section>
      </div>
    </div>
  );
}
