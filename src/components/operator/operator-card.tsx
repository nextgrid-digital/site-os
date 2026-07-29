import { cn } from '@/lib/utils';

export function OperatorCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-3xl bg-white/[0.03] p-6 text-foreground shadow-none',
        className
      )}
    >
      {children}
    </div>
  );
}
