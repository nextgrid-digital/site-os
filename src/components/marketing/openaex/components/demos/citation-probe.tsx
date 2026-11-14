"use client";

import { motion } from "motion/react";
import { Check, MousePointer2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, MUTED, PANEL, ROW_HOVER } from "./kit";

/**
 * Citation probe: a buyer question is typed, checked, and one competitor-only
 * result is missed. Click Check or any result to run it again.
 */
const QUERY = "crm for small agencies";
const RESULTS = [
  { q: "best crm for small agencies", cited: true },
  { q: "crm with client reporting", cited: false },
  { q: "how to choose an agency crm", cited: true },
];

/** Types `QUERY` out one character at a time. Remounted per loop via `key`, so it restarts from empty. */
function TypedQuery() {
  const [typed, setTyped] = useState(0);
  useEffect(() => {
    if (typed >= QUERY.length) return;
    const id = window.setTimeout(() => setTyped(typed + 1), 70);
    return () => window.clearTimeout(id);
  }, [typed]);
  return (
    <span className="min-w-0 flex-1 truncate">
      {QUERY.slice(0, typed)}
      <span className="ml-px inline-block h-3 w-px translate-y-0.5 animate-pulse bg-foreground" />
    </span>
  );
}

export const ProductCitationProbe = () => {
  const { ref, cycle, hold, replay, bind } = useLoop(7000);
  const rerun = () => {
    hold();
    replay();
  };

  return (
    <div ref={ref} {...bind} className={cn(PANEL, "relative overflow-hidden")}>
      <div className="mb-2 flex h-7 items-center gap-2 rounded-lg border border-solid border-surface bg-background pr-1 pl-2.5">
        <Search className={cn("size-3.5 shrink-0", MUTED)} aria-hidden="true" />
        <TypedQuery key={cycle} />
        <motion.button
          type="button"
          key={`btn-${cycle}`}
          onClick={rerun}
          className={cn(
            "cursor-pointer rounded-md bg-primary px-2 py-0.5 text-[0.6875rem] font-medium text-background transition-opacity hover:opacity-85",
            FOCUS,
          )}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 0.92, 1] }}
          transition={{ delay: 2.6, duration: 0.3 }}
        >
          Check
        </motion.button>
      </div>
      <div key={cycle} className="flex flex-col gap-1.5">
        {RESULTS.map((r, i) => (
          <motion.button
            type="button"
            key={r.q}
            onClick={rerun}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg border border-solid border-surface bg-background px-2.5 py-1.5",
              ROW_HOVER,
              FOCUS,
            )}
            initial={{ opacity: 0, y: 6 }}
            animate={
              r.cited
                ? { opacity: 1, y: 0 }
                : { opacity: 1, y: 0, x: [0, -5, 0, 0] }
            }
            transition={{
              opacity: { delay: 3 + i * 0.3, duration: 0.35, ease: EASE_OUT },
              y: { delay: 3 + i * 0.3, duration: 0.35, ease: EASE_OUT },
              x: { delay: 4.4, duration: 0.5, ease: "easeInOut" },
            }}
          >
            <span className="min-w-0 truncate">{r.q}</span>
            <motion.span
              className={cn(
                "flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium",
                r.cited ? "text-primary" : "text-red-400",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.6 + i * 0.3, duration: 0.3 }}
            >
              {r.cited ? (
                <Check className="size-3" aria-hidden="true" />
              ) : (
                <X className="size-3" aria-hidden="true" />
              )}
              {r.cited ? "Cited" : "Missed"}
            </motion.span>
          </motion.button>
        ))}
      </div>
      <motion.span
        key={`cursor-${cycle}`}
        className="pointer-events-none absolute top-0 left-0 text-foreground"
        initial={{ left: "55%", top: 150, opacity: 0 }}
        animate={{ left: "78%", top: 14, opacity: [0, 1, 1, 0] }}
        transition={{
          delay: 1.6,
          duration: 2.4,
          ease: EASE_OUT,
          times: [0, 0.2, 0.9, 1],
        }}
      >
        <MousePointer2 className="size-4 fill-foreground" aria-hidden="true" />
      </motion.span>
    </div>
  );
};
