import { Loader } from 'lucide-react';

/** Spinner + text, centered in a fixed-height area so content swapping in doesn't shift layout. */
export function LoadingLabel({
  text = 'Loading…',
  className = 'min-h-64',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex ${className} flex-col items-center justify-center gap-3 text-sm text-muted-foreground`}
      aria-busy="true"
      aria-label={text}
      role="status"
    >
      <Loader className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
      <span className="shimmer font-semibold">{text}</span>
    </div>
  );
}

export function DashboardSkeleton({
  text = 'Loading…',
}: {
  blocks?: 1 | 2 | 3;
  tiles?: boolean;
  text?: string;
}) {
  return <LoadingLabel text={text} className="min-h-96" />;
}

export function SectionSkeleton({
  className = 'h-48',
}: {
  className?: string;
}) {
  return <LoadingLabel className={className} />;
}
