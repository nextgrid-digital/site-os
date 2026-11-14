"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, LOCALE, MUTED, MacWindow, ROW_HOVER, ScanSweep, WIDE, useStep } from "./kit";

/**
 * Search Console, wide: a crawler walks the site page by page, and the queries
 * each page earns show up on the right with their clicks counting in.
 * Click a page to crawl up to it, or a query to reveal it.
 */
const CRAWL_PAGES = ["/", "/features", "/pricing", "/blog/crm-guide"];
const FOUND_QUERIES = [
  { q: "privacy friendly analytics", clicks: 764, up: true, at: 2 },
  { q: "cookieless analytics", clicks: 612, up: true, at: 3 },
  { q: "ga4 alternative", clicks: 341, up: false, at: 4 },
];

function SearchConsoleBody({ held, hold }: { held: boolean; hold: () => void }) {
  const [step, goTo] = useStep(CRAWL_PAGES.length, 800, held);
  const done = step >= CRAWL_PAGES.length;
  const current = CRAWL_PAGES[Math.min(step, CRAWL_PAGES.length - 1)];

  return (
    <div className="flex h-full flex-col gap-2 @sm:flex-row">
      <MacWindow url={`example.com${current}`} className="w-full @sm:w-[44%]">
        <ul className="flex h-full flex-col [list-style-type:none]">
          {CRAWL_PAGES.map((p, i) => {
            const crawled = step > i;
            const scanning = step === i && !done;
            return (
              <li key={p} className="flex min-h-6 flex-1">
                <button
                  type="button"
                  onClick={() => {
                    hold();
                    goTo(i + 1);
                  }}
                  className={cn(
                    "relative flex w-full cursor-pointer items-center justify-between gap-2 overflow-hidden rounded px-1.5 text-left text-xs leading-4 transition-colors duration-300 hover:bg-primary/10 hover:text-primary",
                    FOCUS,
                    scanning && "bg-surface-3",
                  )}
                >
                  <span className="min-w-0 truncate font-mono">{p}</span>
                  {crawled && (
                    <Check className="size-3 shrink-0 text-primary" aria-hidden="true" />
                  )}
                  {scanning && <ScanSweep />}
                </button>
              </li>
            );
          })}
        </ul>
      </MacWindow>

      {/* Dotted paths carrying each page's queries across; they light up as the queries land. */}
      <div className="hidden w-8 shrink-0 flex-col gap-1.5 @sm:flex" aria-hidden="true">
        <div className="h-4" />
        {FOUND_QUERIES.map((item) => (
          <div
            key={item.q}
            className={cn(
              "flex flex-1 items-center transition-opacity duration-500",
              step >= item.at ? "opacity-100" : "opacity-25",
            )}
          >
            <svg className="h-1 w-full overflow-visible">
              <motion.line
                x1="0"
                x2="100%"
                y1="2"
                y2="2"
                className="stroke-primary"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeDasharray="0.1 5"
                animate={{ strokeDashoffset: [0, -10.2] }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </svg>
          </div>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex h-4 items-center justify-between text-[0.6875rem]">
          <span className="font-medium">Queries</span>
          <span className={MUTED}>{done ? "Crawl complete" : "Crawling…"}</span>
        </div>
        {FOUND_QUERIES.map((item) => {
          const shown = step >= item.at;
          return (
            <button
              type="button"
              key={item.q}
              onClick={() => {
                hold();
                goTo(Math.max(step, item.at));
              }}
              className={cn(
                "flex min-h-8 flex-1 items-center justify-between gap-2 rounded-md border border-solid border-surface bg-background px-2.5",
                ROW_HOVER,
                FOCUS,
              )}
            >
              {shown ? (
                <>
                  <span className="min-w-0 truncate">{item.q}</span>
                  <span className="flex shrink-0 items-baseline gap-2 tabular-nums">
                    <span className={item.up ? "text-primary" : "text-red-400"}>
                      {item.up ? "▲" : "▼"}
                    </span>
                    <span className="font-medium">
                      <SpeedCounter
                        value={item.clicks}
                        animateOnMount
                        duration={0.7}
                        spins={0}
                        blur={0}
                        locale={LOCALE}
                      />
                    </span>
                  </span>
                </>
              ) : (
                <span className="h-2 w-40 rounded bg-surface-4" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const ProductSearchConsole = () => {
  const { ref, cycle, held, hold, bind } = useLoop(7000);
  return (
    <div ref={ref} {...bind} className={WIDE}>
      <SearchConsoleBody key={cycle} held={held} hold={hold} />
    </div>
  );
};
