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
        'rounded-2xl border border-white/8 bg-[#141416] p-5 text-foreground shadow-none',
        className
      )}
    >
      {children}
    </div>
  );
}
