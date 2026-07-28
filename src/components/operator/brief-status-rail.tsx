import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import type { AuditReadiness } from '@/lib/audit/audit-readiness';
import { RunAuditButton } from '@/components/operator/run-audit-button';
import { cn } from '@/lib/utils';

function RailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">{title}</p>
      <div className="divide-y divide-white/8">{children}</div>
    </div>
  );
}

function RailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
      <p className="text-xs text-white/45">{label}</p>
      <p className="text-sm leading-snug text-white/85">{value}</p>
    </div>
  );
}

function reportTypeForRail(readiness: AuditReadiness, isFullRun: boolean): string {
  if (isFullRun && readiness === 'full_data') return 'Full audit';
  if (isFullRun) return 'Growth audit';
  switch (readiness) {
    case 'full_data':
      return 'Site + search + engagement';
    case 'search_console_only':
      return 'Site + Search Console';
    case 'ga4_only':
      return 'Site + GA4';
    case 'no_data':
      return 'Site-only audit';
    default: {
      const _exhaustive: never = readiness;
      return _exhaustive;
    }
  }
}

function connectionLabel(connected: boolean, hasData: boolean): string {
  if (!connected) return 'Not connected';
  if (!hasData) return 'Connected · low volume';
  return 'Connected';
}

export function BriefStatusRail({
  brief,
  isFullRun = false,
  projectId,
  fullBriefUnlocked = false,
  findingsCount,
  pagesCrawled,
}: {
  brief: GrowthBrief;
  isFullRun?: boolean;
  projectId?: string;
  fullBriefUnlocked?: boolean;
  findingsCount?: number;
  pagesCrawled?: number;
}) {
  const pages = pagesCrawled ?? brief.siteOnlySummary?.pagesCrawled ?? 0;
  const findings = findingsCount ?? brief.siteOnlySummary?.criticalFindings ?? 0;

  return (
    <aside className="print:hidden xl:sticky xl:top-20 xl:self-start">
      <div className="rounded-2xl border border-white/8 bg-[#141416] p-4">
        <div className="space-y-5">
          {projectId ? (
            <div className="space-y-2">
              <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                Actions
              </p>
              <RunAuditButton
                projectId={projectId}
                fullBriefUnlocked={fullBriefUnlocked}
                rerunType={isFullRun ? 'full' : 'mini'}
                size="sm"
                className="flex w-full flex-col gap-2 [&_button]:w-full"
              />
            </div>
          ) : null}

          <RailSection title="Summary">
            <RailRow label="Pages crawled" value={String(pages)} />
            <RailRow label="Findings" value={String(findings)} />
            <RailRow
              label="Search Console"
              value={connectionLabel(
                brief.dataAvailability.gscConnected,
                brief.dataAvailability.gscHasData
              )}
            />
            <RailRow
              label="GA4"
              value={connectionLabel(
                brief.dataAvailability.ga4Connected,
                brief.dataAvailability.ga4HasData
              )}
            />
            <RailRow label="Confidence" value={String(brief.confidenceScore)} />
          </RailSection>

          <RailSection title="Status">
            <RailRow label="Report type" value={reportTypeForRail(brief.readiness, isFullRun)} />
            <RailRow label="Readiness" value={brief.readinessLabel} />
            <RailRow label="Audit based on" value={brief.whatWeCanSee.basedOn} />
          </RailSection>
        </div>
      </div>
    </aside>
  );
}
