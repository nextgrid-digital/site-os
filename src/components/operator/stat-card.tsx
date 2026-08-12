import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const toneStyles = {
  default: 'border-white/8 bg-[#141416]',
  priority: 'border-priority/35 bg-priority/10',
  success: 'border-success/35 bg-success/10',
  aeo: 'border-aeo/40 bg-aeo/10',
  primary: 'border-white/12 bg-white/5',
} as const;

export function StatCard({
  label,
  value,
  hint,
  className,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  className?: string;
  tone?: keyof typeof toneStyles;
}) {
  return (
    <Card
      className={cn('rounded-2xl py-4 shadow-none ring-1 ring-white/8',
        toneStyles[tone],
        className
      )}
    >
      <CardHeader className="pb-1.5">
        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
