import Link from 'next/link';

const COVERAGE_ITEMS = [
  { label: 'Google Search Console', description: 'Query demand, impressions, and landing-page search performance' },
  { label: 'GA4 traffic & engagement', description: 'Sessions, engagement, and landing-page performance by channel' },
  { label: 'Channel-wise traffic distribution', description: 'See which channels bring the most visitors' },
  { label: 'Channel-wise leads gained', description: 'Understand which sources generate actual leads' },
  { label: 'Funnel stage and status', description: 'Track where leads are stuck in your pipeline' },
  { label: 'Search demand & query opportunities', description: 'Prioritize queries with room to win clicks and conversions' },
  { label: 'Landing page performance', description: 'Connect search and analytics evidence to page-level fixes' },
  { label: 'Deeper prioritization', description: 'Goal-shaped ranking across search, site, and conversion' },
  { label: 'Execution-ready recommendations', description: 'Agent prompts and a clear fix-first order of work' },
];

interface CoveragePreviewProps {
  projectId: string;
  showUpgradeLink?: boolean;
}

export function CoveragePreview({ projectId, showUpgradeLink = true }: CoveragePreviewProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-950">Paid connected audit upgrade</h2>
        <p className="text-sm text-slate-500">
          The free audit is complete for crawl + AI review. The paid upgrade adds Search Console,
          GA4, and deeper prioritization.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {COVERAGE_ITEMS.map((item) => (
          <div key={item.label} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
      {showUpgradeLink ? (
        <div className="pt-2">
          <Link
            href={`/audit/${projectId}/upgrade`}
            className="inline-flex rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500"
          >
            Upgrade to connected audit
          </Link>
        </div>
      ) : null}
    </section>
  );
}
