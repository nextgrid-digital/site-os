"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { JoinedPageStoryTable } from "@/components/audit/report/joined/joined-page-story-table";
import { JoinedQueryBridges } from "@/components/audit/report/joined/joined-query-bridges";
import type { JoinedTrafficStory } from "@/lib/audit/joined-traffic-story";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";

type Tab = "pages" | "queries";

/** One table slot; the tabs swap Pages ↔ Queries so the same space serves both views. */
export function PagesQueriesPanel({
  story,
  hasPages,
  hasQueries,
}: {
  story: JoinedTrafficStory;
  hasPages: boolean;
  hasQueries: boolean;
}) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<Tab>(
    hasPages || !hasQueries ? "pages" : "queries",
  );
  const tabs: Array<{ id: Tab; label: string; hint: string }> = [
    { id: "pages", label: "Pages", hint: "Which pages get found and convert" },
    {
      id: "queries",
      label: "Queries",
      hint: "What people searched, and where they landed",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Pages or queries"
          className="relative inline-flex rounded-lg bg-tint p-1"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`relative z-10 cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                tab === t.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === t.id ? (
                <motion.span
                  layoutId="pq-tab-pill"
                  className="absolute inset-0 -z-10 rounded-md bg-surface-3 shadow-sm"
                  transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
                />
              ) : null}
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {tabs.find((t) => t.id === tab)?.hint}
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          {tab === "pages" ? (
            hasPages ? (
              <JoinedPageStoryTable rows={story.pages} />
            ) : (
              <p className="rounded-xl bg-surface-5 px-4 py-8 text-center text-sm text-muted-foreground">
                No page metrics yet. Run an audit with Website + Google sources.
              </p>
            )
          ) : hasQueries ? (
            <JoinedQueryBridges rows={story.queries} />
          ) : (
            <p className="rounded-xl bg-surface-5 px-4 py-8 text-center text-sm text-muted-foreground">
              Connect Search Console to see which searches bring people to your
              site.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
