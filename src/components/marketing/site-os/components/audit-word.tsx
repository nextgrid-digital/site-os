"use client";

import { useState } from "react";
import { useWordHover, useWordLoop } from "./use-word-loop";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

const FRAME = "var(--success)";
const FRAME_FG = "var(--success-foreground)";
const FRAME_TINT = "color-mix(in oklch, var(--success) 10%, transparent)";
const CHECKS = [
  "Crawling pages",
  "Checking schema",
  "Scoring AI readiness",
  "Audit complete",
];

const HANDLES = [
  "-left-1 -top-0.5 -translate-x-1/2 -translate-y-1/2",
  "-right-1 -top-0.5 translate-x-1/2 -translate-y-1/2",
  "-left-1 -bottom-0.5 -translate-x-1/2 translate-y-1/2",
  "-right-1 -bottom-0.5 translate-x-1/2 translate-y-1/2",
] as const;

/**
 * "audits" word in the hero heading. On hover a Figma-style selection frame
 * snaps around it, a scan line sweeps across, and a cursor chip follows the
 * mouse while a checklist ticks through to "Audit complete".
 */
export function AuditWord({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [step, setStep] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 800, damping: 45 });
  const sy = useSpring(y, { stiffness: 800, damping: 45 });
  const progress = useMotionValue(0);
  const pct = useTransform(progress, (v) => `${v * 100}%`);

  // Drive the checklist from scan progress so label and line stay in sync.
  useMotionValueEvent(progress, "change", (v) =>
    setStep(Math.min(CHECKS.length - 1, Math.floor(v * CHECKS.length))),
  );

  const reportHover = useWordHover("audit");
  const loopOn = useWordLoop("audit", progress);
  const show = hovered || loopOn;

  return (
    <motion.span
      className="relative inline-block cursor-default align-baseline"
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
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
    >
      <motion.span
        className="relative z-10"
        animate={{ color: show ? FRAME : "inherit" }}
        transition={{ duration: 0.12 }}
      >
        {children}
      </motion.span>

      <AnimatePresence>
        {show && (
          <>
            {/* selection frame */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute -inset-x-1 -inset-y-0.5 z-0 overflow-hidden"
              style={{ border: `2px solid ${FRAME}`, background: FRAME_TINT }}
              initial={{ opacity: 0, scale: 1.12 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 700, damping: 32 }}
            >
              {!reduce && !hovered && (
                <motion.span
                  className="absolute inset-y-0 w-0.5"
                  style={{
                    left: pct,
                    background: FRAME,
                    boxShadow: `0 0 12px 2px ${FRAME}`,
                  }}
                />
              )}
            </motion.span>

            {/* corner handles */}
            {HANDLES.map((pos, i) => (
              <motion.span
                key={pos}
                aria-hidden
                className={`pointer-events-none absolute z-20 size-[7px] border-2 bg-white ${pos}`}
                style={{ borderColor: FRAME }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: reduce ? 0 : i * 0.02, type: "spring", stiffness: 800, damping: 28 }}
              />
            ))}

            {/* dimension / status tag */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-1/2 bottom-full z-30 mb-3 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 font-sans text-[11px] font-medium leading-none tracking-normal "
              style={{ background: FRAME, color: FRAME_FG }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
            >
              <span
                className="inline-grid size-3 place-items-center rounded-full bg-black/15"
                data-done={step === CHECKS.length - 1}
              >
                {step === CHECKS.length - 1 ? (
                  <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="currentColor" strokeWidth="2">
                    <motion.path
                      d="M2.5 6.5 5 9l4.5-5.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.25 }}
                    />
                  </svg>
                ) : (
                  <motion.span
                    className="size-1.5 rounded-full bg-current"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  />
                )}
              </span>
              {CHECKS[step]}
            </motion.span>

            {/* cursor chip following the mouse */}
            {hovered && !reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-40"
                style={{ x: sx, y: sy }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill={FRAME} stroke="white" strokeWidth="1.5">
                  <path d="M1 1l5.5 13 2-5.5L14 6.5z" />
                </svg>
                <span
                  className="ml-3 -mt-0.5 block w-fit rounded-full px-2 py-0.5 font-sans text-[10px] font-medium leading-none tracking-normal "
                  style={{ background: FRAME, color: FRAME_FG }}
                >
                  crawler
                </span>
              </motion.span>
            )}
          </>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
