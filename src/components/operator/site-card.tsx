import Link from 'next/link';
import { CircleCheck } from 'lucide-react';
import { readinessLabel, type AuditReadiness } from '@/lib/audit/audit-readiness';
import { ADMIN_STATUS_COPY, type ConnectionStatus } from '@/lib/google/connection-status';
import { PlanToggle } from '@/components/operator/plan-toggle';
import { cn } from '@/lib/utils';

export interface SiteCardData {
  id: string;
  name: string;
  domain: string | null;
  url: string | null;
  updatedAt: string;
  /** null when the project has no signed-in owner yet (pre-signup / admin-added). */
  plan: 'free' | 'paid' | null;
  connectionStatus: ConnectionStatus;
  /** Client self-reported "I've granted access" — distinct from our verified sync state. */
  clientConfirmedAt: string | null;
  latestAudit: {
    status: string;
    runType: string;
    readiness: AuditReadiness | null;
    findingsCount: number | null;
    completedAt: string | null;
  } | null;
}

const CONNECTION_BADGE: Record<ConnectionStatus, string> = {
  not_granted: 'bg-white/8 text-white/45',
  granted_pending_sync: 'bg-amber-500/15 text-amber-300',
  synced_mapped: 'bg-emerald-500/15 text-emerald-300',
  needs_refresh: 'bg-red-500/15 text-red-300',
};

function initialFromName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return 'S';
  return trimmed.slice(0, 1).toUpperCase();
}

function auditMeta(card: SiteCardData) {
  if (!card.latestAudit) return 'No audit yet';
  const parts: string[] = [];
  if (card.latestAudit.status === 'completed') {
    parts.push(card.latestAudit.runType === 'mini' ? 'Site audit ready' : 'Full audit ready');
  } else {
    parts.push(card.latestAudit.status);
  }
  if (card.latestAudit.findingsCount != null) {
    parts.push(`${card.latestAudit.findingsCount} findings`);
  }
  if (card.latestAudit.readiness) {
    parts.push(readinessLabel(card.latestAudit.readiness));
  }
  return parts.join('·');
}

export function SiteCard({ site }: { site: SiteCardData }) {
  return (
    <Link
      href={`/audit/${site.id}/overview`}
      className={cn('group block rounded-2xl border border-white/8 bg-[#141416] p-5 transition-colors',
        'hover:border-white/16 hover:bg-[#18181b]'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/8 text-sm font-semibold text-white">
          {initialFromName(site.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="truncate text-[15px] font-medium text-white">{site.name}</p>
            {site.domain ? (
              <p className="truncate text-sm text-white/45">{site.domain}</p>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PlanToggle projectId={site.id} plan={site.plan} />
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[11px] font-medium',
                CONNECTION_BADGE[site.connectionStatus]
              )}
            >
              {ADMIN_STATUS_COPY[site.connectionStatus]}
            </span>
            {site.clientConfirmedAt && site.connectionStatus !== 'synced_mapped' ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] font-medium text-sky-300">
                <CircleCheck className="size-3" strokeWidth={2} />
                Client confirmed — ready to run
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm text-white/55">{auditMeta(site)}</p>
          <p className="mt-1 text-xs text-white/35">
            Updated {new Date(site.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
