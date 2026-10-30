'use client';

import { useEffect, useRef, useState } from 'react';
import { TodoList, type TodoItem } from '@/components/agents/todo-list';
import { useAuditRun } from '@/components/audit/audit-run-context';

const TASKS = [
  'Pull Search Console, GA4, and Ads data',
  'Crawl the website',
  'Join search, traffic, and pages',
  'Find gaps and build work items',
  'Finish the report',
] as const;

const TICKS_PER_TASK = 4;
const TICK_MS = 900;
const MAX_STEP = TASKS.length * TICKS_PER_TASK;

function itemsAtStep(step: number, failed: boolean): TodoItem[] {
  return TASKS.map((title, index) => {
    const start = index * TICKS_PER_TASK;
    const end = (index + 1) * TICKS_PER_TASK;
    const active = step >= start && step < end;
    const done = step >= end;

    let status: TodoItem['status'] = 'pending';
    if (done) status = 'completed';
    else if (active) status = failed ? 'cancelled' : 'in-progress';

    return {
      id: `audit-task-${index}`,
      title,
      status,
      progress: active && !failed ? ((step % TICKS_PER_TASK) + 1) * 25 : undefined,
      detail: active && !failed ? `${((step % TICKS_PER_TASK) + 1) * 25}%` : undefined,
    };
  });
}

export function AuditRunningPanel() {
  const { error, clearError } = useAuditRun();
  const failed = Boolean(error);
  const [step, setStep] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // Pace UX progress; leave the last task in-progress until the poll finishes.
    if (failed || step >= MAX_STEP - 1) return;
    timer.current = window.setTimeout(() => setStep((value) => value + 1), TICK_MS);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [step, failed]);

  const items = itemsAtStep(failed ? Math.min(step, MAX_STEP - 1) : step, failed);

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 py-10">
      <div className="w-full text-center">
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Full audit</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {failed ? 'Audit stopped' : 'Running your audit'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {failed
            ? 'Fix the issue below, then try again.'
            : 'Tab content is paused until this finishes.'}
        </p>
      </div>
      <TodoList items={items} title="Audit plan" className="w-full" />
      {error ? <p className="max-w-md text-center text-sm text-danger-ink">{error}</p> : null}
      {failed ? (
        <button
          type="button"
          onClick={clearError}
          className="inline-flex h-9 pointer-coarse:h-11 items-center rounded-lg bg-raised px-3.5 text-sm font-medium text-foreground/90 shadow-sm hover:bg-muted"
        >
          Back to workspace
        </button>
      ) : null}
    </div>
  );
}
