"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AeoCallouts, { type DemoCallout } from "../sections/aeo-demo-callouts";
import { INSIGHT_TABLES } from "../demo/insight-tables";
import InsightCard from "./insight-card";
import { RevealGrid } from "./reveal";

/**
 * Grid of breakdown tables. Clicking one opens a dotted-line note, the same overlay the AEO demo
 * uses, explaining what the table is and how its numbers are worked out. One note at a time.
 */
export default function InsightTables() {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<string | null>(null);

  const items = useMemo<DemoCallout[]>(() => {
    const i = INSIGHT_TABLES.findIndex((t) => t.id === open);
    if (i < 0) return [];
    const t = INSIGHT_TABLES[i];
    return [{ id: t.id, target: t.id, side: i % 2 === 0 ? "left" : "right", dy: 0, ...t.explainer }];
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !root.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [open]);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span className="tracking-[0.08em] uppercase">Sample data</span>
        <span className="text-[13px] max-sm:hidden">Click a table to see how it&apos;s calculated</span>
      </div>
      <div ref={root} className="relative">
        <RevealGrid className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {INSIGHT_TABLES.map((t) => (
            <InsightCard
              key={t.id}
              table={t}
              open={open === t.id}
              onToggle={() => setOpen((cur) => (cur === t.id ? null : t.id))}
            />
          ))}
        </RevealGrid>
        <AeoCallouts root={root} items={items} noteWidth={172} outline={false} />
      </div>
    </div>
  );
}
