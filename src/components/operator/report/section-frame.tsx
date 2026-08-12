import type { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function SectionFrame({
  id,
  title,
  locked = false,
  lockReason,
  children,
  className,
}: {
  id: string;
  title: string;
  locked?: boolean;
  lockReason?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn('scroll-mt-24 space-y-4', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2>{title}</h2>
        {locked && lockReason ? (
          <p className="not-typeset text-xs font-medium tracking-wide text-white/40 uppercase">
            Locked · {lockReason}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Visual({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <div
      className={cn('not-typeset rounded-xl border border-white/8 bg-white/[0.03] p-4',
        muted && 'opacity-45'
      )}
    >
      {children}
    </div>
  );
}

function Interpretation({ children }: { children: ReactNode }) {
  return <div className="space-y-2 text-[0.95em] leading-relaxed">{children}</div>;
}

function Action({
  children,
  href,
  cta,
}: {
  children?: ReactNode;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="space-y-2 border-t border-white/8 pt-3">
      <p className="not-typeset text-[10px] font-semibold tracking-wide text-white/40 uppercase">
        Recommended action
      </p>
      {children}
      {href && cta ? (
        <p className="not-typeset">
          <Button variant="outline" size="sm" render={<Link href={href} />}>
            {cta}
          </Button>
        </p>
      ) : null}
    </div>
  );
}

export const SectionFrameRoot = Object.assign(SectionFrame, {
  Visual,
  Interpretation,
  Action,
});

export { SectionFrameRoot as SectionFrame };
