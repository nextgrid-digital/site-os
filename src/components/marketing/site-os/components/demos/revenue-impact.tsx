"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, LOCALE, MUTED, PANEL, ROW_HOVER } from "./kit";

/** Revenue impact: each issue's score fills its bar and counts up. Click an issue to see what it costs. */
const ISSUES = [
  { label: "Missing proof on /pricing", tag: "Critical", score: 92, tone: "text-red-400", est: "≈ $4.1k/mo" },
  { label: "No CTA above the fold on /", tag: "High", score: 74, tone: "text-amber-400", est: "≈ $2.6k/mo" },
  { label: "Weak H1 on /features", tag: "Medium", score: 48, tone: MUTED, est: "≈ $0.9k/mo" },
];

/** Remounted per loop via `key`, so the selection resets with the animation. */
function IssueList({ hold }: { hold: () => void }) {
  const [sel, setSel] = useState<number | null>(null);
  return (
    <ul className="flex flex-col gap-1.5 [list-style-type:none]">
      {ISSUES.map((issue, i) => {
        const on = sel === i;
        return (
          <li key={issue.label}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => {
                hold();
                setSel(on ? null : i);
              }}
              className={cn(
                "relative w-full overflow-hidden rounded-lg border border-solid bg-background px-2.5 py-2",
                ROW_HOVER,
                FOCUS,
                on ? "border-primary" : "border-surface",
              )}
            >
              <motion.div
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 w-full origin-left transition-colors duration-300",
                  on ? "bg-primary/25" : "bg-color-001/15",
                )}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: issue.score / 100 }}
                transition={{ delay: 0.3 + i * 0.18, duration: 0.9, ease: EASE_OUT }}
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className="min-w-0 truncate">{issue.label}</span>
                <span className="flex shrink-0 items-baseline gap-1.5 text-[0.6875rem] tabular-nums">
                  {on ? (
                    <span className="font-medium text-primary">{issue.est}</span>
                  ) : (
                    <>
                      <span className={issue.tone}>{issue.tag}</span>
                      <span className="font-medium">
                        <SpeedCounter
                          value={issue.score}
                          animateOnMount
                          duration={0.9}
                          spins={0}
                          blur={0}
                          locale={LOCALE}
                        />
                        <span className={MUTED}>/100</span>
                      </span>
                    </>
                  )}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export const ProductRevenueImpact = () => {
  const { ref, cycle, hold, bind } = useLoop(6000);
  return (
    <div ref={ref} {...bind} className={PANEL}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">Revenue impact</span>
        <span className="font-medium text-primary tabular-nums">
          <SpeedCounter
            key={cycle}
            value={34}
            animateOnMount
            duration={0.9}
            spins={0}
            blur={0}
            locale={LOCALE}
          />
          %<span className={cn("ml-1 font-normal", MUTED)}>at risk</span>
        </span>
      </div>
      <IssueList key={cycle} hold={hold} />
    </div>
  );
};
