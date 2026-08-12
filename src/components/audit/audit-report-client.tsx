'use client';

import { useEffect, useRef } from 'react';
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
  sessionId,
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
  showUpgradeBanner = false,
}: Props) {
  const router = useRouter();
  const invalidateTab = useInvalidateAuditTab();
  const refreshedRef = useRef(false);

  useEffect(() => {
    if (!analyzing) return;
    refreshedRef.current = false;

    let cancelled = false;
    let timer: number | undefined;

    async function poll() {
      try {
        const res = await fetch(`/api/audit/${sessionId}/status`, { cache: 'no-store' });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { analyzing?: boolean; ready?: boolean };
        if (cancelled) return;
        if (data.ready || data.analyzing === false) {
          if (!refreshedRef.current) {
            refreshedRef.current = true;
            invalidateTab('/workflow');
            invalidateTab('/brief');
            invalidateTab('/work');
            invalidateTab('/monthly');
            router.refresh();
          }
          return;
        }
      } catch {
        // Ignore transient poll failures; retry on next tick.
      }
      if (!cancelled) {
        timer = window.setTimeout(() => {
          void poll();
        }, 4000);
      }
    }

    void poll();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [analyzing, sessionId, invalidateTab, router]);

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
      sessionId={sessionId}
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
