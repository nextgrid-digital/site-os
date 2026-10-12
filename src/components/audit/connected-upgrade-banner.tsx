import Link from 'next/link';

export function ConnectedUpgradeBanner({
  className = 'mb-0',
  href = '/#pricing',
}: {
  className?: string;
  href?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-xl bg-[#f8e8e6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-rose-300 text-rose-700">
          <AlertIcon />
        </span>
        <div className="space-y-0.5 text-sm leading-5 text-zinc-800">
          <p className="font-semibold">
            Free audits are crawl-only. Want the full picture?
          </p>
          <p className="text-zinc-600">
            Pay once — $700 — and we run a full audit using your real Search Console, GA4, and
            Ads data. No subscription, no recurring charge.
          </p>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
      >
        Upgrade
      </Link>
    </div>
  );
}

function AlertIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}
