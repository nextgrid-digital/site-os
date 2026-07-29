import { AppShell } from '@/components/audit/app-shell';
import { AuditReportShell } from '@/components/audit/report/audit-report-shell';
import type { AeoAnalysis } from '@/lib/aeo/schema';
import {
  toDisplayAgentPrompts,
  type DisplayAgentPrompt,
} from '@/lib/audit/display-agent-prompts';
import { buildFreeReportView } from '@/lib/audit/free-report-view';
import { buildSiteIdentity, type SiteIdentity } from '@/lib/audit/site-identity';
import type { SiteOnlyAnalysis } from '@/lib/audit/site-only-analysis';
import type {
  AgentPrompt,
  ChannelTrafficRow,
  Finding,
  PageMetric,
  QueryMetric,
  Website,
} from '@/lib/supabase/types';

export interface PaidTrafficData {
  trafficByChannel: ChannelTrafficRow[];
  pageMetrics: PageMetric[];
  queryMetrics: QueryMetric[];
  googleConnected: boolean;
}

interface PaidReportProps {
  projectId: string;
  website: Website;
  findings: Finding[];
  siteOnly: SiteOnlyAnalysis | null;
  aeo: AeoAnalysis | null;
  traffic: PaidTrafficData;
  agentPrompts?: AgentPrompt[];
  displayPrompts?: DisplayAgentPrompt[];
  siteIdentity?: SiteIdentity;
  userInitials?: string | null;
}

export function PaidReport({
  projectId,
  website,
  findings,
  siteOnly,
  aeo,
  traffic,
  agentPrompts = [],
  displayPrompts,
  siteIdentity,
  userInitials,
}: PaidReportProps) {
  const identity = siteIdentity ?? buildSiteIdentity({ website, siteOnly });
  const view = buildFreeReportView({
    siteOnly,
    aeo,
    findings,
    domain: identity.domain,
    title: identity.title,
  });
  const prompts =
    displayPrompts ?? toDisplayAgentPrompts(agentPrompts, findings, website);

  return (
    <AppShell userInitials={userInitials} showSignIn={false}>
      <AuditReportShell
        projectId={projectId}
        website={website}
        siteIdentity={identity}
        view={view}
        prompts={prompts}
        hasResults={Boolean(siteOnly)}
        variant="paid"
        showRerun={false}
        traffic={{
          projectId,
          googleConnected: traffic.googleConnected,
          trafficByChannel: traffic.trafficByChannel,
          pageMetrics: traffic.pageMetrics,
          queryMetrics: traffic.queryMetrics,
          showUpgradeCta: !traffic.googleConnected,
        }}
      />
    </AppShell>
  );
}
