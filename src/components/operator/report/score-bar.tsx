import { cn } from '@/lib/utils';

export function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/45">{label}</span>
        <span className="font-semibold text-white tabular-nums">
          {Math.round(value)}
          <span className="text-white/35">/100</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn('h-full rounded-full transition-all', tone ?? 'bg-white')}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}
