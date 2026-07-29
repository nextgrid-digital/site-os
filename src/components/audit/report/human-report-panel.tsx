import Link from 'next/link';
import { ReportSection } from '@/components/audit/report/report-section';
import type { FreeReportViewModel, StoryStepStatus } from '@/lib/audit/free-report-view';
import type {
  ChannelTrafficRow,
  PageMetric,
  QueryMetric,
} from '@/lib/supabase/types';

export interface HumanTrafficTables {
  projectId: string;
  googleConnected: boolean;
  trafficByChannel: ChannelTrafficRow[];
  pageMetrics: PageMetric[];
  queryMetrics: QueryMetric[];
  showUpgradeCta?: boolean;
}

function StatusChip({ status }: { status: StoryStepStatus }) {
  const styles =
    status === 'strong'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : status === 'weak'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-zinc-200 bg-zinc-50 text-zinc-600';
  const label = status === 'strong' ? 'Strong' : status === 'weak' ? 'Weak' : 'Missing';
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${styles}`}>
      {label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles =
    severity === 'critical' || severity === 'high'
      ? 'border-red-200 bg-red-50 text-red-700'
      : severity === 'medium'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : 'border-zinc-200 bg-zinc-50 text-zinc-600';
  return (
    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${styles}`}>
      {severity}
    </span>
  );
}

function kindLabel(kind: string) {
  return kind.replace(/_/g, ' ');
}

function EmptyLine({ children }: { children: string }) {
  return <p className="text-sm text-zinc-500">{children}</p>;
}

export function HumanReportPanel({
  view,
  traffic,
}: {
  view: FreeReportViewModel;
  traffic?: HumanTrafficTables | null;
}) {
  let section = 0;
  const idx = () => ++section;

  const hasGa4 =
    Boolean(traffic) &&
    (traffic!.trafficByChannel.some((r) => r.sessions > 0) ||
      traffic!.pageMetrics.some((p) => p.ga_sessions > 0));
  const hasGsc =
    Boolean(traffic) &&
    (traffic!.queryMetrics.some((q) => q.impressions > 0 || q.clicks > 0) ||
      traffic!.pageMetrics.some((p) => p.gsc_impressions > 0));

  const landingPages = (traffic?.pageMetrics ?? [])
    .filter((p) => p.ga_sessions > 0)
    .toSorted((a, b) => b.ga_sessions - a.ga_sessions)
    .slice(0, 8);

  const channels = (traffic?.trafficByChannel ?? [])
    .toSorted((a, b) => b.sessions - a.sessions)
    .slice(0, 8);

  const queries = (traffic?.queryMetrics ?? [])
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, 8);

  return (
    <div className="space-y-10">
      <ReportSection index={idx()} title="Verdict" lead="The working brief for this site.">
        <div className="space-y-4">
          <p className="max-w-3xl text-base leading-7 text-zinc-800">{view.humanVerdict.verdict}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3">
              <dt className="text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                Main blocker
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-800">{view.humanVerdict.mainBlocker}</dd>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3">
              <dt className="text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                First fix
              </dt>
              <dd className="mt-1 text-sm leading-6 text-zinc-800">{view.humanVerdict.firstFix}</dd>
            </div>
          </dl>
        </div>
      </ReportSection>

      <ReportSection
        index={idx()}
        title="What humans see"
        lead={view.sectionHeadings.clarity}
      >
        {view.humanBlurb ? (
          <p className="mb-4 max-w-3xl text-sm leading-7 text-zinc-700">{view.humanBlurb}</p>
        ) : null}
        {view.humanBullets.length === 0 ? (
          <EmptyLine>No human-facing messaging signals yet.</EmptyLine>
        ) : (
          <ul className="max-w-3xl space-y-2">
            {view.humanBullets.map((item) => (
              <li key={item} className="text-sm leading-6 text-zinc-700">
                {item}
              </li>
            ))}
          </ul>
        )}
      </ReportSection>

      <ReportSection
        index={idx()}
        title="Story flow"
        lead="Problem → promise → solution → proof → action."
      >
        <ol className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
          {view.storyFlow.map((step) => (
            <li key={step.key} className="flex flex-col gap-2 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-zinc-900">{step.label}</p>
                <p className="text-xs leading-5 text-zinc-500">{step.detail}</p>
              </div>
              <StatusChip status={step.status} />
            </li>
          ))}
        </ol>
      </ReportSection>

      <ReportSection
        index={idx()}
        title="Site structure"
        lead="Page types found versus what this category usually needs."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              Present
            </p>
            {view.presentPages.length === 0 ? (
              <EmptyLine>No page types detected yet.</EmptyLine>
            ) : (
              <ul className="space-y-3">
                {view.presentPages.map((page) => (
                  <li key={page.kind}>
                    <p className="text-sm font-medium capitalize text-zinc-900">{kindLabel(page.kind)}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
                      {page.paths.slice(0, 3).join(' · ') || '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              Missing
            </p>
            {view.missingPages.length === 0 ? (
              <EmptyLine>No missing expected types.</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {view.missingPages.map((page) => (
                  <li key={page.kind} className="text-sm capitalize text-zinc-700">
                    {kindLabel(page.kind)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ReportSection>

      <ReportSection
        index={idx()}
        title="What’s blocking conversion"
        lead={view.sectionHeadings.conversion}
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              Blockers
            </p>
            {view.blockers.length === 0 ? (
              <EmptyLine>No conversion blockers flagged.</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {view.blockers.map((item) => (
                  <li key={item} className="text-sm leading-6 text-zinc-700">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
              Architecture gaps
            </p>
            {view.gaps.length === 0 ? (
              <EmptyLine>No architecture gaps flagged.</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {view.gaps.map((item) => (
                  <li key={item} className="text-sm leading-6 text-zinc-700">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </ReportSection>

      <ReportSection
        index={idx()}
        title="Priority findings"
        lead="Ranked by impact on the human journey."
      >
        {view.priorityFindings.length === 0 ? (
          <EmptyLine>No findings yet.</EmptyLine>
        ) : (
          <ol className="space-y-3">
            {view.priorityFindings.map((finding, index) => (
              <li
                key={finding.id}
                className="flex gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-500">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900">{finding.title}</p>
                    <SeverityBadge severity={finding.severity} />
                  </div>
                  <p className="text-xs leading-5 text-zinc-500">{finding.summary}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </ReportSection>

      <ReportSection index={idx()} title="What to do next" lead="Layered recommendations from this crawl.">
        <div className="grid gap-5 sm:grid-cols-3">
          {(
            [
              ['Pages', view.layeredRecs.page],
              ['Story', view.layeredRecs.story],
              ['Sitemap', view.layeredRecs.sitemap],
            ] as const
          ).map(([label, items]) => (
            <div key={label}>
              <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                {label}
              </p>
              {items.length === 0 ? (
                <EmptyLine>Nothing urgent.</EmptyLine>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="text-sm leading-6 text-zinc-700">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </ReportSection>

      {traffic ? (
        <>
          <ReportSection
            index={idx()}
            title="Live traffic"
            lead="Real GA4 / Search Console from the connected run — never sample data."
          >
            {hasGa4 || hasGsc ? (
              <div className="space-y-8">
                {hasGa4 && landingPages.length > 0 ? (
                  <div>
                    <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                      Top pages
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                      <table className="w-full min-w-[28rem] text-left text-sm">
                        <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
                          <tr>
                            <th className="px-3 py-2 font-medium">Path</th>
                            <th className="px-3 py-2 font-medium">Sessions</th>
                            <th className="px-3 py-2 font-medium">Engaged</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {landingPages.map((row) => (
                            <tr key={row.id}>
                              <td className="px-3 py-2 font-mono text-xs text-zinc-800">{row.path}</td>
                              <td className="px-3 py-2 text-zinc-600">{row.ga_sessions}</td>
                              <td className="px-3 py-2 text-zinc-600">{row.ga_engaged_sessions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {hasGa4 && channels.length > 0 ? (
                  <div>
                    <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                      Channels
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                      <table className="w-full min-w-[28rem] text-left text-sm">
                        <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
                          <tr>
                            <th className="px-3 py-2 font-medium">Channel</th>
                            <th className="px-3 py-2 font-medium">Sessions</th>
                            <th className="px-3 py-2 font-medium">Conversions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {channels.map((row) => (
                            <tr key={`${row.channel}-${row.sourceMedium}`}>
                              <td className="px-3 py-2 text-zinc-800">
                                <span className="font-medium">{row.channel || 'Other'}</span>
                                <span className="mt-0.5 block font-mono text-[11px] text-zinc-400">
                                  {row.sourceMedium}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-zinc-600">{row.sessions}</td>
                              <td className="px-3 py-2 text-zinc-600">{row.conversions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}

                {hasGsc && queries.length > 0 ? (
                  <div>
                    <p className="mb-2 text-[11px] font-medium tracking-[0.12em] text-zinc-400 uppercase">
                      Keywords
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-zinc-200">
                      <table className="w-full min-w-[28rem] text-left text-sm">
                        <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] tracking-wide text-zinc-400 uppercase">
                          <tr>
                            <th className="px-3 py-2 font-medium">Query</th>
                            <th className="px-3 py-2 font-medium">Clicks</th>
                            <th className="px-3 py-2 font-medium">Impressions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {queries.map((row) => (
                            <tr key={row.id}>
                              <td className="px-3 py-2 text-zinc-800">{row.query}</td>
                              <td className="px-3 py-2 text-zinc-600">{row.clicks}</td>
                              <td className="px-3 py-2 text-zinc-600">{row.impressions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-5 py-6 text-center">
                <p className="text-sm font-medium text-zinc-800">
                  {traffic.googleConnected
                    ? 'Google is connected, but this run has no traffic rows yet.'
                    : 'Connect Google Search Console and Analytics to unlock live traffic.'}
                </p>
                {traffic.showUpgradeCta !== false ? (
                  <Link
                    href={`/audit/${traffic.projectId}/upgrade`}
                    className="mt-3 inline-flex rounded-lg bg-zinc-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800"
                  >
                    Connect Google
                  </Link>
                ) : null}
              </div>
            )}
          </ReportSection>
        </>
      ) : null}
    </div>
  );
}
