'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { WorkItemStatus, WorkItemView } from '@/lib/workflow/work-items';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: { value: WorkItemStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'skipped', label: 'Skipped' },
];

function priorityClass(priority: WorkItemView['priority']) {
  switch (priority) {
    case 'critical':
      return 'bg-red-50 text-red-800';
    case 'high':
      return 'bg-amber-50 text-amber-900';
    case 'medium':
      return 'bg-zinc-50 text-zinc-700';
    case 'low':
      return 'bg-white text-zinc-500';
    default: {
      const _exhaustive: never = priority;
      return _exhaustive;
    }
  }
}

function toFindingStatus(status: WorkItemStatus): 'open' | 'reviewed' | 'resolved' {
  switch (status) {
    case 'open':
      return 'open';
    case 'in_progress':
      return 'reviewed';
    case 'done':
      return 'resolved';
    case 'skipped':
      return 'resolved';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function toWorkOrderStatus(status: WorkItemStatus): 'open' | 'done' | 'skipped' {
  switch (status) {
    case 'open':
    case 'in_progress':
      return 'open';
    case 'done':
      return 'done';
    case 'skipped':
      return 'skipped';
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

export function WorkItemsQueue({
  projectId,
  items,
  filter,
}: {
  projectId: string;
  items: WorkItemView[];
  filter?: 'open' | 'all' | 'finding' | 'work_order';
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState(items);
  const [error, setError] = useState<string | null>(null);

  const visible = useMemo(() => {
    switch (filter) {
      case 'open':
        return local.filter((i) => i.status === 'open' || i.status === 'in_progress');
      case 'finding':
        return local.filter((i) => i.source === 'finding');
      case 'work_order':
        return local.filter((i) => i.source === 'work_order');
      case 'all':
      case undefined:
        return local;
      default: {
        const _exhaustive: never = filter;
        return _exhaustive;
      }
    }
  }, [filter, local]);

  async function updateItem(item: WorkItemView, status: WorkItemStatus) {
    setError(null);
    setLocal((prev) =>
      prev.map((row) => (row.id === item.id && row.source === item.source ? { ...row, status } : row))
    );

    try {
      if (item.source === 'work_order') {
        const response = await fetch(
          `/api/projects/${projectId}/work-orders/${item.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: toWorkOrderStatus(status),
              nextAction: item.nextAction,
            }),
          }
        );
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? 'Failed to update work order.');
        }
      } else {
        const response = await fetch(`/api/projects/${projectId}/findings/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: toFindingStatus(status),
            nextAction: item.nextAction,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? 'Failed to update finding.');
        }
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.');
      setLocal(items);
    }
  }

  const openCount = local.filter((i) => i.status === 'open' || i.status === 'in_progress').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-zinc-500">
          {openCount} open · {local.length} total — each item has an issue, why, recommendation,
          priority, status, and next action.
        </p>
      </div>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-[14px] bg-white px-4 py-10 text-center text-sm text-zinc-500">
          No work items in this view. Run an audit to generate findings and fix queue items.
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li
              key={`${item.source}-${item.id}`}
              className="rounded-[14px] bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-zinc-950">{item.issue}</h3>
                    <span
                      className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                        priorityClass(item.priority)
                      )}
                    >
                      {item.priority}
                    </span>
                    <span className="rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] font-medium text-zinc-500 uppercase">
                      {item.source === 'finding' ? 'Finding' : 'Work order'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-800">Why it matters: </span>
                    {item.whyItMatters}
                  </p>
                  <p className="mt-1.5 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-800">Recommendation: </span>
                    {item.recommendation}
                  </p>
                  <p className="mt-1.5 text-sm text-zinc-600">
                    <span className="font-medium text-zinc-800">Next action: </span>
                    {item.nextAction}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">Owner hint · {item.ownerHint}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                    Status
                    <select
                      className="mt-1 block h-8 min-w-[8rem] rounded-lg bg-white px-2 text-sm text-zinc-900"
                      value={item.status}
                      disabled={pending}
                      onChange={(event) =>
                        void updateItem(item, event.target.value as WorkItemStatus)
                      }
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={pending || item.status === 'done'}
                      onClick={() => void updateItem(item, 'done')}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      disabled={pending || item.status === 'skipped'}
                      onClick={() => void updateItem(item, 'skipped')}
                      className="rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
