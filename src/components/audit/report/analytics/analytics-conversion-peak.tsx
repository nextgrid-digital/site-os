import type { AnalyticsPeakCell } from '@/lib/audit/connected-analytics';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const LEVEL_CLASS: Record<AnalyticsPeakCell['level'], string> = {
  0: 'bg-transparent',
  1: 'bg-tint-strong',
  2: 'bg-muted-foreground/60',
  3: 'bg-foreground/60',
  4: 'bg-foreground',
};

export function AnalyticsConversionPeak({ cells }: { cells: AnalyticsPeakCell[] }) {
  const lookup = new Map(cells.map((c) => [`${c.dayOfWeek}-${c.hour}`, c]));

  return (
    <div className="rounded-xl bg-raised p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Conversion peak</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Conversions by day of week and hour (GA4).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          {[1, 2, 3, 4].map((level) => (
            <span
              key={level}
              className={`size-3 rounded-sm ${LEVEL_CLASS[level as AnalyticsPeakCell['level']]}`}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {cells.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No conversion timing data yet. Re-run a full audit with GA4 connected.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[640px]">
            <div
              className="mb-1 grid gap-1 text-[11px] text-muted-foreground"
              style={{ gridTemplateColumns: '2.5rem repeat(24, minmax(0, 1fr))' }}
            >
              <span />
              {HOURS.map((h) => (
                <span key={h} className="text-center">
                  {h % 3 === 0 ? h : ''}
                </span>
              ))}
            </div>
            {DAYS.map((day, dayIndex) => (
              <div
                key={day}
                className="mb-1 grid items-center gap-1"
                style={{ gridTemplateColumns: '2.5rem repeat(24, minmax(0, 1fr))' }}
              >
                <span className="text-xs text-muted-foreground">{day}</span>
                {HOURS.map((hour) => {
                  const cell = lookup.get(`${dayIndex}-${hour}`);
                  const level = cell?.level ?? 0;
                  return (
                    <div
                      key={hour}
                      title={
                        cell
                          ? `${day} ${hour}:00 — ${cell.conversions} conversions`
                          : `${day} ${hour}:00 — none`
                      }
                      className={`aspect-square rounded-sm ${LEVEL_CLASS[level]} ${
 level === 0 ? '' : ''
 }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
