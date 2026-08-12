import Link from 'next/link';
import type { WorkflowStage } from '@/lib/workflow/stages';
import { cn } from '@/lib/utils';

export function WorkflowStageStrip({
  stages,
  workspaceBase,
}: {
  stages: WorkflowStage[];
  workspaceBase: string;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label="Workflow stages">
      {stages.map((stage, index) => (
        <li key={stage.id} className="flex items-center gap-1.5">
          {index > 0 ? <span className="text-zinc-300" aria-hidden>→</span> : null}
          <Link
            href={`${workspaceBase}${stage.hrefSuffix}`}
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase transition',
              stage.state === 'current' && 'bg-zinc-950 text-white',
              stage.state === 'done' && 'bg-emerald-50 text-emerald-800',
              stage.state === 'upcoming' && 'bg-white text-zinc-500',
              stage.state === 'blocked' && 'bg-zinc-50 text-zinc-400'
            )}
          >
            {stage.label}
          </Link>
        </li>
      ))}
    </ol>
  );
}
