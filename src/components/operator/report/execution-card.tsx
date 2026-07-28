export function ExecutionCard({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 border-b border-white/8 py-2 last:border-0 sm:grid-cols-[140px_1fr]"
        >
          <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
            {row.label}
          </p>
          <p className="text-sm text-white/80">{row.value}</p>
        </div>
      ))}
    </div>
  );
}
