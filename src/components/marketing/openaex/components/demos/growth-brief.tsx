"use client";

import { motion } from "motion/react";
import { Check, Download, Loader, MousePointer2, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { GeminiIcon, GlobeIcon, MappingIcon, PdfIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, LOCALE, MUTED, WIDE, useStep } from "./kit";

/**
 * Growth brief, wide: the four stages of building the report run in turn,
 * then the cursor clicks Download, the PDF generates, and the values land.
 * Click a stage to jump to it, or Download to run the last part yourself.
 */
const BRIEF_STAGES = [
  { label: "Crawl the site", note: "82 pages", icon: GlobeIcon },
  { label: "Score every finding", note: "47 findings", icon: GeminiIcon },
  { label: "Map the commercial graph", note: "12 gaps", icon: MappingIcon },
  { label: "Write the brief", note: "PDF ready", icon: PdfIcon },
];
const BRIEF_LINES = [
  { value: 12, text: "graph gaps ranked by revenue" },
  { value: 47, text: "findings, 6 critical" },
  { value: null, text: "Next: add proof to /pricing" },
];

function GrowthBriefBody({ held, hold }: { held: boolean; hold: () => void }) {
  // 1-4: stages finish · 5: cursor presses Download · 6: generating · 7: ready.
  const [step, goTo] = useStep(7, 800, held);
  const pressed = step === 5;
  const generating = step === 6;
  const ready = step >= 7;
  const cursorVisible = step >= 4 && step < 7;

  // Clicking Download plays 5 → 6 → 7 on its own timers, since the loop is paused while interacting.
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach((id) => window.clearTimeout(id));
  }, []);
  const runDownload = () => {
    hold();
    timers.current.forEach((id) => window.clearTimeout(id));
    goTo(5);
    timers.current = [
      window.setTimeout(() => goTo(6), 700),
      window.setTimeout(() => goTo(7), 1700),
    ];
  };

  return (
    <div className="flex h-full flex-col gap-2 @sm:flex-row">
      <ol className="relative flex w-full flex-col @sm:w-[44%]">
        {/* Dotted spine through the stage icons (icon centres sit at 12.5%, 37.5%, ...). */}
        <svg aria-hidden="true" className="absolute top-0 left-0 h-full w-6 overflow-visible">
          <motion.line
            x1="12"
            x2="12"
            y1="12.5%"
            y2="87.5%"
            className="stroke-primary"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeDasharray="0.1 5"
            animate={{ strokeDashoffset: [0, -10.2] }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </svg>
        {BRIEF_STAGES.map((s, i) => {
          const done = step > i;
          const Icon = s.icon;
          return (
            <li key={s.label} className="relative flex min-h-7 flex-1">
              <button
                type="button"
                onClick={() => {
                  hold();
                  goTo(i + 1);
                }}
                className={cn(
                  "group flex w-full cursor-pointer items-center gap-2 rounded-md text-left",
                  FOCUS,
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-md border border-solid transition-colors duration-500 group-hover:border-primary",
                    done
                      ? "border-primary bg-primary text-background"
                      : "border-surface bg-background",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate transition-colors group-hover:text-primary">
                  {s.label}
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[0.6875rem] tabular-nums transition-opacity duration-500",
                    done ? "text-primary opacity-100" : "opacity-0",
                  )}
                >
                  {s.note}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Dotted path carrying the finished stages across to the brief. */}
      <div className="relative hidden w-8 shrink-0 @sm:block">
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible">
          {BRIEF_STAGES.map((s, i) => (
            <motion.line
              key={s.label}
              x1="0"
              x2="100%"
              y1={`${12.5 + i * 25}%`}
              y2={`${12.5 + i * 25}%`}
              className="stroke-primary"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeDasharray="0.1 5"
              animate={{ strokeDashoffset: [0, -10.2] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
          ))}
        </svg>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border border-solid border-surface bg-background p-2">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="font-medium">Growth brief</span>
            <span className="flex items-center gap-0.5 text-[0.6875rem] text-primary">
              <TrendingUp className="size-3" aria-hidden="true" />
              +18.4%
            </span>
          </span>
          <button
            type="button"
            onClick={runDownload}
            className={cn(
              "flex shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-medium transition-[transform,background-color,opacity] duration-300 hover:opacity-85",
              FOCUS,
              ready ? "bg-surface-4 text-foreground" : "bg-primary text-background",
              pressed && "scale-95",
            )}
          >
            {ready ? (
              <>
                <Check className="size-3" aria-hidden="true" />
                Downloaded
              </>
            ) : generating ? (
              <>
                <motion.span
                  className="flex"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                >
                  <Loader className="size-3" aria-hidden="true" />
                </motion.span>
                Generating…
              </>
            ) : (
              <>
                <Download className="size-3" aria-hidden="true" />
                Download PDF
              </>
            )}
          </button>
        </div>
        <ul className="flex min-h-0 flex-1 flex-col [list-style-type:none]">
          {BRIEF_LINES.map((l) => (
            <li
              key={l.text}
              className={cn(
                "flex min-h-7 flex-1 items-center gap-1.5 border-t border-solid border-surface text-[0.8125rem] transition-colors hover:text-primary",
              )}
            >
              {l.value !== null &&
                (ready ? (
                  <span className="font-medium tabular-nums">
                    <SpeedCounter
                      value={l.value}
                      animateOnMount
                      duration={0.7}
                      spins={0}
                      blur={0}
                      locale={LOCALE}
                    />
                  </span>
                ) : (
                  <span className={cn("font-medium", MUTED)}>—</span>
                ))}
              <span>{l.text}</span>
            </li>
          ))}
        </ul>

        <MousePointer2
          aria-hidden="true"
          className="pointer-events-none absolute size-4 fill-foreground text-foreground transition-[left,top,opacity] duration-700 ease-out"
          style={{
            left: cursorVisible ? "80%" : "100%",
            top: cursorVisible ? "6%" : "100%",
            opacity: cursorVisible ? 1 : 0,
          }}
        />
      </div>
    </div>
  );
}

export const ProductGrowthBrief = () => {
  const { ref, cycle, held, hold, bind } = useLoop(9000);
  return (
    <div ref={ref} {...bind} className={WIDE}>
      <GrowthBriefBody key={cycle} held={held} hold={hold} />
    </div>
  );
};
