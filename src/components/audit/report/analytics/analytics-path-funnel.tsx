import type { AnalyticsFunnelStepView } from '@/lib/audit/connected-analytics';
import { AnalyticsRowIcon } from '@/components/audit/report/analytics/analytics-row-icon';

export function AnalyticsPathFunnel({ steps }: { steps: AnalyticsFunnelStepView[] }) {
  const completed = steps.length ? steps[steps.length - 1] : null;
  const totalConv = completed ? Math.round(completed.conversionPct) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-950">Lead conversion</p>
            <p className="mt-1 text-sm text-zinc-500">
              {steps.length >= 2
                ? `${completed?.visitors.toLocaleString() ?? 0} at final step · ${totalConv}% of first-step traffic`
                : 'Path funnel from top GA4 pages'}
            </p>
          </div>
        </div>

        {steps.length < 2 ? (
          <p className="mt-6 text-sm text-zinc-500">
            Not enough page-path data to build a funnel. Re-run a full audit with GA4 connected.
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.step} className="rounded-xl bg-zinc-50/80 p-4">
                <div className="flex min-w-0 items-center gap-2">
                  <AnalyticsRowIcon kind="page" label={step.path} />
                  <p className="truncate font-mono text-xs text-zinc-500">{step.path}</p>
                </div>
                <p className="mt-2 text-lg font-semibold tabular-nums text-zinc-950">
                  {step.visitors.toLocaleString()} visitors
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {step.dropOffPct == null
                    ? 'Entry step'
                    : `${step.dropOffPct.toFixed(0)}% drop-off`}
                </p>
                <p className="mt-4 text-3xl font-semibold tabular-nums text-emerald-700">
                  {Math.round(step.conversionPct)}%
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {steps.length >= 2 ? (
        <div className="rounded-[14px] bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-zinc-950">Step breakdown</p>
          <p className="mt-1 text-sm text-zinc-500">All time in this audit window</p>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-zinc-400">
                <th className="pb-2 font-medium">Step</th>
                <th className="pb-2 text-right font-medium">Visitors</th>
                <th className="pb-2 text-right font-medium">Conv.</th>
                <th className="pb-2 text-right font-medium">Drop-off</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step) => (
                <tr key={step.step} className="border-t border-zinc-100">
                  <td className="py-2 font-medium text-zinc-900">
                    <span className="inline-flex items-center gap-2">
                      <AnalyticsRowIcon kind="page" label={step.path} />
                      <span>
                        {step.step}. {step.path}
                      </span>
                    </span>
                  </td>
                  <td className="py-2 text-right tabular-nums">{step.visitors.toLocaleString()}</td>
                  <td className="py-2 text-right tabular-nums">
                    {step.conversionPct.toFixed(1)}%
                  </td>
                  <td className="py-2 text-right tabular-nums text-zinc-500">
                    {step.dropOffPct == null ? '—' : `${step.dropOffPct.toFixed(1)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
