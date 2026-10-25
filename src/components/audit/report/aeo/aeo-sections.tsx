'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from '@/lib/ease';
import { cn } from '@/lib/utils';

export const AEO_SECTIONS = [
  { id: 'ai-traffic', label: 'AI traffic' },
  { id: 'topic-map', label: 'Topic map' },
  { id: 'citation-probe', label: 'Citation probe' },
] as const;

export type AeoSectionId = (typeof AEO_SECTIONS)[number]['id'];

// One preference per browser, shared by all of the customer's projects.
const STORAGE_KEY = 'siteos.aeo.hidden-sections';
const CHANGE_EVENT = 'siteos:aeo-hidden-change';

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function readRaw(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function parseHidden(raw: string): Set<AeoSectionId> {
  const known = new Set<string>(AEO_SECTIONS.map((s) => s.id));
  return new Set(raw.split(',').filter((id): id is AeoSectionId => known.has(id)));
}

/** Server and first client render show everything; the saved choice applies right after hydration. */
export function useHiddenAeoSections() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => '');
  const hidden = useMemo(() => parseHidden(raw), [raw]);

  const toggle = useCallback((id: AeoSectionId) => {
    const next = parseHidden(readRaw());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, [...next].join(','));
    } catch {
      // Storage blocked (private mode): the toggle just won't persist.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { hidden, toggle };
}

/** Collapses a card away smoothly and unmounts it, so a hidden card makes no requests. */
export function AeoSection({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const duration = reduced ? 0 : 0.34;
  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          initial={{ height: 0, opacity: 0, y: reduced ? 0 : -8 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: reduced ? 0 : -8 }}
          transition={{ duration, ease: EASE_OUT }}
          // Side padding keeps the cards' shadows from being clipped while height animates.
          className="-mx-1 overflow-hidden px-1"
        >
          <div className="pb-4">{children}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function AeoSectionToggles({
  hidden,
  onToggle,
}: {
  hidden: Set<AeoSectionId>;
  onToggle: (id: AeoSectionId) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" role="group" aria-label="Choose which sections to show">
      <span className="mr-1 text-xs font-medium text-muted-foreground">Show :</span>
      {AEO_SECTIONS.map((section) => {
        const shown = !hidden.has(section.id);
        const Icon = shown ? Eye : EyeOff;
        return (
          <motion.button
            key={section.id}
            type="button"
            aria-pressed={shown}
            onClick={() => onToggle(section.id)}
            whileTap={reduced ? undefined : { scale: 0.96 }}
            transition={SPRING_PRESS}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring',
              shown
                ? 'bg-foreground text-background'
                : 'bg-tint text-muted-foreground hover:text-foreground'
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={shown ? 'on' : 'off'}
                initial={reduced ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={reduced ? undefined : { scale: 0.5, opacity: 0 }}
                transition={SPRING_SWAP}
                className="flex"
              >
                <Icon className="size-3.5" aria-hidden />
              </motion.span>
            </AnimatePresence>
            {section.label}
          </motion.button>
        );
      })}
    </div>
  );
}
