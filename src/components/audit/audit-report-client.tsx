'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FreeReport } from '@/components/audit/free-report';
import { PaidReport } from '@/components/audit/paid-report';
import { useInvalidateAuditTab } from '@/components/audit/audit-tab-cache';
import type { BrandEvidenceReportView } from '@/lib/evidence/types';
import type { ConnectedAuditMetrics } from '@/lib/db/connected-metrics';
import { buildSiteIdentity, type SiteIdentity } from '@/lib/audit/site-identity';
import type { Website } from '@/lib/supabase/types';

interface Props {
  sessionId: string;
  projectId: string;
  website: Website;
  brandEvidence: BrandEvidenceReportView | null;
  previousBrandEvidence?: BrandEvidenceReportView | null;
  connectedMetrics?: ConnectedAuditMetrics | null;
  hasPaidAudit: boolean;
  hasIntake: boolean;
  analyzing: boolean;
  failed: boolean;
  userInitials?: string | null;
  signedIn?: boolean;
  siteIdentity?: SiteIdentity;
  showUpgradeBanner?: boolean;
}

export function AuditReportClient({
  projectId,
  website,
  brandEvidence,
  previousBrandEvidence = null,
  connectedMetrics = null,
  hasPaidAudit,
  hasIntake,
  analyzing,
  userInitials,
  signedIn,
  siteIdentity,
  showUpgradeBanner = true,
}: Props) {
  const router = useRouter();
  const invalidateTab = useInvalidateAuditTab();

  useEffect(() => {
    if (!analyzing) return;
    const id = window.setInterval(() => {
      invalidateTab('');
      invalidateTab('/journey');
      router.refresh();
    }, 4000);
    return () => window.clearInterval(id);
  }, [analyzing, invalidateTab, router]);

  const identity = siteIdentity ?? buildSiteIdentity({ website, siteOnly: null });
  const showPaid = hasPaidAudit && hasIntake;

  if (showPaid) {
    return (
      <PaidReport
        projectId={projectId}
        website={website}
        brandEvidence={brandEvidence}
        previousBrandEvidence={previousBrandEvidence}
        connectedMetrics={connectedMetrics}
        siteIdentity={identity}
        userInitials={userInitials}
        signedIn={Boolean(signedIn)}
        showUpgradeBanner={showUpgradeBanner}
        embedded
      />
    );
  }

  return (
    <FreeReport
      projectId={projectId}
      website={website}
      brandEvidence={brandEvidence}
      previousBrandEvidence={previousBrandEvidence}
      connectedMetrics={connectedMetrics}
      siteIdentity={identity}
      analyzing={analyzing}
      userInitials={userInitials}
      signedIn={Boolean(signedIn)}
      showUpgradeBanner={showUpgradeBanner}
      embedded
    />
  );
}
