import type { AnalyticsKpiTile } from '@/lib/audit/connected-analytics';
import {
  METRIC_TILE_ACTIVE,
  METRIC_TILE_GRID,
  METRIC_TILE_IDLE,
} from '@/components/audit/report/metric-tile-styles';

/**
 * KPI tiles matching HeroDemoDashboard metric card layout and surface styling.
 */
export function AnalyticsKpiRow({ tiles }: { tiles: AnalyticsKpiTile[] }) {
  const visible = tiles.filter((t) => !t.hidden);
  if (visible.length === 0) return null;

  return (
    <div className={METRIC_TILE_GRID} aria-label="Key metrics">
      {visible.map((tile) => {
        const selected = Boolean(tile.emphasize);
        return (
          <div
            key={tile.id}
            className={`relative block h-full w-full min-w-0 rounded-[14px] border border-solid p-4 text-left ${
              selected ? METRIC_TILE_ACTIVE : METRIC_TILE_IDLE
            }`}
          >
            <div className="flex h-full w-full min-w-0 flex-col gap-1">
              <div className="flex w-full min-w-0 items-baseline justify-between gap-2">
                <span
                  className={`block overflow-hidden text-xs font-medium leading-[0.9375rem] whitespace-nowrap ${
                    selected ? 'text-color-004' : 'text-muted-foreground'
                  }`}
                >
                  {tile.label}
                </span>
                {tile.hint ? (
                  <span
                    className={`relative flex shrink-0 text-xs font-medium leading-[0.9375rem] ${
                      selected
                        ? 'text-color-004'
                        : tile.hintAccent
                          ? 'text-primary'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {tile.hint}
                  </span>
                ) : null}
              </div>
              <div className="mt-auto min-w-0">
                <span className="inline font-medium leading-5 tracking-[-0.4px] tabular-nums">
                  {tile.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
