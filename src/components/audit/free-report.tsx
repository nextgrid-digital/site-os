import { AppShell } from '@/components/audit/app-shell';
import { AuditReportShell } from '@/components/audit/report/audit-report-shell';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { buildSiteIdentity, type SiteIdentity } from '@/lib/audit/site-identity';
import type { Website } from '@/lib/supabase/types';

interface FreeReportProps {
  projectId: string;
  website: Website;
  brandEvidence: BrandEvidenceReportView | null;
  previousBrandEvidence?: BrandEvidenceReportView | null;
  connectedMetrics?: ConnectedAuditMetrics | null;
  siteIdentity?: SiteIdentity;
  analyzing?: boolean;
  userInitials?: string | null;
  signedIn?: boolean;
  showUpgradeBanner?: boolean;
  /** When true, skip AppShell (parent layout already provides it). */
  embedded?: boolean;
}

export function FreeReport({
  projectId,
  website,
  brandEvidence,
  previousBrandEvidence = null,
  connectedMetrics = null,
  siteIdentity,
  analyzing,
  userInitials,
  signedIn = false,
  showUpgradeBanner = true,
  embedded = false,
}: FreeReportProps) {
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
      analyzing={analyzing}
      variant="free"
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
