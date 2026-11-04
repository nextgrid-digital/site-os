"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loop clock for a demo tile. Ticks only while the tile is on screen, so
 * offscreen tiles don't keep timers running. Animations keyed on `cycle` replay.
 */
export function useLoop(ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), ms);
    return () => window.clearInterval(id);
  }, [inView, ms]);

  return { ref, cycle };
}
