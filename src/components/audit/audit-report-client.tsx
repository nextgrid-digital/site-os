'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FreeReport } from '@/components/audit/free-report';
import { PaidReport, type PaidTrafficData } from '@/components/audit/paid-report';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import { buildSiteIdentity, type SiteIdentity } from '@/lib/audit/site-identity';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import type { AgentPrompt, Finding, Website } from '@/lib/supabase/types';

type ReportState = 'full_free' | 'paid';

interface Props {
  sessionId: string;
  projectId: string;
  website: Website;
  findings: Finding[];
  siteOnly: SiteOnlyAnalysis | null;
  aeo: AeoAnalysis | null;
  hasPaidAudit: boolean;
  hasIntake: boolean;
  analyzing: boolean;
  failed: boolean;
  userInitials?: string | null;
  signedIn?: boolean;
  traffic?: PaidTrafficData;
  agentPrompts?: AgentPrompt[];
  siteIdentity?: SiteIdentity;
}

const EMPTY_TRAFFIC: PaidTrafficData = {
  trafficByChannel: [],
  pageMetrics: [],
  queryMetrics: [],
  googleConnected: false,
};

export function AuditReportClient({
  projectId,
  website,
  findings,
  siteOnly,
  aeo,
  hasPaidAudit,
  hasIntake,
  analyzing,
  userInitials,
  signedIn,
  traffic = EMPTY_TRAFFIC,
  agentPrompts = [],
  siteIdentity,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    if (!analyzing) return;
    const id = window.setInterval(() => {
      router.refresh();
    }, 4000);
    return () => window.clearInterval(id);
  }, [analyzing, router]);

  const state: ReportState = hasPaidAudit && hasIntake ? 'paid' : 'full_free';
  const identity =
    siteIdentity ?? buildSiteIdentity({ website, siteOnly });

  switch (state) {
    case 'full_free':
      return (
        <FreeReport
          projectId={projectId}
          website={website}
          findings={findings}
          siteOnly={siteOnly}
          aeo={aeo}
          agentPrompts={agentPrompts}
          siteIdentity={identity}
          analyzing={analyzing}
          userInitials={userInitials}
          showSignIn={!signedIn}
        />
      );
    case 'paid':
      return (
        <PaidReport
          projectId={projectId}
          website={website}
          findings={findings}
          siteOnly={siteOnly}
          aeo={aeo}
          traffic={traffic}
          agentPrompts={agentPrompts}
          siteIdentity={identity}
          userInitials={userInitials}
        />
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
