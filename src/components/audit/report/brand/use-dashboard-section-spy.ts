'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { PreviewRailItem } from '@/components/motion/preview-rail';

export const DASHBOARD_RAIL_ITEMS: PreviewRailItem[] = [
  {
    id: 'overview',
    label: 'KPIs',
    description: 'Impressions → clicks → sessions → GA4 conversions.',
    href: '#overview',
  },
  {
    id: 'channels',
    label: 'Channels',
    description: 'Traffic quality and GA4 conversions by source.',
    href: '#channels',
  },
  {
    id: 'pages',
    label: 'Pages & queries',
    description: 'Which pages and searches bring visitors, and do they convert?',
    href: '#pages',
  },
  {
    id: 'ads',
    label: 'Ads',
    description: 'Paid entry and waste on the same funnel.',
    href: '#ads',
  },
  {
    id: 'funnel',
    label: 'Funnels',
    description: 'GA4 visit → engaged → conversion drops.',
    href: '#funnel',
  },
  {
    id: 'issues',
    label: 'Issues',
    description: 'Chain breaks and paid mismatches.',
    href: '#issues',
  },
];

const XL_QUERY = '(min-width: 80rem)';

/** True at the xl breakpoint, where the side rail replaces the mobile tabs. */
export function useIsDesktopNav() {
  return useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(XL_QUERY);
      mql.addEventListener('change', notify);
      return () => mql.removeEventListener('change', notify);
    },
    () => window.matchMedia(XL_QUERY).matches,
    () => false
  );
}

const VALID_IDS = new Set(DASHBOARD_RAIL_ITEMS.map((item) => item.id));

/**
 * Tracks which dashboard section is in view and exposes a click handler that keeps the
 * clicked item active while the page scrolls. Shared by the desktop rail and mobile tabs.
 */
export function useDashboardSectionSpy(enabled = true) {
  const [activeId, setActiveId] = useState('overview');
  // After a click the page is mid-scroll; let the clicked item stay active until it settles.
  const lockUntil = useRef(0);

  const selectSection = useCallback((id: string, scroll: boolean) => {
    lockUntil.current = Date.now() + 1000;
    setActiveId(id);
    if (!scroll) return;
    document
      .querySelector<HTMLElement>(`section#${id}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(window.history.state, '', `#${id}`);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    function syncFromHash() {
      const id = window.location.hash.replace(/^#/, '');
      if (VALID_IDS.has(id)) setActiveId(id);
    }
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [enabled]);

  // Sections mount after data loads, so the browser's own #hash scroll misses on refresh.
  useEffect(() => {
    if (!enabled) return;
    const id = window.location.hash.replace(/^#/, '');
    if (!VALID_IDS.has(id)) return;
    let tries = 0;
    let frame = 0;
    function jump() {
      const el = document.querySelector<HTMLElement>(`section#${id}`);
      if (el) {
        el.scrollIntoView({ block: 'start' });
        return;
      }
      if (tries++ < 120) frame = requestAnimationFrame(jump);
    }
    jump();
    return () => cancelAnimationFrame(frame);
  }, [enabled]);

  // Scroll-spy. Sections mount after data loads, so the element list is refreshed on a
  // short bounded poll (not a body-wide MutationObserver, which would fire on every
  // chart hover). Scroll work is rAF-throttled and only reads a handful of rects.
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    let els: HTMLElement[] = [];
    function refresh() {
      // `section#id` on purpose: other mounted tabs reuse ids (e.g. a form control with
      // id="ads"), and a plain getElementById would grab that hidden node instead.
      els = DASHBOARD_RAIL_ITEMS.map((item) =>
        document.querySelector<HTMLElement>(`section#${item.id}`)
      ).filter((el): el is HTMLElement => Boolean(el));
    }
    function update() {
      frame = 0;
      if (Date.now() < lockUntil.current) {
        frame = requestAnimationFrame(update);
        return;
      }
      if (els.some((el) => !el.isConnected)) refresh();
      const line = window.innerHeight * 0.3;
      let current: string | null = null;
      for (const el of els) {
        // Hidden panels have no layout boxes and would otherwise report top = 0.
        if (el.getClientRects().length === 0) continue;
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      if (current) setActiveId(current);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    refresh();
    schedule();
    let polls = 0;
    const poll = window.setInterval(() => {
      const before = els.length;
      refresh();
      if (els.length !== before) schedule();
      if (els.length === DASHBOARD_RAIL_ITEMS.length || ++polls >= 20) {
        window.clearInterval(poll);
      }
    }, 500);
    // Capture phase: the app may scroll inside a container, and scroll events don't bubble.
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(poll);
      document.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
    };
  }, [enabled]);

  return { activeId, selectSection };
}
