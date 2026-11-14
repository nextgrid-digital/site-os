// @ts-nocheck
"use client";
import type { LucideIcon } from "lucide-react";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { METRIC_TILE_ACTIVE, METRIC_TILE_IDLE } from "@/components/audit/report/metric-tile-styles";
import { cardVariants } from "./reveal";
export type Tile2Data = {
  text: string;
  text2: string;
  icon?: LucideIcon;
  /** Numeric value. When set, the selected tile races its digits up with a speed counter. */
  amount?: number;
  format?: Intl.NumberFormatOptions;
};
/** Metric tile in the hero tile style. Clicking selects it and races its number. */
export default function Tile2({
  d,
  cids,
  selected = false,
  raceKey = 0,
  onSelect,
}: {
  d: Tile2Data;
  cids: string[];
  selected?: boolean;
  /** Changes on every click so a repeat click on the selected tile races again. */
  raceKey?: number;
  onSelect?: () => void;
}) {
  const Icon = d.icon;
  const valueRef = useRef(null);
  const inView = useInView(valueRef, { once: true, margin: "-80px" });

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      data-cid={cids[0]}
      variants={cardVariants}
      className={`relative block h-full w-full min-w-0 cursor-pointer rounded-[18px] border border-solid p-[18px] text-left ${
        selected ? METRIC_TILE_ACTIVE : METRIC_TILE_IDLE
      }`}
    >
      <div data-cid={cids[1]} className="flex h-full w-full min-w-0 flex-col gap-1">
        <div data-cid={cids[2]} className="flex w-full min-w-0 flex-col items-start gap-2.5">
          {Icon ? (
            <span
              aria-hidden
              className={`flex size-6 shrink-0 items-center justify-center rounded-md max-lg:hidden ${
                selected ? "bg-surface-3/15 text-color-004" : "bg-tint text-muted-foreground"
              }`}
            >
              <Icon className="size-3.5" strokeWidth={2} />
            </span>
          ) : null}
          <span
            data-cid={cids[3]}
            className={`block min-w-0 text-balance text-[13px] font-medium leading-4 ${
              selected ? "text-color-004" : "text-muted-foreground"
            }`}
          >
            {d.text}
          </span>
        </div>
        <div data-cid={cids[4]} className="mt-auto min-w-0 font-mono">
          <span ref={valueRef} data-cid={cids[5]} className="inline text-3xl leading-8 font-bold tracking-tight max-lg:text-2xl">
            {selected && d.amount !== undefined ? (
              <SpeedCounter
                key={raceKey}
                value={inView ? d.amount : 0}
                format={d.format}
                locale="en-US"
                animateOnMount={raceKey > 0}
                spins={1}
                duration={1.2}
              />
            ) : (
              d.text2
            )}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
