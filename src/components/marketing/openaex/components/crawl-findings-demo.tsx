"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { useLoop } from "./use-loop";

type Trend = "up" | "down";

type Metric = {
  id: string;
  label: string;
  delta: string;
  trend: Trend;
  /** Final number shown. */
  value: number;
  /** Number the race starts from: same digit count as `value`, below it for up, above for down. */
  from: number;
};

const METRICS: Metric[] = [
  { id: "visitors", label: "Visitors", delta: "+18.4%", trend: "up", value: 47, from: 12 },
  { id: "revenue", label: "Revenue", delta: "−5.1%", trend: "down", value: 82, from: 98 },
];

/** Counter and line share one clock so the line finishes drawing as the digits land. */
const DURATION = 1.2;
const LOOP_MS = 5200;

const UP: [number, number][] = [[0, 22], [8, 19], [15, 21], [23, 13], [31, 15], [40, 7], [48, 9], [56, 2], [64, 3]];
const DOWN: [number, number][] = UP.map(([x, y]) => [x, 24 - y]);

const toLine = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

const TONE: Record<Trend, string> = { up: "text-emerald-400", down: "text-red-400" };
/** Both tiles keep their border on hover and glow in their trend colour with a shadow instead. */
const HOVER: Record<Trend, string> = {
  up: "hover:shadow-[0_0_0_1px_rgb(52_211_153/0.45),0_6px_20px_-6px_rgb(52_211_153/0.4)]",
  down: "hover:shadow-[0_0_0_1px_rgb(248_113_113/0.45),0_6px_20px_-6px_rgb(248_113_113/0.4)]",
};

function Sparkline({ trend }: { trend: Trend }) {
  const reduce = useReducedMotion();
  const gradId = useId();
  const pts = trend === "up" ? UP : DOWN;
  const line = toLine(pts);
  const area = `${line} L64 28 L0 28 Z`;
  const [ex, ey] = pts[pts.length - 1];

  return (
    <svg viewBox="0 0 64 28" aria-hidden="true" className={cn("h-7 w-16 shrink-0 overflow-visible", TONE[trend])}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d={area}
        fill={`url(#${gradId})`}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DURATION, ease: EASE_OUT }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DURATION, ease: EASE_OUT }}
      />
      <motion.circle
        cx={ex}
        cy={ey}
        r={2.25}
        fill="currentColor"
        initial={reduce ? false : { opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: DURATION * 0.85, duration: 0.3, ease: EASE_OUT }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />
    </svg>
  );
}

/** Mounts showing `from`, then moves to `value` so the counter races in the right direction. */
function Racer({ from, value }: { from: number; value: number }) {
  const [shown, setShown] = useState(from);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(value));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return <SpeedCounter value={shown} duration={DURATION} spins={1} blur={5} locale="en-US" />;
}

/** Visitors and revenue race to their numbers and draw their trend, on a loop. */
export function CrawlFindingsDemo() {
  const { ref, cycle, hold, replay, bind } = useLoop(LOOP_MS);

  return (
    <div ref={ref} {...bind} className="flex w-full max-w-sm gap-2">
      {METRICS.map((m) => (
        <button
          type="button"
          key={m.id}
          onClick={() => {
            hold();
            replay();
          }}
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer flex-col justify-between gap-3 rounded-[14px] border border-solid border-surface bg-surface-3 p-2.5 text-left text-xs leading-4 transition-[color,background-color,border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none",
            HOVER[m.trend],
          )}
        >
          <span className="flex min-w-0 items-baseline justify-between gap-1 text-[0.6875rem] font-medium leading-4">
            <span className="min-w-0 truncate text-muted-foreground">{m.label}</span>
            <span className={cn("shrink-0", TONE[m.trend])}>{m.delta}</span>
          </span>
          <span className="flex items-end justify-between gap-1">
            <span className="text-base font-medium leading-5 tracking-[-0.4px]" key={`count-${cycle}`}>
              <Racer from={m.from} value={m.value} />
            </span>
            <Sparkline key={`spark-${cycle}`} trend={m.trend} />
          </span>
        </button>
      ))}
    </div>
  );
}
