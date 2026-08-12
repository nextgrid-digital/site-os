'use client';

interface MetricTileProps {
  id: string;
  label: string;
  value: string;
  hint?: string;
  active?: boolean;
  onSelect?: (id: string) => void;
}

export function MetricTile({ id, label, value, hint, active, onSelect }: MetricTileProps) {
  const interactive = Boolean(onSelect);
  const className = [
    'flex min-w-0 flex-col gap-1 rounded-2xl px-4 py-3 text-left transition',
    active ? 'bg-zinc-950 text-white shadow-sm' : 'bg-white text-zinc-950 shadow-sm',
    interactive ? 'cursor-pointer' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <>
      <span className={`text-[11px] font-medium uppercase tracking-[0.12em] ${active ? 'text-zinc-400' : 'text-zinc-500'}`}>
        {label}
      </span>
      <span className="truncate text-2xl font-semibold tracking-tight">{value}</span>
      {hint ? (
        <span className={`truncate text-xs ${active ? 'text-zinc-400' : 'text-zinc-500'}`}>{hint}</span>
      ) : null}
    </>
  );

  if (!interactive) {
    return <div className={className}>{body}</div>;
  }

  return (
    <button type="button" className={className} onClick={() => onSelect?.(id)} aria-pressed={active}>
      {body}
    </button>
  );
}
