import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ScrollText } from 'lucide-react';
import {
  AuditWorkspaceCard,
  AuditWorkspacePanel,
} from '@/components/audit/audit-workspace-panel';
import { RunAuditButton } from '@/components/operator/run-audit-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getClientIntake } from '@/lib/db/client-intake';
import { resolveAuditWorkspace } from '@/lib/db/resolve-audit-workspace';
import { getProjectWorkspace, isFullBriefUnlocked } from '@/lib/db/projects';
import { hasSupabaseConfig } from '@/lib/supabase/server';

export default async function AuditOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId: id } = await params;
  if (!hasSupabaseConfig()) notFound();

  const resolved = await resolveAuditWorkspace(id);
  const projectId = resolved.projectId;
  const base = `/audit/${resolved.workspaceId}`;

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
    <AuditWorkspacePanel
      title={project.name}
      description={project.website?.url ?? undefined}
      actions={
        <>
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
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <AuditWorkspaceCard>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Website</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">
            {readyToAudit ? 'Ready for a preview audit' : 'Needs a website URL'}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {readyToAudit
              ? `Current setup: ${mappingHint}.`
              : 'Add the client website in intake before you run the preview.'}
          </p>
        </AuditWorkspaceCard>

        <AuditWorkspaceCard>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Preview audit</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">
            {hasBrief ? 'Preview available' : 'Not generated yet'}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {hasBrief && audit?.metrics
              ? `${audit.metrics.findings_count} blockers identified from the latest preview.`
              : 'Run a quick preview to show the client what Site-OS can cover.'}
          </p>
        </AuditWorkspaceCard>

        <AuditWorkspaceCard>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Paid audit</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">
            {fullBriefUnlocked ? 'Ready to run' : 'Needs unlock + intake'}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {fullBriefUnlocked
              ? 'Use the client requirement to generate a tailored paid audit.'
              : 'Keep the free preview simple, then unlock the paid audit when the client is ready.'}
          </p>
        </AuditWorkspaceCard>

        <AuditWorkspaceCard>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Client intake</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">
            {clientIntake ? 'Requirement received' : 'Waiting for client input'}
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            {clientIntake?.business_goal ??
              'Share the intake form to collect the business goal, buyer, and success criteria.'}
          </p>
        </AuditWorkspaceCard>
      </div>

      <AuditWorkspaceCard className="space-y-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">Primary actions</p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-950">Run the core flow</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {readyToAudit ? (
            <RunAuditButton
              projectId={projectId}
              fullBriefUnlocked={fullBriefUnlocked}
              reportHref={`${base}/growth`}
            />
          ) : (
            <Button render={<Link href={`${base}/intake`} />}>Add website URL</Button>
          )}
          {hasBrief ? (
            <Button variant="outline" render={<Link href={`${base}/growth`} />}>
              <ScrollText />
              Open growth report
            </Button>
          ) : null}
          <Button variant="outline" render={<Link href={base} />}>
            <ExternalLink />
            Open evidence
          </Button>
          <Button variant="ghost" render={<Link href={`${base}/upgrade`} />}>
            Share intake link
          </Button>
          <Button variant="ghost" render={<Link href={`${base}/connect`} />}>
            Connect data
          </Button>
        </div>
      </AuditWorkspaceCard>

      {clientIntake ? (
        <AuditWorkspaceCard>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            Client requirement
          </p>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <span className="text-zinc-400">Goal</span>
              <p className="mt-1 font-medium text-zinc-950 capitalize">
                {clientIntake.goal_category.replace('_', ' ')}
              </p>
            </div>
            {clientIntake.primary_buyer ? (
              <div>
                <span className="text-zinc-400">Primary buyer</span>
                <p className="mt-1 text-zinc-950">{clientIntake.primary_buyer}</p>
              </div>
            ) : null}
            {clientIntake.problem_statement ? (
              <div className="sm:col-span-2">
                <span className="text-zinc-400">Problem to solve</span>
                <p className="mt-1 text-zinc-950">{clientIntake.problem_statement}</p>
              </div>
            ) : null}
          </div>
        </AuditWorkspaceCard>
      ) : null}

    </AuditWorkspacePanel>
  );
}
