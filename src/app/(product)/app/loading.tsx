export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading sites">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="h-9 w-36 rounded-lg bg-zinc-200" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-zinc-200" />
        </div>
      </div>
      <div className="h-5 w-12 rounded bg-zinc-200" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="mb-4 flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-zinc-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-200" />
                <div className="h-3 w-1/2 rounded bg-zinc-100" />
              </div>
            </div>
            <div className="h-16 rounded-lg bg-zinc-100" />
            <div className="mt-3 flex justify-between">
              <div className="h-4 w-20 rounded bg-zinc-200" />
              <div className="h-4 w-8 rounded bg-zinc-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
