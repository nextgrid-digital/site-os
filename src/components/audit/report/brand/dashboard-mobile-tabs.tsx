'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  DASHBOARD_RAIL_ITEMS,
  useDashboardSectionSpy,
  useIsDesktopNav,
} from './use-dashboard-section-spy';

/** Small-screen section switcher: sticky, scrollable tabs with an underline on the section in view. */
export function DashboardMobileTabs() {
  const desktop = useIsDesktopNav();
  const { activeId, selectSection } = useDashboardSectionSpy(!desktop);
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the active tab visible inside the horizontally scrollable strip.
  useEffect(() => {
    const tab = listRef.current?.querySelector<HTMLElement>('[aria-current="true"]');
    tab?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  if (desktop) return null;

  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-0 z-20 border-b border-solid border-border bg-background/90 backdrop-blur "
    >
      <ul
        ref={listRef}
        className="mx-auto flex max-w-280 gap-1 overflow-x-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {DASHBOARD_RAIL_ITEMS.map((section) => {
          const active = activeId === section.id;
          return (
            <li key={section.id} className="shrink-0">
              <a
                href={section.href}
                aria-current={active ? 'true' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  selectSection(section.id, true);
                }}
                className={cn(
                  'relative block px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {section.label}
                <span
                  aria-hidden
                  className={cn(
                    'absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-foreground transition-opacity',
                    active ? 'opacity-100' : 'opacity-0'
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
