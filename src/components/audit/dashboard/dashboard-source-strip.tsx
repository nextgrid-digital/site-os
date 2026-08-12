import { SoftAuditTabLink } from '@/components/audit/soft-audit-tab-link';
import { cn } from '@/lib/utils';

export type DashboardSourceChip = {
  id: 'website' | 'gsc' | 'ga4' | 'ads';
  label: string;
  connected: boolean;
  detail: string | null;
};

export function DashboardSourceStrip({
  sources,
  connectHref,
}: {
  sources: DashboardSourceChip[];
  connectHref: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {sources.map((source) => (
        <div
          key={source.id}
          className={cn(
            'inline-flex max-w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs',
            source.connected
              ? 'bg-white text-zinc-800'
              : 'bg-zinc-50 text-zinc-500'
          )}
        >
          <span
            className={cn('size-1.5 shrink-0 rounded-full',
              source.connected ? 'bg-emerald-500' : 'bg-zinc-300'
            )}
            aria-hidden
          />
          <span className="font-medium whitespace-nowrap">{source.label}</span>
          {source.detail ? (
            <span className="max-w-[10rem] truncate text-zinc-500" title={source.detail}>
              {source.detail}
            </span>
          ) : (
            <span className="text-zinc-400">{source.connected ? 'On' : 'Off'}</span>
          )}
        </div>
      ))}
      <SoftAuditTabLink
        href={connectHref}
        suffix="/connect"
        className="text-xs font-medium text-zinc-600 underline-offset-2 hover:text-zinc-950 hover:underline"
      >
        Setup
      </SoftAuditTabLink>
    </div>
  );
}

export function buildDashboardSourceChips({
  websiteConnected,
  websiteLabel,
  gscConnected,
  gscLabel,
  ga4Connected,
  ga4Label,
  adsConnected,
  adsLabel,
}: {
  websiteConnected: boolean;
  websiteLabel: string | null;
  gscConnected: boolean;
  gscLabel: string | null;
  ga4Connected: boolean;
  ga4Label: string | null;
  adsConnected: boolean;
  adsLabel: string | null;
}): DashboardSourceChip[] {
  return [
    {
      id: 'website',
      label: 'Website',
      connected: websiteConnected,
      detail: websiteConnected ? websiteLabel : null,
    },
    {
      id: 'gsc',
      label: 'Search Console',
      connected: gscConnected,
      detail: gscConnected ? gscLabel : null,
    },
    {
      id: 'ga4',
      label: 'GA4',
      connected: ga4Connected,
      detail: ga4Connected ? ga4Label : null,
    },
    {
      id: 'ads',
      label: 'Ads',
      connected: adsConnected,
      detail: adsConnected ? adsLabel : null,
    },
  ];
}
