"use client";

import { useState } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, LOCALE, MUTED, PANEL } from "./kit";

/**
 * GA4: walks through date ranges and days on a loop. Pick a range or a day and it
 * stays where you put it, then picks the loop back up after a few seconds idle.
 */
const GA4_RANGES = [
  { label: "7d", days: [212, 248, 231, 274, 296, 288, 332], conv: 2.1, drop: 58 },
  { label: "28d", days: [812, 904, 877, 1011, 968, 1054, 1326], conv: 2.4, drop: 61 },
  { label: "90d", days: [2410, 2680, 2555, 2990, 2844, 3110, 3751], conv: 2.8, drop: 54 },
];
const DECIMAL = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

export const ProductGA4 = () => {
  const { ref, cycle, hold, bind } = useLoop(1600);
  // A pick only counts for the loop tick it was made in, so the loop takes over after idle.
  const [picked, setPicked] = useState<{
    cycle: number;
    range: number;
    day: number | null;
  } | null>(null);
  const manual = picked && picked.cycle === cycle ? picked : null;
  const range = manual ? manual.range : Math.floor(cycle / 7) % GA4_RANGES.length;
  const day = manual ? manual.day : cycle % 7;
  const r = GA4_RANGES[range];
  const total = r.days.reduce((a, b) => a + b, 0);
  const peak = Math.max(...r.days);

  return (
    <div ref={ref} {...bind} className={PANEL}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={MUTED}>Sessions</p>
          <p className="flex items-baseline gap-1.5 text-base font-medium leading-5 tracking-[-0.4px] tabular-nums">
            <SpeedCounter value={total} duration={0.8} spins={0} blur={0} locale={LOCALE} />
            <span className="rounded-md border border-solid border-surface bg-background px-1.5 py-0.5 text-[0.6875rem] font-normal tracking-normal">
              <SpeedCounter
                value={r.conv}
                format={DECIMAL}
                duration={0.5}
                spins={0}
                blur={0}
                locale={LOCALE}
              />
              % conv.
            </span>
          </p>
        </div>
        <div role="group" aria-label="Date range" className="flex gap-1">
          {GA4_RANGES.map((g, i) => {
            const on = i === range;
            return (
              <button
                key={g.label}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  hold();
                  setPicked({ cycle, range: i, day: null });
                }}
                className={cn(
                  "cursor-pointer rounded-md border border-solid px-1.5 py-0.5 text-[0.6875rem] transition-colors",
                  FOCUS,
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : cn("border-surface hover:border-primary/60 hover:text-primary", MUTED),
                )}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 flex h-12 items-end gap-1.5">
        {r.days.map((v, i) => {
          const on = day === i;
          return (
            <button
              key={`${range}-${i}`}
              type="button"
              aria-label={`Day ${i + 1}: ${v} sessions`}
              aria-pressed={on}
              onClick={() => {
                hold();
                setPicked({ cycle, range, day: on ? null : i });
              }}
              className={cn(
                "flex-1 cursor-pointer rounded-sm p-0 transition-[height,background-color] duration-500 ease-out",
                FOCUS,
                on ? "bg-primary" : "bg-surface-4 hover:bg-primary/40",
              )}
              style={{ height: `${(v / peak) * 100}%` }}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-solid border-surface pt-1.5">
        <span className={cn("flex items-baseline gap-1", MUTED)}>
          {day === null ? (
            "Pick a day"
          ) : (
            <>
              Day {day + 1}:
              <span className="font-medium text-foreground tabular-nums">
                <SpeedCounter
                  value={r.days[day]}
                  duration={0.5}
                  spins={0}
                  blur={0}
                  locale={LOCALE}
                />
              </span>
            </>
          )}
        </span>
        <span className={MUTED}>
          Drop-off before pricing{" "}
          <span className="font-medium text-red-400 tabular-nums">
            <SpeedCounter value={r.drop} duration={0.5} spins={0} blur={0} locale={LOCALE} />%
          </span>
        </span>
      </div>
    </div>
  );
};
