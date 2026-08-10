import type { JoinedStatus } from '@/lib/audit/joined-traffic-story';

export function JoinedStatusBanner({
  status,
  connectHref,
}: {
  status: JoinedStatus;
  connectHref?: string;
}) {
  if (status.emptyReason) {
    return (
      <div className="rounded-[14px] border border-dashed border-surface bg-surface-5 p-5">
        <p className="text-sm font-medium">Search → visit → outcome</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.emptyReason}</p>
        {connectHref ? (
          <a
            href={connectHref}
            className="mt-3 inline-block text-sm font-medium underline underline-offset-2 hover:text-foreground"
          >
            Open Connect
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-solid border-surface bg-surface-3 p-5">
      <div className="flex flex-wrap gap-2">
        {status.hasGsc ? (
          <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">
            GSC
          </span>
        ) : null}
        {status.hasGa4 ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
            GA4
          </span>
        ) : null}
        {status.hasAds ? (
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-medium text-violet-800">
            Ads
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-lg font-semibold tracking-tight sm:text-xl">{status.headline}</p>
      {status.breakCallout ? (
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{status.breakCallout}</p>
      ) : null}
      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-surface-6 pt-4">
        <div>
          <p className="text-xs text-muted-foreground">Search clicks</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {status.searchClicks.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sessions</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {status.sessions.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Conversions</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums">
            {status.conversions.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
