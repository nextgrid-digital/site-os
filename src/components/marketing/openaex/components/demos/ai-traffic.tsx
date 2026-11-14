"use client";

import { useState } from "react";
import { SpeedCounter } from "@/components/motion/speed-counter";
import { ChatgptIcon, ClaudeIcon, GeminiIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useLoop } from "../use-loop";
import { FOCUS, LOCALE, MUTED, PANEL, ROW_HOVER } from "./kit";

/** Visits from AI assistants: counts tick live and bars rescale. Click a row to add a burst of visits. */
const SOURCES = [
  { label: "ChatGPT", icon: ChatgptIcon, base: 142, step: 4 },
  { label: "Claude", icon: ClaudeIcon, base: 61, step: 2 },
  { label: "Gemini", icon: GeminiIcon, base: 24, step: 1 },
];

export const ProductAiTraffic = () => {
  const { ref, cycle, hold, bind } = useLoop(2400);
  const [extra, setExtra] = useState([0, 0, 0]);
  const visits = SOURCES.map((s, i) => s.base + s.step * (cycle % 6) + extra[i]);
  const max = Math.max(...visits);

  return (
    <div ref={ref} {...bind} className={PANEL}>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-medium">Visits from AI tools</span>
        <span className={cn("text-[0.6875rem]", MUTED)}>live</span>
      </div>
      <ul className="flex flex-col gap-1.5 [list-style-type:none]">
        {SOURCES.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.label}>
              <button
                type="button"
                aria-label={`Add visits from ${s.label}`}
                onClick={() => {
                  hold();
                  setExtra((e) => e.map((v, j) => (j === i ? v + s.step * 4 : v)));
                }}
                className={cn("group flex w-full items-center gap-2", FOCUS)}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-solid border-surface bg-background transition-colors duration-200 group-hover:border-primary/60 group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    "relative min-w-0 flex-1 cursor-pointer overflow-hidden rounded-lg border border-solid border-surface bg-background py-1.5 pr-2 pl-2.5 text-left group-hover:border-primary/60",
                    ROW_HOVER,
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 left-0 rounded-lg bg-color-001/15 transition-[width,background-color] duration-700 ease-out group-hover:bg-primary/20"
                    style={{ width: `${(visits[i] / max) * 100}%` }}
                  />
                  <span className="relative flex items-center justify-between gap-2">
                    <span className="truncate">{s.label}</span>
                    <span className="font-medium tabular-nums">
                      <SpeedCounter
                        value={visits[i]}
                        duration={0.6}
                        spins={0}
                        blur={0}
                        locale={LOCALE}
                      />
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
