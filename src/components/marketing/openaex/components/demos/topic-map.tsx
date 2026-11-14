"use client";

import { useState } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, LOCALE, PANEL } from "./kit";

/** Topic map: uncovered topics light up as the next pages get written. Click a topic to toggle it. */
const TOPICS = [
  { label: "Pricing", covered: true },
  { label: "Integrations", covered: true },
  { label: "Case studies", covered: false },
  { label: "Security", covered: false },
];

export const ProductTopicMap = () => {
  const { ref, cycle, hold, bind } = useLoop(3600);
  // A manual choice only counts for the loop tick it was made in, so the loop takes over after idle.
  const [manual, setManual] = useState<{ cycle: number; on: boolean[] } | null>(null);
  const filled = cycle % 2 === 1;
  const auto = TOPICS.map((t) => t.covered || filled);
  const on = manual && manual.cycle === cycle ? manual.on : auto;
  const missing = on.filter((v) => !v).length;

  return (
    <div ref={ref} {...bind} className={PANEL}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">Topic map</span>
        <span className="font-medium tabular-nums">
          {missing ? (
            <>
              <SpeedCounter
                value={missing}
                duration={0.5}
                spins={0}
                blur={0}
                locale={LOCALE}
              />{" "}
              missing
            </>
          ) : (
            <span className="text-primary">All covered</span>
          )}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-1.5 [list-style-type:none]">
        {TOPICS.map((t, i) => (
          <li key={t.label}>
            <button
              type="button"
              aria-pressed={on[i]}
              onClick={() => {
                hold();
                setManual({ cycle, on: on.map((v, j) => (j === i ? !v : v)) });
              }}
              className={cn(
                "flex w-full cursor-pointer items-center gap-1.5 rounded-lg border border-solid px-2 py-1.5 text-left transition-colors duration-500 hover:border-primary/60",
                FOCUS,
                on[i]
                  ? "border-surface bg-background"
                  : "border-dashed border-red-400/50 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full transition-colors duration-500",
                  on[i] ? "bg-primary" : "bg-red-400",
                )}
              />
              {t.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
