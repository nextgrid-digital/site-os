import { TriangleAlert } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import type { WorkItemPriority } from '@/lib/workflow/work-items';

const PRIORITY_STYLES: Record<
  WorkItemPriority,
  { label: string; tone: 'danger' | 'warning' | 'neutral' | 'muted' }
> = {
  critical: { label: 'Critical', tone: 'danger' },
  high: { label: 'High impact', tone: 'warning' },
  medium: { label: 'Medium', tone: 'neutral' },
  low: { label: 'Low', tone: 'muted' },
};

export function PriorityBadge({ priority }: { priority?: WorkItemPriority }) {
  if (!priority) return null;
  const style = PRIORITY_STYLES[priority];
  return (
    <StatusBadge tone={style.tone}>
      {priority === 'critical' ? <TriangleAlert aria-hidden /> : null}
      {style.label}
    </StatusBadge>
  );
}

export function PageChip({ path }: { path: string }) {
  return (
    <span className="max-w-[16rem] truncate rounded-full bg-raised px-2 py-0.5 font-mono text-[11px] text-muted-foreground ring-1 ring-border">
      {path}
    </span>
  );
}
