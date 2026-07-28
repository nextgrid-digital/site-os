import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16 bg-white/10" />
          <Skeleton className="h-8 w-56 bg-white/10" />
          <Skeleton className="h-4 w-72 bg-white/10" />
        </div>
        <Skeleton className="h-9 w-40 rounded-full bg-white/10" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 rounded-2xl bg-white/8" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl bg-white/8" />
      <Skeleton className="h-56 rounded-2xl bg-white/8" />
    </div>
  );
}
