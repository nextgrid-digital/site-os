import type { AgentPrompt, Finding, GraphWorkOrder } from '@/lib/supabase/types';

export type WorkItemPriority = 'critical' | 'high' | 'medium' | 'low';
export type WorkItemStatus = 'open' | 'in_progress' | 'done' | 'skipped';
export type WorkItemSource = 'finding' | 'work_order';

export type WorkItemView = {
  id: string;
  source: WorkItemSource;
  issue: string;
  whyItMatters: string;
  recommendation: string;
  priority: WorkItemPriority;
  priorityScore: number;
  status: WorkItemStatus;
  nextAction: string;
  ownerHint: string;
  pagePath: string | null;
  findingId: string | null;
};

function severityToPriority(severity: Finding['severity']): WorkItemPriority {
  switch (severity) {
    case 'critical':
      return 'critical';
    case 'high':
      return 'high';
    case 'medium':
      return 'medium';
    case 'low':
      return 'low';
    default: {
      const _exhaustive: never = severity;
      return _exhaustive;
    }
  }
}

function scoreToPriority(score: number): WorkItemPriority {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

function findingStatusToWorkStatus(status: Finding['status']): WorkItemStatus {
  switch (status) {
    case 'open':
      return 'open';
    case 'reviewed':
      return 'in_progress';
    case 'resolved':
      return 'done';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function workOrderStatusToWorkStatus(
  status: GraphWorkOrder['status'] | null | undefined
): WorkItemStatus {
  switch (status) {
    case 'done':
      return 'done';
    case 'skipped':
      return 'skipped';
    case 'open':
    case null:
    case undefined:
      return 'open';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function ownerHintForFinding(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('architecture') || c.includes('content') || c.includes('copy')) {
    return 'NextGrid';
  }
  if (c.includes('tracking') || c.includes('analytics')) return 'Client';
  return 'Both';
}

function ownerHintForWorkOrder(actionType: string): string {
  if (actionType.includes('create') || actionType.includes('rewrite')) return 'NextGrid';
  if (actionType.includes('proof')) return 'Client';
  return 'Both';
}

export function findingToWorkItem(
  finding: Finding & { next_action?: string | null },
  prompt?: AgentPrompt | null
): WorkItemView {
  const recommendation =
    prompt?.exact_change?.trim() ||
    prompt?.problem?.trim() ||
    finding.estimated_value ||
    'Review the finding and apply the recommended change.';
  const nextAction =
    finding.next_action?.trim() ||
    prompt?.exact_change?.trim() ||
    `Fix: ${finding.title}`;

  return {
    id: finding.id,
    source: 'finding',
    issue: finding.title,
    whyItMatters: finding.summary,
    recommendation,
    priority: severityToPriority(finding.severity),
    priorityScore: finding.priority_score ?? 0,
    status: findingStatusToWorkStatus(finding.status),
    nextAction,
    ownerHint: ownerHintForFinding(finding.category),
    pagePath: finding.page_path,
    findingId: finding.id,
  };
}

export function workOrderToWorkItem(
  order: GraphWorkOrder & { next_action?: string | null }
): WorkItemView {
  return {
    id: order.id,
    source: 'work_order',
    issue: order.title,
    whyItMatters: order.summary,
    recommendation: order.summary,
    priority: scoreToPriority(order.priority_score),
    priorityScore: order.priority_score,
    status: workOrderStatusToWorkStatus(order.status),
    nextAction: order.next_action?.trim() || order.summary || `Complete: ${order.title}`,
    ownerHint: ownerHintForWorkOrder(order.action_type),
    pagePath: null,
    findingId: order.finding_id,
  };
}

/** Merge findings + work orders; prefer work orders when linked to a finding. */
export function buildUnifiedWorkItems(input: {
  findings: Finding[];
  workOrders: GraphWorkOrder[];
  promptsByFindingId?: Map<string, AgentPrompt>;
}): WorkItemView[] {
  const linkedFindingIds = new Set(
    input.workOrders.map((o) => o.finding_id).filter((id): id is string => Boolean(id))
  );

  const fromOrders = input.workOrders.map(workOrderToWorkItem);
  const fromFindings = input.findings
    .filter((f) => !linkedFindingIds.has(f.id))
    .map((f) => findingToWorkItem(f, input.promptsByFindingId?.get(f.id) ?? null));

  return [...fromOrders, ...fromFindings].sort((a, b) => {
    const statusRank = (s: WorkItemStatus) =>
      s === 'open' || s === 'in_progress' ? 0 : s === 'skipped' ? 1 : 2;
    const byStatus = statusRank(a.status) - statusRank(b.status);
    if (byStatus !== 0) return byStatus;
    return b.priorityScore - a.priorityScore;
  });
}

export function matchFindingIdForWorkOrder(
  title: string,
  findings: Array<{ id: string; title: string; page_path: string | null }>
): string | null {
  const normalized = title.trim().toLowerCase();
  if (!normalized) return null;
  const exact = findings.find((f) => f.title.trim().toLowerCase() === normalized);
  if (exact) return exact.id;
  const partial = findings.find(
    (f) =>
      normalized.includes(f.title.trim().toLowerCase()) ||
      f.title.trim().toLowerCase().includes(normalized)
  );
  return partial?.id ?? null;
}
