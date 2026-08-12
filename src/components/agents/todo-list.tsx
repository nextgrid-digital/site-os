'use client';

import { Check, Circle, LoaderCircle, X } from 'lucide-react';
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
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
        <Check className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'cancelled') {
    return (
      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-rose-500 text-white">
        <X className="size-3" strokeWidth={3} />
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="relative grid size-5 shrink-0 place-items-center text-zinc-900">
        <LoaderCircle className="size-5 animate-spin" />
        {typeof progress === 'number' ? (
          <span className="sr-only">{Math.round(progress)}%</span>
        ) : null}
      </span>
    );
  }
  return (
    <span className="grid size-5 shrink-0 place-items-center text-zinc-300">
      <Circle className="size-4" />
    </span>
  );
}

export function TodoList({ items, title = 'To-dos', className }: TodoListProps) {
  const completed = items.filter((item) => (item.status ?? 'pending') === 'completed').length;

  return (
    <section
      aria-label="Task list"
      className={cn('w-full overflow-hidden rounded-2xl bg-white shadow-sm',
        className
      )}
    >
      <div className="flex h-11 items-center justify-between gap-3 border-b border-zinc-100 px-4">
        <p className="text-sm font-semibold text-zinc-950">{title}</p>
        <p
          className={cn('text-xs font-medium tabular-nums text-zinc-500',
            completed === items.length && items.length > 0 && 'text-emerald-600'
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
                    status === 'pending' && 'text-zinc-400',
                    status === 'in-progress' && 'text-zinc-950',
                    status === 'completed' && 'text-zinc-400',
                    status === 'cancelled' && 'text-zinc-400 line-through'
                  )}
                >
                  {item.title}
                </p>
              </div>
              {item.detail ? (
                <span className="shrink-0 text-xs tabular-nums text-zinc-400">{item.detail}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
