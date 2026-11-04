"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const LOCALE = "en-US";
export const PANEL =
  "w-full max-w-sm rounded-[14px] border border-solid border-surface bg-surface-3 p-3 text-xs leading-4";
/** Full-width variant for tiles that span 2 or 3 columns. */
export const WIDE =
  "h-full w-full rounded-[14px] border border-solid border-surface bg-surface-3 p-3 text-xs leading-4";
export const MUTED = "text-muted-foreground";
export const FOCUS =
  "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none";
/** Clickable row: green border on hover and keyboard focus. */
export const ROW_HOVER =
  "cursor-pointer text-left transition-colors duration-200 hover:border-primary/60";

/**
 * Counts 0..max, one step per `ms`, then holds. Pass `held` to freeze it while the
 * visitor is interacting, and use the returned setter to jump to a step.
 * Give the caller a `key` that changes per loop to replay it. The only setState
 * in an effect happens inside a timeout.
 */
export function useStep(max: number, ms: number, held = false) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (held || step >= max) return;
    const id = window.setTimeout(() => setStep((s) => Math.min(s + 1, max)), ms);
    return () => window.clearTimeout(id);
  }, [step, max, ms, held]);
  return [step, setStep] as const;
}

/** A browser-style window: traffic lights and a URL bar over the crawled page. */
export function MacWindow({
  url,
  className,
  children,
}: {
  url: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-lg border border-solid border-surface bg-background",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-solid border-surface px-2 py-1.5">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-primary" />
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate rounded bg-surface-3 px-2 py-0.5 text-center font-mono text-[0.625rem]",
            MUTED,
          )}
        >
          {url}
        </span>
      </div>
      <div className="min-h-0 flex-1 p-2">{children}</div>
    </div>
  );
}

/** Shimmer that sweeps across its (relative, overflow-hidden) parent while a page is being read. */
export function ScanSweep() {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 w-1/3 [background-image:linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)]"
      animate={{ x: ["-100%", "300%"] }}
      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
    />
  );
}
