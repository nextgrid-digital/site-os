export default function AuditSegmentLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading audit">
      <div className="flex gap-3 pb-3">
        <div className="h-8 w-20 rounded-lg bg-zinc-200" />
        <div className="h-8 w-20 rounded-lg bg-zinc-200" />
        <div className="h-8 w-20 rounded-lg bg-zinc-200" />
      </div>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 shrink-0 rounded-2xl bg-zinc-200" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-7 w-2/3 max-w-md rounded-lg bg-zinc-200" />
          <div className="h-4 w-1/2 max-w-sm rounded bg-zinc-200" />
        </div>
      </div>
      <div className="h-48 rounded-2xl bg-white" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-white" />
    </div>
  );
}
