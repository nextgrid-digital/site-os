"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOUR_LABELS: Record<number, string> = { 0: "0", 3: "3", 6: "6", 9: "9", 12: "12", 15: "15", 18: "18", 21: "21" };

/** Events per UTC hour, Sunday first. */
const DEMO_EVENTS = [
  [3, 4, 4, 0, 2, 0, 2, 3, 0, 2, 2, 0, 0, 1, 4, 0, 3, 0, 1, 3, 1, 4, 3, 2],
  [1, 1, 4, 3, 1, 0, 0, 2, 1, 0, 0, 3, 2, 2, 4, 1, 3, 2, 1, 1, 2, 0, 1, 2],
  [3, 1, 1, 0, 2, 3, 0, 2, 0, 1, 1, 2, 2, 2, 9, 9, 7, 14, 9, 6, 12, 12, 11, 11],
  [13, 16, 9, 9, 9, 9, 12, 8, 13, 13, 17, 13, 19, 62, 0, 3, 0, 5, 0, 0, 0, 0, 0, 3],
  [1, 5, 6, 0, 1, 0, 3, 0, 2, 2, 7, 1, 1, 1, 3, 1, 1, 0, 1, 1, 2, 4, 1, 0],
  [1, 2, 2, 2, 1, 4, 2, 1, 3, 3, 1, 1, 5, 3, 4, 1, 0, 1, 0, 1, 0, 3, 1, 1],
  [2, 1, 2, 1, 6, 2, 2, 0, 2, 3, 0, 2, 1, 3, 2, 0, 1, 2, 0, 2, 3, 1, 3, 2],
];

const opacityFor = (events: number, max: number) =>
  events === 0 ? 1 : events === max ? 1 : 0.15 + (events / max) * 0.85;

const CELL = "block w-full min-w-0 aspect-square border border-solid border-border rounded-[3px] sm:rounded-md";

/**
 * Interactive hour-by-weekday heatmap. Defaults to the landing demo data;
 * pass `events` (7 rows, Sunday first x 24 hours) to render live data.
 */
export default function ConversionPeakHeatmap({
  events: matrix = DEMO_EVENTS,
  unit = ["event", "events"],
  tz = "UTC",
}: {
  events?: number[][];
  unit?: [string, string];
  tz?: string;
}) {
  const EVENTS = matrix;
  const tzSuffix = tz ? ` ${tz}` : "";
  const MAX = Math.max(...EVENTS.flat(), 1);
  let peak = { d: 0, h: 0 };
  EVENTS.forEach((row, d) => row.forEach((v, h) => { if (v > EVENTS[peak.d][peak.h]) peak = { d, h }; }));
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [active, setActive] = useState<{ d: number; h: number } | null>(null);
  const count = active ? EVENTS[active.d][active.h] : null;

  return (
    <div
      ref={ref}
      className="grid w-full min-w-0 gap-px sm:gap-0.5 text-muted-foreground text-[0.625rem] leading-[0.875rem] grid-cols-[1.75rem_repeat(24,minmax(0,1fr))] sm:grid-cols-[2.5rem_repeat(24,minmax(0,1fr))]"
      onPointerLeave={() => setActive(null)}
      onBlur={() => setActive(null)}
    >
      <div />
      {Array.from({ length: 24 }, (_, h) => (
        <div key={h} className={`whitespace-nowrap text-center transition-colors duration-150 ${active?.h === h ? "text-foreground" : ""}`}>
          {HOUR_LABELS[h]}
        </div>
      ))}
      {DAYS.map((day, d) => [
        <div key={day} className={`flex items-center pr-1 text-[0.625rem] leading-4 sm:text-xs transition-colors duration-150 ${active?.d === d ? "text-foreground" : ""}`}>
          {day}
        </div>,
        ...EVENTS[d].map((e, h) => {
          const focused = active && (active.d === d || active.h === h);
          const isActive = active?.d === d && active.h === h;
          const base = opacityFor(e, MAX);
          const label = `${day} ${h}:00${tzSuffix}, ${e} ${e === 1 ? unit[0] : unit[1]}`;
          return (
            <motion.div
              key={`${d}-${h}`}
              role="img"
              tabIndex={0}
              aria-label={label}
              className={`${CELL} ${e === 0 ? "bg-surface-5" : "bg-foreground"} outline-none focus-visible:ring-1 focus-visible:ring-foreground`}
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={
                inView || reduce
                  ? { opacity: active && !focused ? base * 0.45 : base, scale: isActive ? 1.15 : 1 }
                  : { opacity: 0, scale: 0.6 }
              }
              transition={
                active
                  ? { type: "spring", stiffness: 500, damping: 30 }
                  : { duration: 0.35, ease: EASE_OUT, delay: reduce ? 0 : (d + h) * 0.012 }
              }
              whileTap={reduce ? undefined : { scale: 0.92 }}
              style={{ zIndex: isActive ? 1 : 0 }}
              onPointerEnter={() => setActive({ d, h })}
              onFocus={() => setActive({ d, h })}
            />
          );
        }),
      ])}
      <div />
      <div className="col-span-full flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[0.6875rem] leading-[1.125rem]">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span>Less</span>
          <div className="flex items-center gap-0.5">
            <span className="w-2 h-2 block rounded-xs shrink-0 bg-surface-5" />
            <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-10" />
            <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-11" />
            <span className="w-2 h-2 block rounded-xs shrink-0 bg-clr-12" />
            <span className="w-2 h-2 block rounded-xs shrink-0 bg-foreground" />
          </div>
          <span>More</span>
        </div>
        <motion.span
          key={active ? `${active.d}-${active.h}` : "idle"}
          className="ml-auto text-right tabular-nums text-foreground"
          initial={reduce ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: EASE_OUT }}
          aria-live="polite"
        >
          {active
            ? `${DAYS[active.d]} ${active.h}:00${tzSuffix} · ${count} ${count === 1 ? unit[0] : unit[1]}`
            : `Peak: ${DAYS[peak.d]} ${peak.h}:00${tzSuffix} · ${MAX} ${MAX === 1 ? unit[0] : unit[1]}`}
        </motion.span>
      </div>
    </div>
  );
}
