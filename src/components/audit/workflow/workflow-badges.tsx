import { TriangleAlert } from 'lucide-react';
import type { WorkItemPriority } from '@/lib/workflow/work-items';

const PRIORITY_STYLES: Record<WorkItemPriority, { label: string; className: string }> = {
  critical: { label: 'Critical', className: 'bg-rose-50 text-rose-700' },
  high: { label: 'High impact', className: 'bg-amber-50 text-amber-700' },
  medium: { label: 'Medium', className: 'bg-zinc-100 text-zinc-600' },
  low: { label: 'Low', className: 'bg-zinc-100 text-zinc-500' },
};

export function PriorityBadge({ priority }: { priority?: WorkItemPriority }) {
  if (!priority) return null;
  const style = PRIORITY_STYLES[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${style.className}`}
    >
      {priority === 'critical' ? <TriangleAlert className="size-3" aria-hidden /> : null}
      {style.label}
    </span>
  );
}

export function PageChip({ path }: { path: string }) {
  return (
    <span className="max-w-[16rem] truncate rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-zinc-500 ring-1 ring-zinc-200">
      {path}
    </span>
  );
}
