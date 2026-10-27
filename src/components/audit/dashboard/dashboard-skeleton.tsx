/**
 * Lightweight loading placeholder. Static blocks + ONE compositor-only sheen
 * (transform on a single overlay) instead of N pulsing elements, and fixed
 * heights so content swapping in never shifts the layout.
 */
export function DashboardSkeleton({
  blocks = 2,
  tiles = true,
}: {
  blocks?: 1 | 2 | 3;
  tiles?: boolean;
}) {
  return (
    <div
      className="relative isolate overflow-hidden rounded-2xl"
      aria-busy="true"
      aria-label="Loading"
      role="status"
    >
      <div className="space-y-4">
        {tiles ? (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-tint" />
            ))}
          </div>
        ) : null}
        {blocks >= 2 ? <div className="h-64 rounded-2xl bg-tint" /> : null}
        {blocks >= 3 ? <div className="h-40 rounded-2xl bg-tint" /> : null}
      </div>
      <div
        aria-hidden
        className="dashboard-sheen pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/50 to-transparent will-change-transform motion-reduce:hidden"
      />
    </div>
  );
}

export function SectionSkeleton({
  className = "h-48",
}: {
  className?: string;
}) {
  return <div className={`${className} rounded-2xl bg-tint`} aria-hidden />;
}
