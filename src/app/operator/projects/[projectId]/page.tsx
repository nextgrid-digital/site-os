import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ClipboardList, ExternalLink, ScrollText } from 'lucide-react';
import { OperatorCard } from '@/components/operator/operator-card';
import { LeadFunnelSummary } from '@/components/operator/lead-funnel-summary';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { ProjectStatusStrip } from '@/components/operator/project-status-strip';
import { RunAuditButton } from '@/components/operator/run-audit-button';
import { StatCard } from '@/components/operator/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getProjectLeadReportingSummary,
  getProjectWorkspace,
  getWorkOrdersForAudit,
  isFullBriefUnlocked,
} from '@/lib/db/projects';
import type { GrowthBrief } from '@/lib/reports/build-growth-brief';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const workspace = await getProjectWorkspace(projectId);
  if (!workspace) notFound();
  const { project, audit } = workspace;
  const fullBriefUnlocked = isFullBriefUnlocked(project);
  const leadReporting = await getProjectLeadReportingSummary(projectId);

  const readyToAudit = Boolean(project.website?.url);
  const hasBrief = Boolean(audit?.metrics);
  const workOrders = audit?.auditRun ? await getWorkOrdersForAudit(audit.auditRun.id) : [];
  const openWorkOrders = workOrders.filter((w) => (w.status ?? 'open') === 'open').length;
  const brief = audit?.growthBrief as GrowthBrief | null;
  const presaleReadiness =
    brief?.scorecard.presaleReadiness ?? brief?.scorecard.overallOpportunity ?? null;
  const systemsCount = brief?.commercialGraph?.topOpportunities.length ?? 0;
  const mappingHint =
    project.gsc_property && project.ga4_property
      ? 'Full map'
      : project.gsc_property
        ? 'GSC only'
        : project.ga4_property
          ? 'GA4 only'
          : 'Site-only';

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Overview"
        title={project.name}
        description={project.website?.url ?? undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={project.google_connected ? 'secondary' : 'outline'}>
              Google {project.google_connected ? 'on' : 'off'}
            </Badge>
            <Badge variant={readyToAudit ? 'secondary' : 'outline'}>
              {readyToAudit ? mappingHint : 'Add website'}
            </Badge>
            {project.website?.url ? (
              <Button
                size="sm"
                variant="outline"
                render={<a href={project.website.url} target="_blank" rel="noreferrer" />}
              >
                Site
                <ExternalLink />
              </Button>
            ) : null}
          </div>
        }
      />

      <p className="-mt-2 max-w-2xl text-sm text-white/55">
        Site-OS finds the blockers stopping a website from generating leads, sales conversations, or
        signups before the sale.
      </p>

      <ProjectStatusStrip
        projectId={projectId}
        googleConnected={Boolean(project.google_connected)}
        readyToAudit={readyToAudit}
        hasBrief={hasBrief}
        hasWebsite={Boolean(project.website?.url)}
        hasOpenWorkOrders={openWorkOrders > 0}
      />

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        {hasBrief ? (
          <Button render={<Link href={`/operator/projects/${projectId}/work-orders`} />}>
            <ClipboardList />
            Fix lead blockers
            {openWorkOrders > 0 ? ` (${openWorkOrders})` : ''}
          </Button>
        ) : null}
        {readyToAudit ? (
          <RunAuditButton projectId={projectId} fullBriefUnlocked={fullBriefUnlocked} />
        ) : (
          <Button render={<Link href={`/operator/projects/${projectId}/settings`} />}>
            Add website URL first
          </Button>
        )}
        {hasBrief ? (
          <Button variant="outline" render={<Link href={`/operator/projects/${projectId}/report`} />}>
            <ScrollText />
            Presale Brief
          </Button>
        ) : null}
        <Button
          variant="ghost"
          render={<Link href={`/operator/projects/${projectId}/connect`} />}
        >
          {fullBriefUnlocked ? 'Connect data' : 'Connect (full audit)'}
        </Button>
        <Button variant="outline" render={<Link href={`/operator/projects/${projectId}/leads`} />}>
          Leads
        </Button>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Presale readiness"
          value={presaleReadiness != null ? Math.round(presaleReadiness) : '—'}
          hint={hasBrief ? 'Composite lead-path score' : 'After first audit'}
          tone="primary"
        />
        <StatCard
          label="Open blockers"
          value={hasBrief ? openWorkOrders || workOrders.length || '—' : '—'}
          hint="Fix Queue"
          tone={openWorkOrders > 0 ? 'priority' : 'default'}
        />
        <StatCard
          label="Page plays"
          value={systemsCount || '—'}
          hint="Scalable lead pages"
          tone="default"
        />
        <StatCard
          label="Connections"
          value={
            project.gsc_property && project.ga4_property
              ? 'GSC + GA4'
              : project.gsc_property || project.ga4_property
                ? 'Partial'
                : 'Site-only'
          }
          hint={mappingHint}
          tone={project.gsc_property && project.ga4_property ? 'success' : 'default'}
        />
      </section>

      {hasBrief && audit?.metrics ? (
        <OperatorCard className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">Latest audit snapshot</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {audit.metrics.findings_count} findings · {audit.metrics.high_severity_count} high
              severity
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <p>
                <span className="text-muted-foreground">Clicks </span>
                <span className="font-semibold text-foreground">{audit.metrics.total_clicks}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Sessions </span>
                <span className="font-semibold text-foreground">{audit.metrics.total_sessions}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Pages </span>
                <span className="font-semibold text-foreground">{audit.metrics.pages_crawled}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" render={<Link href={`/operator/projects/${projectId}/work-orders`} />}>
              Fix Queue
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/operator/projects/${projectId}/graph`} />}
            >
              Lead Map
            </Button>
            <Button
              size="sm"
              variant="outline"
              render={<Link href={`/operator/projects/${projectId}/report`} />}
            >
              Presale Brief
            </Button>
          </div>
        </OperatorCard>
      ) : null}

      <LeadFunnelSummary
        projectId={projectId}
        reporting={leadReporting}
        title="Lead funnel snapshot"
        description="See which channels bring traffic, which channels create leads, and where the funnel is stuck."
        showManageButton
      />
    </OperatorShell>
  );
}
