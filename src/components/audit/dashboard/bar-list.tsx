'use client';

export interface BarListItem {
  id: string;
  label: string;
  valueLabel?: string;
  /** 0–100 relative fill */
  pct: number;
  meta?: string;
}

interface BarListProps {
  items: BarListItem[];
  emptyLabel?: string;
}

export function BarList({ items, emptyLabel = 'Nothing to show yet.' }: BarListProps) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-500">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-medium text-zinc-900">{item.label}</span>
            <span className="shrink-0 text-xs text-zinc-500">
              {item.valueLabel ?? `${Math.round(item.pct)}%`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-zinc-900 transition-[width]"
              style={{ width: `${Math.max(4, Math.min(100, item.pct))}%` }}
            />
          </div>
          {item.meta ? <p className="truncate text-[11px] text-zinc-400">{item.meta}</p> : null}
        </li>
      ))}
    </ul>
  );
}
