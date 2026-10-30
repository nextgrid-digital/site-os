'use client';

import { Check, Circle, Loader, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TodoItemStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

export type TodoItem = {
  id: string;
  title: ReactNode;
  status?: TodoItemStatus;
  progress?: number;
  detail?: ReactNode;
};

export type TodoListProps = {
  items: TodoItem[];
  title?: ReactNode;
  className?: string;
};

function StatusMark({ status, progress }: { status: TodoItemStatus; progress?: number }) {
  if (status === 'completed') {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-success text-success-foreground">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-destructive text-destructive-foreground">
        <X className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="relative grid size-5 shrink-0 place-items-center text-foreground">
        <Loader className="size-5 animate-spin" />
        {typeof progress === 'number' ? (
          <span className="sr-only">{Math.round(progress)}%</span>
        ) : null}
      </span>
    );
  }
  return (
    <span className="grid size-5 shrink-0 place-items-center text-line-strong">
      <Circle className="size-4" />
    </span>
  );
}

export function TodoList({ items, title = 'To-dos', className }: TodoListProps) {
  const completed = items.filter((item) => (item.status ?? 'pending') === 'completed').length;

  return (
    <section
      aria-label="Task list"
      className={cn('w-full overflow-hidden rounded-2xl bg-raised shadow-sm',
        className
      )}
    >
      <div className="flex h-11 items-center justify-between gap-3 border-b border-border px-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p
          className={cn('text-xs font-medium tabular-nums text-muted-foreground',
            completed === items.length && items.length > 0 && 'text-success-ink'
          )}
        >
          {completed} of {items.length} tasks completed
        </p>
      </div>
      <ul className="space-y-0.5 px-2 py-2">
        {items.map((item) => {
          const status = item.status ?? 'pending';
          return (
            <li
              key={item.id}
              className="flex min-h-9 items-center gap-2.5 rounded-xl px-2 py-1.5"
            >
              <StatusMark status={status} progress={item.progress} />
              <div className="min-w-0 flex-1">
                <p
                  className={cn('truncate text-sm leading-5',
                    status === 'pending' && 'text-muted-foreground',
                    status === 'in-progress' && 'text-foreground',
                    status === 'completed' && 'text-muted-foreground',
                    status === 'cancelled' && 'text-muted-foreground line-through'
                  )}
                >
                  {item.title}
                </p>
              </div>
              {item.detail ? (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.detail}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
