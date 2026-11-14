"use client";

import { createContext, createElement, useContext, useEffect, useState } from "react";
import { animate, type MotionValue } from "motion/react";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type WordId = "audit" | "action";
const ORDER: WordId[] = ["audit", "action"];
const RUN_MS = 900 + 1000; // scan + hold on the finished state

type Ctx = {
  active: WordId | null;
  setHovered: (id: WordId, hovered: boolean) => void;
};
const SequenceContext = createContext<Ctx>({ active: null, setHovered: () => {} });

/**
 * Plays the heading words one after another: audit → action → audit → …
 * Pauses entirely while either word is hovered, and does not run under
 * reduced motion.
 */
export function WordSequence({
  children,
  reduce,
}: {
  children: React.ReactNode;
  reduce: boolean | null;
}) {
  const [active, setActive] = useState<WordId | null>(null);
  const [hoveredId, setHoveredId] = useState<WordId | null>(null);
  const paused = hoveredId !== null || !!reduce;

  useEffect(() => {
    if (paused) return;
    let cancelled = false;
    (async () => {
      await sleep(600);
      while (!cancelled) {
        // audit plays and stays on screen, action plays on top, then both clear.
        for (const id of ORDER) {
          if (cancelled) return;
          setActive(id);
          await sleep(RUN_MS);
        }
        if (cancelled) return;
        setActive(null);
        await sleep(1000);
      }
    })();
    return () => {
      cancelled = true;
      setActive(null);
    };
  }, [paused]);

  return createElement(
    SequenceContext.Provider,
    {
      value: {
        active,
        setHovered: (id, h) => setHoveredId((cur) => (h ? id : cur === id ? null : cur)),
      },
    },
    children,
  );
}

/**
 * Idle loop state for one word. `on` is true while the word is showing: during
 * its own turn, and for "audit" also while "action" plays (it stays put).
 */
export function useWordLoop(id: WordId, progress: MotionValue<number>, onStart?: () => void) {
  const { active } = useContext(SequenceContext);
  const [on, setOn] = useState(false);
  const running = active === id;
  const visible = running || (id === "audit" && active === "action");

  useEffect(() => {
    if (!visible) return;
    setOn(true);
    return () => setOn(false);
  }, [visible]);

  useEffect(() => {
    if (!running) return;
    progress.set(0);
    onStart?.();
    const controls = animate(progress, 1, { duration: 0.9, ease: "linear" });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, progress]);

  return on;
}

export function useWordHover(id: WordId) {
  return useContext(SequenceContext).setHovered.bind(null, id);
}
