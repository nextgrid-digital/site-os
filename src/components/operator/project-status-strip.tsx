import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

export function ProjectStatusStrip({
  projectId,
  googleConnected,
  readyToAudit,
  hasBrief,
  hasWebsite,
  hasOpenWorkOrders = false,
}: {
  projectId: string;
  googleConnected: boolean;
  readyToAudit: boolean;
  hasBrief: boolean;
  hasWebsite: boolean;
  hasOpenWorkOrders?: boolean;
}) {
  const connectDone = hasWebsite && (googleConnected || readyToAudit);
  const stages = [
    {
      label: 'Connect',
      href: `/audit/${projectId}/settings`,
      done: connectDone,
      active: !readyToAudit,
    },
    {
      label: 'Run',
      href: `/audit/${projectId}`,
      done: hasBrief,
      active: readyToAudit && !hasBrief,
    },
    {
      label: 'Fix Queue',
      href: `/audit/${projectId}/work-orders`,
      done: hasOpenWorkOrders === false && hasBrief,
      active: hasBrief,
    },
  ];

  return (
    <nav
      aria-label="Project progress"
      className="flex flex-wrap items-center gap-2 rounded-xl border border-border/80 bg-card/70 p-2"
    >
      {stages.map((stage, index) => (
        <div key={stage.label} className="flex items-center gap-2">
          {index > 0 ? <span className="hidden h-px w-6 bg-border sm:block" aria-hidden /> : null}
          <Link
            href={stage.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors',
              stage.active && 'bg-primary/10 font-medium text-primary',
              stage.done && !stage.active && 'text-success',
              !stage.done && !stage.active && 'text-muted-foreground hover:bg-muted/60'
            )}
          >
            {stage.done ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
            {stage.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
