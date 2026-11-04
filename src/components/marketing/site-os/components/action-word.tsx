"use client";

import { useRef, useState } from "react";
import { useWordHover, useWordLoop } from "./use-word-loop";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from "motion/react";

const ACCENT = "var(--priority)";
const ACCENT_FG = "var(--priority-foreground)";

const STEPS = ["Prioritise", "Assign", "Ship fix", "Shipped"];

type Ripple = { id: number; x: number; y: number };

/**
 * "action" word in the hero heading. Hovering turns the insight into action:
 * an underline draws in, the word lunges forward, a pipeline tag steps
 * Prioritise → Assign → Ship fix → Shipped, and clicking sends out ripples.
 */
export function ActionWord({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [step, setStep] = useState(0);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const nextId = useRef(0);
  const progress = useMotionValue(0);

  useMotionValueEvent(progress, "change", (v) =>
    setStep(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))),
  );

  const addRipple = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = nextId.current++;
    setRipples((rs) => [...rs, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
  };

  // Idle loop: each cycle also fires a ripple from the word's centre.
  const reportHover = useWordHover("action");
  const wordRef = useRef<HTMLSpanElement>(null);
  const loopOn = useWordLoop("action", progress, () => {
    const el = wordRef.current;
    if (!el) return;
    const id = nextId.current++;
    setRipples((rs) => [...rs, { id, x: el.offsetWidth / 2, y: el.offsetHeight / 2 }]);
  });
  const show = hovered || loopOn;

  const done = step === STEPS.length - 1;

  return (
    <motion.span
      ref={wordRef}
      className="relative inline-block cursor-pointer align-baseline"
      onHoverStart={() => {
        // Hover stops the idle loop and holds the finished state.
        setHovered(true);
        reportHover(true);
        progress.set(1);
      }}
      onHoverEnd={() => {
        setHovered(false);
        reportHover(false);
      }}
      onMouseDown={addRipple}
      animate={{ x: hovered && !reduce ? 4 : 0 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={{ type: "spring", stiffness: 800, damping: 28 }}
    >
      <motion.span
        className="relative z-10"
        animate={{ color: show ? ACCENT : "inherit" }}
        transition={{ duration: 0.12 }}
      >
        {children}
      </motion.span>

      {/* underline draws in */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[0.02em] h-[3px] origin-left rounded-full"
        style={{ background: ACCENT }}
        initial={false}
        animate={{ scaleX: show ? 1 : 0, opacity: show ? 1 : 0 }}
        transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* ripples from the click point */}
      <span aria-hidden className="pointer-events-none absolute inset-0 z-0">
        <AnimatePresence>
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              className="absolute size-10 rounded-full"
              style={{ left: r.x, top: r.y, x: "-50%", y: "-50%", border: `2px solid ${ACCENT}` }}
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              onAnimationComplete={() =>
                setRipples((rs) => rs.filter((x) => x.id !== r.id))
              }
            />
          ))}
        </AnimatePresence>
      </span>

      <AnimatePresence>
        {show && (
          <>
            {/* arrow badge shoots out of the top-right corner */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute z-20 grid size-6 place-items-center rounded-full"
              style={{ background: ACCENT, color: ACCENT_FG, left: "100%", top: "50%", marginLeft: 8, marginTop: -12 }}
              initial={{ opacity: 0, scale: 0, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 800, damping: 22 }}
            >
              <motion.svg
                viewBox="0 0 12 12"
                className="size-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={reduce ? undefined : { x: [0, 1.5, 0], y: [0, -1.5, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
              >
                <path d="M3 9 9 3M4.5 3H9v4.5" />
              </motion.svg>
            </motion.span>

            {/* pipeline tag above the word */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute top-full left-1/2 z-30 mt-1 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 font-sans text-[11px] font-medium leading-none tracking-normal"
              style={{ background: ACCENT, color: ACCENT_FG }}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              <span className="flex items-center gap-0.5">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    className="h-1 w-2.5 rounded-full bg-current transition-opacity duration-100"
                    style={{ opacity: i <= step ? 1 : 0.3 }}
                  />
                ))}
              </span>
              {done ? (
                <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <motion.path
                    d="M2.5 6.5 5 9l4.5-5.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                </svg>
              ) : null}
              {STEPS[step]}
            </motion.span>
          </>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
