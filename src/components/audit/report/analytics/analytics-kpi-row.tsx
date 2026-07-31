import type { AnalyticsKpiTile } from '@/lib/audit/connected-analytics';

export function AnalyticsKpiRow({ tiles }: { tiles: AnalyticsKpiTile[] }) {
  const visible = tiles.filter((t) => !t.hidden);
  if (visible.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {visible.map((tile) => (
        <div
          key={tile.id}
          className={`rounded-[14px] border px-4 py-3 shadow-sm ${
            tile.emphasize
              ? 'border-zinc-950 bg-zinc-950 text-white'
              : 'border-zinc-200 bg-white text-zinc-950'
          }`}
        >
          <p
            className={`text-xs font-medium ${tile.emphasize ? 'text-white/60' : 'text-zinc-500'}`}
          >
            {tile.label}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{tile.value}</p>
          {tile.hint ? (
            <p
              className={`mt-1 text-xs ${tile.emphasize ? 'text-white/55' : 'text-emerald-700'}`}
            >
              {tile.hint}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
