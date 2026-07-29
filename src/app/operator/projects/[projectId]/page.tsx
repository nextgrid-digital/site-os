import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ScrollText } from 'lucide-react';
import { OperatorCard } from '@/components/operator/operator-card';
import { OperatorShell } from '@/components/operator/operator-shell';
import { PageHeader } from '@/components/operator/page-header';
import { RunAuditButton } from '@/components/operator/run-audit-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getClientIntake } from '@/lib/db/client-intake';
import { getProjectWorkspace, isFullBriefUnlocked } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  if (!hasSupabaseConfig()) notFound();

  const [workspace, clientIntake] = await Promise.all([
    getProjectWorkspace(projectId),
    getClientIntake(projectId),
  ]);
  if (!workspace) notFound();
  const { project, audit } = workspace;
  const fullBriefUnlocked = isFullBriefUnlocked(project);
  const readyToAudit = Boolean(project.website?.url);
  const hasBrief = Boolean(audit?.metrics);
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
        eyebrow="Project"
        title={project.name}
        description={project.website?.url ?? undefined}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={project.google_connected ? 'secondary' : 'outline'}>
              Google {project.google_connected ? 'on' : 'off'}
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

      <div className="grid gap-4 md:grid-cols-2">
        <OperatorCard>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Website</p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {readyToAudit ? 'Ready for a preview audit' : 'Needs a website URL'}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {readyToAudit
              ? `Current setup: ${mappingHint}.`
              : 'Add the client website in intake before you run the preview.'}
          </p>
        </OperatorCard>

        <OperatorCard>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Preview audit</p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {hasBrief ? 'Preview available' : 'Not generated yet'}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {hasBrief && audit?.metrics
              ? `${audit.metrics.findings_count} blockers identified from the latest preview.`
              : 'Run a quick preview to show the client what Site-OS can cover.'}
          </p>
        </OperatorCard>

        <OperatorCard>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Paid audit</p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {fullBriefUnlocked ? 'Ready to run' : 'Needs unlock + intake'}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {fullBriefUnlocked
              ? 'Use the client requirement to generate a tailored paid audit.'
              : 'Keep the free preview simple, then unlock the paid audit when the client is ready.'}
          </p>
        </OperatorCard>

        <OperatorCard>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Client intake</p>
          <h2 className="mt-2 text-lg font-semibold text-white">
            {clientIntake ? 'Requirement received' : 'Waiting for client input'}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {clientIntake?.business_goal ??
              'Share the intake form to collect the business goal, buyer, and success criteria.'}
          </p>
        </OperatorCard>
      </div>

      <OperatorCard className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Primary actions</p>
          <h2 className="mt-2 text-lg font-semibold text-white">Run the core flow</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {readyToAudit ? (
            <RunAuditButton projectId={projectId} fullBriefUnlocked={fullBriefUnlocked} />
          ) : (
            <Button render={<Link href={`/operator/projects/${projectId}/settings`} />}>
              Add website URL
            </Button>
          )}
          {hasBrief ? (
            <Button variant="outline" render={<Link href={`/operator/projects/${projectId}/report`} />}>
              <ScrollText />
              Open report
            </Button>
          ) : null}
          <Button variant="outline" render={<a href={`/audit/${projectId}`} target="_blank" rel="noreferrer" />}>
            <ExternalLink />
            Open client report
          </Button>
          <Button variant="ghost" render={<a href={`/audit/${projectId}/upgrade`} target="_blank" rel="noreferrer" />}>
            Share intake link
          </Button>
          <Button variant="ghost" render={<Link href={`/operator/projects/${projectId}/connect`} />}>
            Connect data
          </Button>
        </div>
      </OperatorCard>

      {clientIntake ? (
        <OperatorCard>
          <p className="text-xs font-medium uppercase tracking-wide text-white/40">Client requirement</p>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-white/40">Goal</span>
              <p className="mt-1 font-medium text-white capitalize">{clientIntake.goal_category.replace('_', ' ')}</p>
            </div>
            {clientIntake.primary_buyer ? (
              <div>
                <span className="text-white/40">Primary buyer</span>
                <p className="mt-1 text-white">{clientIntake.primary_buyer}</p>
              </div>
            ) : null}
            {clientIntake.problem_statement ? (
              <div className="sm:col-span-2">
                <span className="text-white/40">Problem to solve</span>
                <p className="mt-1 text-white">{clientIntake.problem_statement}</p>
              </div>
            ) : null}
          </div>
        </OperatorCard>
      ) : null}

      <OperatorCard>
        <p className="text-xs font-medium uppercase tracking-wide text-white/40">Advanced tools</p>
        <p className="mt-2 text-sm text-white/55">
          Keep these available internally, but out of the main consulting flow.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" render={<Link href={`/operator/projects/${projectId}/leads`} />}>
            Leads
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/operator/projects/${projectId}/findings`} />}>
            Findings
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/operator/projects/${projectId}/graph`} />}>
            Graph
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/operator/projects/${projectId}/systems`} />}>
            Systems
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/operator/projects/${projectId}/pricing`} />}>
            Pricing
          </Button>
          <Button size="sm" variant="outline" render={<Link href={`/operator/projects/${projectId}/work-orders`} />}>
            Work orders
          </Button>
        </div>
      </OperatorCard>
    </OperatorShell>
  );
}
