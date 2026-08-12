import type { AnalyticsKpiTile } from '@/lib/audit/connected-analytics';

const TILE_IDLE =
  'border-surface bg-surface-3 hover:bg-clr-25 hover:shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--foreground)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px]';
const TILE_ACTIVE =
  'border-clr-0 text-surface-3 bg-foreground shadow-[var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px,var(--surface-3)_0px_0px_0px_0px,var(--clr-0)_0px_0px_0px_0px]';

/**
 * KPI tiles matching HeroDemoDashboard metric card layout and surface styling.
 */
export function AnalyticsKpiRow({ tiles }: { tiles: AnalyticsKpiTile[] }) {
  const visible = tiles.filter((t) => !t.hidden);
  if (visible.length === 0) return null;

  return (
    <div className="relative grid grid-cols-6 grid-rows-[166px] items-stretch gap-3 max-md:grid-cols-2 max-md:grid-rows-[77px_77px_77px] md:max-lg:grid-cols-3 md:max-lg:grid-rows-[77px_81px]">
      {visible.map((tile) => {
        const selected = Boolean(tile.emphasize);
        return (
          <div
            key={tile.id}
            className={`relative block h-full w-full min-w-0 rounded-[14px] border border-solid p-4 text-left ${
 selected ? TILE_ACTIVE : TILE_IDLE
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
 selected ? 'text-color-004' : 'text-muted-foreground'
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
