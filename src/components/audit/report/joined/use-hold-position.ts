"use client";

import { useCallback, useRef } from "react";

/** Distance kept below the app header when a collapsing card has to be pulled back into view. */
const HEADER_CLEARANCE = 96;

function findScroller(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node;
    }
  }
  return null; // the page itself scrolls
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Stops the page from jumping when an accordion collapses. The collapsing body shrinks the page,
 * which would drag whatever you were looking at out from under you. `hold()` keeps the card's
 * header where it is on screen for the length of the animation, and if the header was already
 * scrolled out of view it glides back to just under the app header in step with the collapse.
 */
export function useHoldPosition<T extends HTMLElement>(durationMs = 320) {
  const ref = useRef<T>(null);

  const hold = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const scroller = findScroller(el);
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    const write = (value: number) => {
      if (scroller) scroller.scrollTop = value;
      else window.scrollTo({ top: value });
    };

    const scrollerTop = scroller ? scroller.getBoundingClientRect().top : 0;
    const startTop = el.getBoundingClientRect().top - scrollerTop;
    const startScroll = read();
    // Header position within the scrolled content; its own body sits below it, so this is stable.
    const contentTop = startTop + startScroll;
    const endTop = startTop < HEADER_CLEARANCE ? HEADER_CLEARANCE : startTop;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const began = performance.now();

    const frame = (now: number) => {
      const progress = reduce ? 1 : Math.min(1, (now - began) / durationMs);
      const top = startTop + (endTop - startTop) * easeOut(progress);
      write(Math.max(0, contentTop - top));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [durationMs]);

  return { ref, hold };
}
