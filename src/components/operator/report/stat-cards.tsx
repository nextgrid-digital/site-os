export function StatCards({
  items,
}: {
  items: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <p className="text-[10px] font-semibold tracking-wide text-white/40 uppercase">
            {item.label}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
