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
import type { AgentPrompt, Finding, Website } from '@/lib/supabase/types';

interface FreeReportProps {
  projectId: string;
  website: Website;
  findings: Finding[];
  siteOnly: SiteOnlyAnalysis | null;
  aeo: AeoAnalysis | null;
  agentPrompts?: AgentPrompt[];
  displayPrompts?: DisplayAgentPrompt[];
  siteIdentity?: SiteIdentity;
  analyzing?: boolean;
  userInitials?: string | null;
  showSignIn?: boolean;
}

export function FreeReport({
  projectId,
  website,
  findings,
  siteOnly,
  aeo,
  agentPrompts = [],
  displayPrompts,
  siteIdentity,
  analyzing,
  userInitials,
  showSignIn = true,
}: FreeReportProps) {
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
    <AppShell userInitials={userInitials} showSignIn={showSignIn && !userInitials}>
      <AuditReportShell
        projectId={projectId}
        website={website}
        siteIdentity={identity}
        view={view}
        prompts={prompts}
        analyzing={analyzing}
        hasResults={Boolean(siteOnly)}
        variant="free"
      />
    </AppShell>
  );
}
