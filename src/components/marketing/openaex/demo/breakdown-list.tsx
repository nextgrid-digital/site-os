'use client';

import { useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { SpeedCounter } from '@/components/motion/speed-counter';

export type ShareRow = {
  label: string;
  /** Display value such as "9,842". */
  value: string;
  leading?: ReactNode;
};

const toNumber = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0;

/** Segment and dot opacity, strongest first, so rank reads at a glance in one green hue. */
const SHADES = [1, 0.74, 0.54, 0.38, 0.26, 0.18];
const shade = (i: number) => SHADES[Math.min(i, SHADES.length - 1)];

/**
 * Ranked breakdown: one stacked bar shows how the rows split the total, and each row below is keyed to
 * its segment. Hovering a row spotlights its segment. Values race to their new number when the tab changes.
 */
export function ShareList({ rows }: { rows: ShareRow[] }) {
  const reduced = useReducedMotion();
  const [hot, setHot] = useState<number | null>(null);
  const nums = rows.map((r) => toNumber(r.value));
  const total = nums.reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div
        className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={`Share of the top ${rows.length}`}
      >
        {rows.map((r, i) => (
          <motion.span
            key={i}
            className="block h-full rounded-full bg-[var(--success)]"
            initial={false}
            animate={{
              flexGrow: nums[i],
              opacity: hot === null || hot === i ? shade(i) : 0.12,
            }}
            style={{ flexBasis: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>

      <ul className="flex flex-1 list-outside flex-col justify-between [list-style-type:none]" onMouseLeave={() => setHot(null)}>
        {rows.map((r, i) => (
          <li key={i} className="flex min-h-8 flex-1 items-center">
            <div
              onMouseEnter={() => setHot(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-1.5 transition-colors duration-150 ${
                hot === i ? 'bg-tint' : ''
              } ${hot !== null && hot !== i ? 'opacity-60' : ''}`}
            >
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-[var(--success)]" style={{ opacity: shade(i) }} />
              <span className="flex min-w-0 flex-1 items-center gap-2 text-xs leading-4">
                {r.leading}
                <span className="min-w-0 truncate" title={r.label}>
                  {r.label}
                </span>
              </span>
              <span className="w-10 shrink-0 text-right text-[0.6875rem] tabular-nums text-muted-foreground">
                {Math.round((nums[i] / total) * 100)}%
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-xs font-medium tabular-nums max-md:w-10">
                <SpeedCounter value={nums[i]} locale="en-US" spins={0} duration={0.7} blur={3} />
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
