import { SoftAuditTabLink } from '@/components/audit/soft-audit-tab-link';
import { leadStageLabel, leadStatusLabel } from '@/lib/leads';
import type { LeadFunnelSummary } from '@/lib/supabase/types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Compact CRM lead reporting for the connected Dashboard (not GA4 conversions). */
export function DashboardLeadsBlock({
  leadSummary,
  leadsHref,
}: {
  leadSummary: LeadFunnelSummary;
  leadsHref: string;
}) {
  const hasLeads = leadSummary.totalLeads > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs text-zinc-500">
          App-owned pipeline — separate from GA4 conversions above.
        </p>
        <SoftAuditTabLink
          href={leadsHref}
          suffix="/leads"
          className="text-xs font-medium text-zinc-600 underline-offset-2 hover:text-zinc-950 hover:underline"
        >
          Open Leads
        </SoftAuditTabLink>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total leads" value={String(leadSummary.totalLeads)} />
        <Stat label="Open" value={String(leadSummary.openLeads)} />
        <Stat label="Closed" value={String(leadSummary.closedLeads)} />
        <Stat label="Pipeline value" value={formatCurrency(leadSummary.totalValue)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[14px] bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-zinc-950">Channel-wise lead gain</h3>
            <span className="text-[11px] text-zinc-400">Lead attribution</span>
          </div>
          {hasLeads && leadSummary.byChannel.length > 0 ? (
            <ul className="space-y-2">
              {leadSummary.byChannel.slice(0, 8).map((row) => (
                <li
                  key={row.channel}
                  className="flex items-baseline justify-between gap-3 text-sm"
                >
                  <span className="font-medium text-zinc-900">{row.channel}</span>
                  <span className="tabular-nums text-zinc-600">
                    {row.count}
                    <span className="text-zinc-400">
                      {' '}
                      · {row.openCount} open · {row.closedCount} closed
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">
              No CRM leads yet. Traffic and GA4 conversions are on Dashboard — add a lead to track
              channel-wise gain here.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[14px] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-950">Funnel stage</h3>
              <span className="text-[11px] text-zinc-400">Pipeline stage</span>
            </div>
            {hasLeads ? (
              <div className="flex flex-wrap gap-2">
                {leadSummary.byStage.map((row) => (
                  <span
                    key={row.stage}
                    className="rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
                  >
                    {leadStageLabel(row.stage)}: {row.count}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Stages appear once leads exist.</p>
            )}
          </div>

          <div className="rounded-[14px] bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-950">Lead status</h3>
              <span className="text-[11px] text-zinc-400">Execution status</span>
            </div>
            {hasLeads ? (
              <div className="flex flex-wrap gap-2">
                {leadSummary.byStatus.map((row) => (
                  <span
                    key={row.status}
                    className="rounded-full bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700"
                  >
                    {leadStatusLabel(row.status)}: {row.count}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Statuses appear once leads exist.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-white px-3 py-3">
      <p className="text-[11px] tracking-wide text-zinc-400 uppercase">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-zinc-950">{value}</p>
    </div>
  );
}
