"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long a tile stays put after the visitor last touched it. */
const IDLE_MS = 6000;

/**
 * Loop clock for a demo tile. Ticks only while the tile is on screen, so
 * offscreen tiles don't keep timers running. Animations keyed on `cycle` replay.
 *
 * Interaction: hovering or pressing the tile pauses the loop (`held`). It
 * resumes `IDLE_MS` after the pointer leaves or the last click. Spread `bind`
 * on the root element and call `hold()` from click handlers.
 */
export function useLoop(ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [cycle, setCycle] = useState(0);
  const [held, setHeld] = useState(false);
  const hovering = useRef(false);
  const idleTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || held) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), ms);
    return () => window.clearInterval(id);
  }, [inView, held, ms]);

  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  const release = useCallback(() => {
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setHeld(false), IDLE_MS);
  }, []);

  /** Pause now; resume after IDLE_MS with no further interaction (never while hovering). */
  const hold = useCallback(() => {
    setHeld(true);
    if (!hovering.current) release();
  }, [release]);

  /** Restart the current loop iteration from the top. */
  const replay = useCallback(() => setCycle((c) => c + 1), []);

  const bind = {
    onPointerEnter: () => {
      hovering.current = true;
      window.clearTimeout(idleTimer.current);
      setHeld(true);
    },
    onPointerLeave: () => {
      hovering.current = false;
      release();
    },
  };

  return { ref, cycle, held, hold, replay, bind };
}
