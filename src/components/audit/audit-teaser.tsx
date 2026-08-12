import type { TeaserSnapshot } from '@/lib/audit/teaser-snapshot';

interface AuditTeaserProps {
  teaser: TeaserSnapshot | null;
  analyzing: boolean;
  failed?: boolean;
}

export function AuditTeaser({ teaser, analyzing, failed }: AuditTeaserProps) {
  const categories =
    teaser?.categories ??
    ([
      { key: 'clarity', label: 'Clarity', count: 0, preview: null },
      { key: 'trust', label: 'Trust', count: 0, preview: null },
      { key: 'cta', label: 'CTA', count: 0, preview: null },
      { key: 'missing_pages', label: 'Missing pages', count: 0, preview: null },
    ] as TeaserSnapshot['categories']);

  return (
    <div className="space-y-6">
      {analyzing ? (
        <div className="rounded-3xl border border-sky-100 bg-sky-50/80 px-5 py-4 text-sm text-sky-900">
          <p className="font-medium">Analyzing your site…</p>
          <p className="mt-1 text-sky-800/80">
            Building a short preview from a live crawl. The full free audit stays locked until you
            sign in.
          </p>
        </div>
      ) : null}

      {failed ? (
        <div className="rounded-3xl bg-red-50 px-5 py-4 text-sm text-red-800">
          Analysis failed for this URL. Try again from the homepage, or sign in and refresh.
        </div>
      ) : null}

      {teaser?.siteBlurb ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">
            Early read
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{teaser.siteBlurb}</p>
          {teaser.findingCount > 0 ? (
            <p className="mt-3 text-xs text-slate-500">
              {teaser.findingCount} signals found — details unlock after sign in.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-950">Preview categories</h2>
        <p className="text-sm text-slate-500">
          High-level areas only. Full findings are available after sign in.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.key}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">{category.label}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  {analyzing && !teaser ? '…' : `${category.count} signals`}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {category.preview
                  ? `Example: ${category.preview}`
                  : analyzing
                    ? 'Waiting for crawl results…'
                    : 'No strong signals in this category yet.'}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 text-sm text-slate-600">
        Sign in or sign up to reveal the full free audit for this website.
      </div>
    </div>
  );
}
