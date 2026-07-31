import Link from 'next/link';
import { AppShell } from '@/components/audit/app-shell';
import { ConnectedUpgradeBanner } from '@/components/audit/connected-upgrade-banner';

export type SitesDashboardSite = {
  sessionId: string;
  projectId: string;
  name: string;
  domain: string;
  findingsCount: number | null;
  status: string;
};

interface SitesDashboardProps {
  sites: SitesDashboardSite[];
  userInitials: string;
  highlightSessionId?: string | null;
  showUpgradeBanner?: boolean;
}

function EmptySparkline() {
  return (
    <div className="flex h-16 items-end gap-px px-1" aria-hidden="true">
      {Array.from({ length: 48 }).map((_, i) => (
        <span
          key={i}
          className="w-[3px] flex-1 rounded-sm bg-zinc-200"
          style={{ height: `${28 + ((i * 17) % 40)}%` }}
        />
      ))}
    </div>
  );
}

export function SitesDashboard({
  sites,
  userInitials,
  highlightSessionId,
  showUpgradeBanner = true,
}: SitesDashboardProps) {
  return (
    <AppShell userInitials={userInitials} signedIn>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm"
        >
          <CalendarIcon />
          Last 7 days
          <ChevronIcon />
        </button>
        <div className="flex items-center gap-2">
          <Link
            href="/#audit"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-50"
          >
            <span className="text-base leading-none">+</span>
            Add site
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm"
          >
            <ArrangeIcon />
            Arrange
          </button>
        </div>
      </div>

      {showUpgradeBanner ? <ConnectedUpgradeBanner className="mb-8" /> : null}

      <section className="space-y-4">
        <h1 className="text-base font-semibold text-zinc-900">All</h1>

        {sites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-zinc-900">No sites yet</p>
            <p className="mt-1 text-sm text-zinc-500">Add a site to start your first free audit.</p>
            <Link
              href="/"
              className="mt-5 inline-flex items-center justify-center rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
            >
              + Add site
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => {
              const letter = (site.domain || site.name || 'S').charAt(0).toUpperCase();
              const highlighted = highlightSessionId === site.sessionId;
              return (
                <li key={site.sessionId}>
                  <Link
                    href={`/audit/${site.sessionId}`}
                    className={`block rounded-2xl border bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md ${
                      highlighted ? 'border-zinc-900 ring-1 ring-zinc-900' : 'border-zinc-200'
                    }`}
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-semibold text-zinc-600">
                        {letter}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-950">{site.name}</p>
                        <p className="truncate text-xs text-zinc-500">{site.domain}</p>
                      </div>
                    </div>
                    <EmptySparkline />
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="inline-flex items-center gap-2 text-zinc-600">
                        <span className="h-2.5 w-2.5 rounded-[2px] bg-zinc-950" aria-hidden="true" />
                        Findings
                      </span>
                      <span className="font-medium text-zinc-950">
                        {site.findingsCount ?? (site.status === 'pending' ? '…' : 0)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ArrangeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h10M4 18h7" />
    </svg>
  );
}
