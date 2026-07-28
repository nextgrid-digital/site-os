import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AuditCharts } from '@/components/operator/audit-charts';
import { OperatorCard } from '@/components/operator/operator-card';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { RunAuditButton } from '@/components/operator/run-audit-button';
import { StatCard } from '@/components/operator/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProjectWorkspace, isFullBriefUnlocked } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditPage({
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

  const aeoSummary =
    audit?.aeo?.analysis && typeof audit.aeo.analysis === 'object'
      ? (audit.aeo.analysis as {
          business_summary?: string;
          clarity_score?: number;
          answerability_score?: number;
        })
      : null;

  return (
    <OperatorShell>
      <PageHeader
        tone="operator"
        eyebrow="Run"
        title={project.name}
        description="Kick off a site audit — unlock full audit access to connect Google and deepen the report."
        actions={
          <RunAuditButton projectId={projectId} fullBriefUnlocked={fullBriefUnlocked} />
        }
      />

      {audit?.metrics ? (
        <OperatorCard className="flex flex-wrap items-center justify-between gap-3 border-white/12 bg-white/5">
          <div>
            <p className="font-medium text-foreground">Latest report ready</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {audit.metrics.findings_count} findings · open the memo instead of hunting tabs
            </p>
          </div>
          <Button render={<Link href={`/operator/projects/${projectId}/report`} />}>
            Open report
          </Button>
        </OperatorCard>
      ) : null}

      {!audit?.metrics ? (
        <OperatorCard>
          <p className="font-medium text-foreground">No completed audit yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a website URL, then run a site audit. Unlock full audit access to connect Google for
            richer evidence.
          </p>
        </OperatorCard>
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Clicks" value={audit.metrics.total_clicks} tone="primary" />
            <StatCard label="Impressions" value={audit.metrics.total_impressions} />
            <StatCard label="Avg CTR" value={`${(audit.metrics.avg_ctr * 100).toFixed(2)}%`} />
            <StatCard label="Pages crawled" value={audit.metrics.pages_crawled} />
            <StatCard label="Sessions" value={audit.metrics.total_sessions} />
            <StatCard label="Engaged sessions" value={audit.metrics.total_engaged_sessions} />
            <StatCard
              label="Findings"
              value={audit.metrics.findings_count}
              hint={`${audit.metrics.high_severity_count} high severity`}
              tone="priority"
            />
            <StatCard
              label="Conversions"
              value={audit.metrics.total_conversions}
              tone="success"
            />
          </section>

          {audit.aeo ? (
            <OperatorCard className="border-aeo/35 bg-aeo/10">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">AEO draft</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AEO business understanding — AI inference.
                  </p>
                </div>
                <Badge variant="outline">{audit.aeo.status}</Badge>
              </div>
              <div className="mt-4 space-y-3">
                {aeoSummary?.business_summary ? (
                  <p className="line-clamp-3 text-sm text-white/70">{aeoSummary.business_summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {audit.aeo.error_message ?? 'No AEO summary available for this run.'}
                  </p>
                )}
                {aeoSummary?.clarity_score != null && aeoSummary?.answerability_score != null ? (
                  <p className="text-xs text-muted-foreground">
                    Clarity {aeoSummary.clarity_score}/100 · Answerability{' '}
                    {aeoSummary.answerability_score}/100
                  </p>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/operator/projects/${projectId}/report`} />}
                >
                  Open Brief
                </Button>
              </div>
            </OperatorCard>
          ) : null}

          <OperatorCard>
            <p className="font-medium text-foreground">Search opportunity chart</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Top queries by impressions and clicks
            </p>
            <div className="mt-4">
              <AuditCharts
                queryMetrics={audit.queryMetrics}
                gscHasData={
                  audit.auditRun.data_availability?.gscHasData ??
                  (audit.metrics.total_impressions >= 50 && audit.queryMetrics.length > 0)
                }
              />
            </div>
          </OperatorCard>
        </>
      )}
    </OperatorShell>
  );
}
