import { cn } from '@/lib/utils';
import type { StrengthLevel } from '@/lib/reports/report-visuals';

const tone: Record<StrengthLevel, string> = {
  Weak: 'bg-priority/20 text-priority',
  Medium: 'bg-warning/20 text-warning',
  Strong: 'bg-success/20 text-success',
};

export type { StrengthLevel };

export function StrengthMatrix({
  rows,
}: {
  rows: Array<{ label: string; strength: StrengthLevel }>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2.5"
        >
          <span className="text-sm text-white/80">{row.label}</span>
          <span
            className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold',
              tone[row.strength]
            )}
          >
            {row.strength}
          </span>
        </div>
      ))}
    </div>
  );
}
