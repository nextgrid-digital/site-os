"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { GeminiIcon } from "@/components/icons";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, LOCALE, MUTED, MacWindow, ROW_HOVER, WIDE, useStep } from "./kit";

/**
 * AI answer readiness, wide: the scanner reads the page and the score ring fills
 * as each check lands. Then an assistant answers a buyer question and cites the page.
 * Click a check to jump the scan there, or the answer to see the cited result.
 */
const PAGE_LINE_WIDTHS = ["88%", "62%", "92%", "74%", "84%", "58%"];
const READINESS_CHECKS = [
  { label: "Direct answer", ok: true, line: 0 },
  { label: "FAQ schema", ok: false, line: 2 },
  { label: "Author and date", ok: true, line: 4 },
];
/** Score after each check lands. Index 0 is before any check. */
const READINESS_SCORES = [0, 34, 51, 68];
const LINE_PITCH = 16;
const ANSWER_WORDS = "Acme is a CRM built for small agencies, with client reporting included.".split(" ");
const LAST_STEP = 5;

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="relative size-14 shrink-0">
      <svg viewBox="0 0 40 40" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-surface-4" />
        <motion.circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-primary"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: score / 100 }}
          transition={{ duration: 0.8, ease: EASE_OUT }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums">
        <SpeedCounter value={score} duration={0.8} spins={0} blur={0} locale={LOCALE} />
      </span>
    </div>
  );
}

function ReadinessBody({ held, hold }: { held: boolean; hold: () => void }) {
  // 1-3: checks land · 4: the assistant answers · 5: it cites the page.
  const [step, goTo] = useStep(LAST_STEP, 800, held);
  const scanLine = step >= READINESS_CHECKS.length ? 5 : (READINESS_CHECKS[step]?.line ?? 0);
  const score = READINESS_SCORES[Math.min(step, READINESS_CHECKS.length)];
  const answering = step >= 4;
  const cited = step >= 5;

  return (
    <div className="flex h-full flex-col gap-3 @sm:flex-row">
      <MacWindow url="example.com/pricing" className="w-full @sm:w-[38%]">
        <div className="relative flex flex-col gap-2 overflow-hidden">
          <motion.div
            aria-hidden="true"
            className="absolute right-0 left-0 rounded-sm bg-color-001/20"
            style={{ height: LINE_PITCH + 2 }}
            animate={{ top: scanLine * LINE_PITCH - 3, opacity: answering ? 0 : 1 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          />
          {PAGE_LINE_WIDTHS.map((w, i) => (
            <div key={i} className="relative flex h-2 items-center">
              <span
                className={cn(
                  "h-1.5 rounded-full transition-colors duration-500",
                  cited && i <= 1 ? "bg-primary/60" : "bg-surface-4",
                )}
                style={{ width: w }}
              />
            </div>
          ))}
        </div>
      </MacWindow>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex items-center gap-3">
          <ScoreRing score={score} />
          <ul className="flex min-w-0 flex-1 flex-col [list-style-type:none]">
            {READINESS_CHECKS.map((c, i) => {
              const shown = step > i;
              return (
                <li key={c.label}>
                  <button
                    type="button"
                    onClick={() => {
                      hold();
                      goTo(i + 1);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-md border border-solid border-transparent px-1.5 py-0.5 text-[0.6875rem]",
                      ROW_HOVER,
                      FOCUS,
                    )}
                  >
                    <span className="truncate">{c.label}</span>
                    <span
                      className={cn(
                        "transition-colors duration-500",
                        !shown ? MUTED : c.ok ? "text-primary" : "text-red-400",
                      )}
                    >
                      {!shown ? "…" : c.ok ? "Pass" : "Fix"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => {
            hold();
            goTo(LAST_STEP);
          }}
          className={cn(
            "rounded-lg border border-solid border-surface bg-background px-2.5 py-1.5",
            ROW_HOVER,
            FOCUS,
          )}
        >
          <span className="mb-0.5 flex items-center justify-between gap-2 text-[0.6875rem]">
            <span className={cn("flex min-w-0 items-center gap-1", MUTED)}>
              <GeminiIcon className="size-3 shrink-0" aria-hidden="true" />
              <span className="truncate">AI answer</span>
            </span>
            {cited && (
              <motion.span
                className="flex shrink-0 items-center gap-1 rounded-md border border-solid border-primary/40 bg-primary/10 px-1.5 text-[0.625rem] text-primary"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <Check className="size-2.5" aria-hidden="true" />
                Cited: example.com
              </motion.span>
            )}
          </span>
          <span className="block min-h-8 text-[0.6875rem] leading-4">
            {answering ? (
              ANSWER_WORDS.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.07, duration: 0.2 }}
                >
                  {word}{" "}
                </motion.span>
              ))
            ) : (
              <span className={cn("animate-pulse", MUTED)}>Reading example.com/pricing…</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

export const ProductAnswerReadiness = () => {
  const { ref, cycle, held, hold, bind } = useLoop(7500);
  return (
    <div ref={ref} {...bind} className={WIDE}>
      <ReadinessBody key={cycle} held={held} hold={hold} />
    </div>
  );
};
