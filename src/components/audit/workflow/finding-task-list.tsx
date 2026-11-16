'use client';

import { useState } from 'react';
import { CopyFixPrompt } from '@/components/audit/workflow/copy-fix-prompt';
import { StatusBadge } from '@/components/ui/status-badge';
import { CONFIDENCE_LABELS, type FindingConfidence } from '@/lib/audit/finding-credibility';
import type { WorkItemView } from '@/lib/workflow/work-items';

export type FindingTaskRow = { item: WorkItemView; fixPrompt: string };

const CONFIDENCE_TONE: Record<FindingConfidence, 'success' | 'info' | 'neutral' | 'warning'> = {
  verified: 'success',
  inferred: 'info',
  assumed: 'neutral',
  needs_review: 'warning',
};

const VISIBLE = 5;

/** Minimal open-task list: one line per task, top few first, the rest behind a toggle. */
export function FindingTaskList({ rows }: { rows: FindingTaskRow[] }) {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? rows : rows.slice(0, VISIBLE);

  return (
    <div>
      <ul className="divide-y divide-border rounded-xl ring-1 ring-border">
        {shown.map(({ item, fixPrompt }) => {
          const confidence = item.credibility?.confidence;
          return (
            <li key={item.id} className="flex items-center gap-2 px-4 py-2.5">
              <p className="min-w-0 flex-1 truncate text-sm text-foreground" title={item.issue}>
                {item.issue}
              </p>
              {confidence ? (
                <StatusBadge tone={CONFIDENCE_TONE[confidence]}>{CONFIDENCE_LABELS[confidence]}</StatusBadge>
              ) : null}
              <CopyFixPrompt prompt={fixPrompt} />
            </li>
          );
        })}
      </ul>
      {rows.length > VISIBLE ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-sm font-medium text-foreground/80 underline-offset-2 hover:underline print:hidden"
        >
          {expanded ? 'Show fewer' : `Show ${rows.length - VISIBLE} more`}
        </button>
      ) : null}
    </div>
  );
}
