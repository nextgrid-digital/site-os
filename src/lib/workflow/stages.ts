import type { ConnectorStatus } from '@/lib/connectors/types';
import type { WorkItemView } from '@/lib/workflow/work-items';

export type WorkflowStageId = 'setup' | 'audit' | 'brief' | 'work' | 'monthly';

export type WorkflowStageState = 'done' | 'current' | 'blocked' | 'upcoming';

export type WorkflowStage = {
  id: WorkflowStageId;
  label: string;
  state: WorkflowStageState;
  hrefSuffix: string;
};

export type WorkflowNowAction = {
  stage: WorkflowStageId;
  headline: string;
  ctaLabel: string;
  ctaHrefSuffix: string;
};

export function deriveWorkflowStages(input: {
  websiteConnected: boolean;
  googleConnected: boolean;
  hasCompletedAudit: boolean;
  openWorkCount: number;
  hasPreviousAudit: boolean;
}): { stages: WorkflowStage[]; now: WorkflowNowAction } {
  const setupDone = input.websiteConnected;
  const auditDone = input.hasCompletedAudit;
  const briefDone = input.hasCompletedAudit;
  const workDone = input.hasCompletedAudit && input.openWorkCount === 0;
  const monthlyDone = input.hasPreviousAudit;

  let current: WorkflowStageId = 'setup';
  if (!setupDone) current = 'setup';
  else if (!auditDone) current = 'audit';
  else if (!briefDone) current = 'brief';
  else if (!workDone) current = 'work';
  else if (!monthlyDone) current = 'monthly';
  else current = 'monthly';

  const order: WorkflowStageId[] = ['setup', 'audit', 'brief', 'work', 'monthly'];
  const labels: Record<WorkflowStageId, string> = {
    setup: 'Setup',
    audit: 'Audit',
    brief: 'Brief',
    work: 'Work',
    monthly: 'Monthly',
  };
  const hrefs: Record<WorkflowStageId, string> = {
    setup: '/connect',
    audit: '/workflow',
    brief: '/brief',
    work: '/work',
    monthly: '/monthly',
  };

  const doneFlags: Record<WorkflowStageId, boolean> = {
    setup: setupDone,
    audit: auditDone,
    brief: briefDone,
    work: workDone,
    monthly: monthlyDone,
  };

  const stages: WorkflowStage[] = order.map((id) => {
    let state: WorkflowStageState = 'upcoming';
    if (id === current) state = 'current';
    else if (doneFlags[id]) state = 'done';
    else if (order.indexOf(id) < order.indexOf(current)) state = 'blocked';
    return { id, label: labels[id], state, hrefSuffix: hrefs[id] };
  });

  const now = buildNowAction({
    current,
    websiteConnected: input.websiteConnected,
    googleConnected: input.googleConnected,
    hasCompletedAudit: input.hasCompletedAudit,
    openWorkCount: input.openWorkCount,
    hasPreviousAudit: input.hasPreviousAudit,
  });

  return { stages, now };
}

function buildNowAction(input: {
  current: WorkflowStageId;
  websiteConnected: boolean;
  googleConnected: boolean;
  hasCompletedAudit: boolean;
  openWorkCount: number;
  hasPreviousAudit: boolean;
}): WorkflowNowAction {
  switch (input.current) {
    case 'setup':
      return {
        stage: 'setup',
        headline: input.websiteConnected
          ? 'Connect Google sources so the next audit includes search and traffic evidence.'
          : 'Add the website and connect sources before the first audit.',
        ctaLabel: 'Open Setup',
        ctaHrefSuffix: '/connect',
      };
    case 'audit':
      return {
        stage: 'audit',
        headline: input.googleConnected
          ? 'Run a full audit to produce findings, a client brief, and work items.'
          : 'Run a site audit to produce findings and a client-ready brief.',
        ctaLabel: 'Run audit',
        ctaHrefSuffix: '/workflow',
      };
    case 'brief':
      return {
        stage: 'brief',
        headline: 'Review the client brief — what is broken, what to fix first, and what to recommend.',
        ctaLabel: 'Open Brief',
        ctaHrefSuffix: '/brief',
      };
    case 'work':
      return {
        stage: 'work',
        headline:
          input.openWorkCount > 0
            ? `${input.openWorkCount} open work item${input.openWorkCount === 1 ? '' : 's'} still need a next action.`
            : 'Track and close work items from this audit.',
        ctaLabel: 'Open Work',
        ctaHrefSuffix: '/work',
      };
    case 'monthly':
      return {
        stage: 'monthly',
        headline: input.hasPreviousAudit
          ? 'Compare this audit to the previous one — what improved, what regressed, what is still pending.'
          : 'After the next monthly audit, compare what changed and continue the retainer loop.',
        ctaLabel: 'Open Monthly',
        ctaHrefSuffix: '/monthly',
      };
    default: {
      const _exhaustive: never = input.current;
      return _exhaustive;
    }
  }
}

export function happeningBullets(input: {
  siteSays?: string[];
  verdict?: string | null;
  mainIssue?: string | null;
  connectorStatuses?: ConnectorStatus[];
  domain?: string;
}): string[] {
  const bullets: string[] = [];
  if (input.verdict) bullets.push(input.verdict);
  if (input.mainIssue) bullets.push(`Main issue: ${input.mainIssue}`);
  for (const line of input.siteSays?.slice(0, 2) ?? []) {
    if (line.trim()) bullets.push(line.trim());
  }
  const connected = (input.connectorStatuses ?? []).filter((s) => s.state === 'connected');
  if (connected.length > 0) {
    bullets.push(
      `Connected sources: ${connected.map((s) => s.label).join(', ')}.`
    );
  } else if (input.domain) {
    bullets.push(`Working from the public website for ${input.domain}.`);
  }
  return bullets.slice(0, 5);
}

export function topBrokenItems(items: WorkItemView[], limit = 5): WorkItemView[] {
  return items.filter((i) => i.status === 'open' || i.status === 'in_progress').slice(0, limit);
}
