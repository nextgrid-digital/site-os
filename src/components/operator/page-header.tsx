import { cn } from '@/lib/utils';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  tone = 'default',
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  tone?: 'default' | 'operator';
}) {
  const isOperator = tone === 'operator';

  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <p
            className={cn('text-xs font-medium tracking-wide uppercase',
              isOperator ? 'text-white/45' : 'text-muted-foreground'
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn('text-2xl font-semibold tracking-tight',
            isOperator ? 'font-display text-white' : null
          )}
        >
          {title}
        </h1>
        {description ? (
          <p
            className={cn('max-w-2xl text-sm',
              isOperator ? 'text-white/50' : 'text-muted-foreground'
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
