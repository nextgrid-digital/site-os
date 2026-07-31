import { AppShell } from '@/components/audit/app-shell';
import { AuditReportShell } from '@/components/audit/report/audit-report-shell';
import { RerunFullAuditButton } from '@/components/audit/rerun-full-audit-button';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { buildSiteIdentity, type SiteIdentity } from '@/lib/audit/site-identity';
import type { Website } from '@/lib/supabase/types';

interface PaidReportProps {
  projectId: string;
  website: Website;
  brandEvidence: BrandEvidenceReportView | null;
  previousBrandEvidence?: BrandEvidenceReportView | null;
  connectedMetrics?: ConnectedAuditMetrics | null;
  siteIdentity?: SiteIdentity;
  userInitials?: string | null;
  signedIn?: boolean;
  showUpgradeBanner?: boolean;
  embedded?: boolean;
}

export function PaidReport({
  projectId,
  website,
  brandEvidence,
  previousBrandEvidence = null,
  connectedMetrics = null,
  siteIdentity,
  userInitials,
  signedIn = false,
  showUpgradeBanner = true,
  embedded = false,
}: PaidReportProps) {
  const identity = siteIdentity ?? buildSiteIdentity({ website, siteOnly: null });
  const isSignedIn = signedIn || Boolean(userInitials);

  const body = (
    <AuditReportShell
      projectId={projectId}
      website={website}
      siteIdentity={identity}
      brandEvidence={brandEvidence}
      previousBrandEvidence={previousBrandEvidence}
      connectedMetrics={connectedMetrics}
      variant="paid"
      showRerun
      rerunSlot={<RerunFullAuditButton projectId={projectId} />}
      showUpgradeBanner={showUpgradeBanner}
    />
  );

  if (embedded) return body;

  return (
    <AppShell
      userInitials={userInitials}
      signedIn={isSignedIn}
      showSignIn={!isSignedIn}
    >
      {body}
    </AppShell>
  );
}
