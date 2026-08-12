'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type BriefTocItem = {
  id: string;
  label: string;
  status: 'available' | 'locked';
  lockHint?: string;
};

function TocGroup({
  title,
  items,
  activeId,
}: {
  title: string;
  items: BriefTocItem[];
  activeId: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="mb-1.5 text-[10px] font-semibold tracking-wide text-white/35 uppercase">
        {title}
      </p>
      <ul className="space-y-0.5 border-l border-white/10">
        {items.map((item) => {
          const active = activeId === item.id;
          const locked = item.status === 'locked';
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn('-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-colors',
                  active
                    ? 'border-white text-white'
                    : locked
                      ? 'border-transparent text-white/30 hover:border-white/20 hover:text-white/50'
                      : 'border-transparent text-white/45 hover:border-white/30 hover:text-white/80'
                )}
              >
                <span className="block">{item.label}</span>
                {locked && item.lockHint ? (
                  <span className="mt-0.5 block text-[11px] text-white/25">{item.lockHint}</span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function BriefToc({ items }: { items: BriefTocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.25, 0.5, 1],
      }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const available = items.filter((item) => item.status === 'available');
  const locked = items.filter((item) => item.status === 'locked');

  return (
    <nav
      aria-label="Report index"
      className="print:hidden xl:sticky xl:top-20 xl:self-start"
    >
      <p className="mb-4 text-[10px] font-semibold tracking-wide text-white/40 uppercase">
        Report Index
      </p>
      <div className="space-y-5">
        <TocGroup title="Available" items={available} activeId={activeId} />
        <TocGroup title="Locked" items={locked} activeId={activeId} />
      </div>
    </nav>
  );
}
