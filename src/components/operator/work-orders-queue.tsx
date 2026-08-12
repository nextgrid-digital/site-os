'use client';

import Link from 'next/link';
import { useMemo, useState, useTransition } from 'react';
import { Check, Copy, ExternalLink, SkipForward } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { workOrderCategoryLabel } from '@/lib/reports/presale-labels';
import type { GraphWorkOrder, GraphWorkOrderStatus } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export type WorkOrderQueueItem = {
  id: string | null;
  actionType: string;
  title: string;
  summary: string;
  fullPrompt: string;
  priorityScore: number;
  status: GraphWorkOrderStatus;
  findingId: string | null;
  revenueImpact?: number;
  confidence?: number;
  source: 'db' | 'brief';
};

function fromDb(row: GraphWorkOrder): WorkOrderQueueItem {
  return {
    id: row.id,
    actionType: row.action_type,
    title: row.title,
    summary: row.summary,
    fullPrompt: row.full_prompt,
    priorityScore: row.priority_score,
    status: row.status ?? 'open',
    findingId: row.finding_id,
    revenueImpact: row.revenue_impact,
    confidence: row.confidence,
    source: 'db',
  };
}

export function WorkOrdersQueue({
  projectId,
  workOrders,
  briefFallbacks = [],
  filterAction,
  workspaceBase,
}: {
  projectId: string;
  workOrders: GraphWorkOrder[];
  briefFallbacks?: WorkOrderQueueItem[];
  filterAction?: string | null;
  /** Base path for in-app links, e.g. `/audit/{id}`. */
  workspaceBase?: string;
}) {
  const base = workspaceBase ?? `/audit/${projectId}`;
  const initial = useMemo(() => {
    if (workOrders.length > 0) return workOrders.map(fromDb);
    return briefFallbacks;
  }, [workOrders, briefFallbacks]);

  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial[0]?.id ?? initial[0]?.title ?? null);
  const [statusFilter, setStatusFilter] = useState<'all' | GraphWorkOrderStatus>('open');
  const [pending, startTransition] = useTransition();

  const filtered = items.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (filterAction && item.actionType !== filterAction) return false;
    return true;
  });

  const selected =
    filtered.find((i) => (i.id ?? i.title) === selectedId) ?? filtered[0] ?? null;

  async function setStatus(item: WorkOrderQueueItem, status: GraphWorkOrderStatus) {
    if (!item.id || item.source !== 'db') {
      toast.message('Re-run audit to persist work order status.');
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/projects/${projectId}/work-orders/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? 'Update failed');
        return;
      }
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, status } : row))
      );
      toast.success(status === 'done' ? 'Marked done' : status === 'skipped' ? 'Skipped' : 'Reopened');
    });
  }

  async function copyPrompt(prompt: string) {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success('Prompt copied');
    } catch {
      toast.error('Could not copy');
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-white/60">
        No blockers in the Fix Queue yet. Run an audit to generate lead-blocker work orders.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(['open', 'done', 'skipped', 'all'] as const).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={statusFilter === key ? 'default' : 'outline'}
              onClick={() => setStatusFilter(key)}
            >
              {key}
            </Button>
          ))}
        </div>
        <ul className="divide-y divide-white/8 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          {filtered.map((item) => {
            const key = item.id ?? item.title;
            const active = selected && (selected.id ?? selected.title) === key;
            return (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => setSelectedId(key)}
                  className={cn('flex w-full flex-col gap-1 px-3 py-3 text-left transition-colors',
                    active ? 'bg-white/10' : 'hover:bg-white/5'
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {workOrderCategoryLabel(item.actionType)}
                    </Badge>
                    <Badge
                      variant={
                        item.status === 'done'
                          ? 'secondary'
                          : item.status === 'skipped'
                            ? 'outline'
                            : 'default'
                      }
                      className="text-[10px]"
                    >
                      {item.status}
                    </Badge>
                    <span className="ml-auto text-xs tabular-nums text-white/40">
                      {Math.round(item.priorityScore)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="line-clamp-2 text-xs text-white/50">{item.summary}</p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {selected ? (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
                {workOrderCategoryLabel(selected.actionType)}
                <span className="ml-2 font-normal normal-case tracking-normal text-white/30">
                  {selected.actionType}
                </span>
              </p>
              <h2 className="text-lg font-semibold text-white">{selected.title}</h2>
              <p className="mt-1 text-sm text-white/60">{selected.summary}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!selected.fullPrompt}
                onClick={() => copyPrompt(selected.fullPrompt)}
              >
                <Copy className="size-3.5" />
                Copy prompt
              </Button>
              {selected.findingId ? (
                <Button
                  size="sm"
                  variant="ghost"
                  render={
                    <Link href={`${base}/findings/${selected.findingId}`} />
                  }
                >
                  <ExternalLink className="size-3.5" />
                  Finding
                </Button>
              ) : null}
              <Button
                size="sm"
                variant="secondary"
                disabled={pending || selected.source !== 'db'}
                onClick={() => setStatus(selected, 'done')}
              >
                <Check className="size-3.5" />
                Done
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending || selected.source !== 'db'}
                onClick={() => setStatus(selected, 'skipped')}
              >
                <SkipForward className="size-3.5" />
                Skip
              </Button>
            </div>
          </div>
          {selected.source === 'brief' ? (
            <p className="text-xs text-amber-200/80">
              From brief snapshot — re-run audit after migration to enable Done/Skip persistence.
            </p>
          ) : null}
          <pre className="max-h-[28rem] overflow-auto rounded-lg border border-white/10 bg-black/40 p-3 text-xs leading-5 whitespace-pre-wrap text-white/80">
            {selected.fullPrompt || 'No prompt generated for this work order.'}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
