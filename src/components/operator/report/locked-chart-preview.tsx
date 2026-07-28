export function LockedChartPreview({ label = 'Preview' }: { label?: string }) {
  const bars = [42, 68, 28, 55, 35, 72, 22];
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold tracking-wide text-white/35 uppercase">{label}</p>
      <div className="flex h-24 items-end gap-1.5">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex-1 rounded-sm bg-white/10"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {['Queries', 'Pages', 'Demand'].map((item) => (
          <div key={item} className="h-8 rounded-md border border-dashed border-white/15" />
        ))}
      </div>
    </div>
  );
}
