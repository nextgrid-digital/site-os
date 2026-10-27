"use client";

import { motion, useReducedMotion } from "motion/react";
import { HoverTip, InfoTip } from "@/components/audit/dashboard/info-tip";
import { AnalyticsRowIcon } from "@/components/audit/report/analytics/analytics-row-icon";
import type { AnalyticsFunnelStepView } from "@/lib/audit/connected-analytics";
import { EASE_OUT } from "@/lib/ease";

/** Page-by-page funnel built from the top GA4 pages, in order of traffic. */
export function AnalyticsPathFunnel({
  steps,
}: {
  steps: AnalyticsFunnelStepView[];
}) {
  const reduce = useReducedMotion();
  const first = steps[0];
  const last = steps.length ? steps[steps.length - 1] : null;
  const max = Math.max(...steps.map((s) => s.visitors), 1);

  return (
    <div className="rounded-xl bg-raised p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">Lead path</p>
        <InfoTip
          what="Your most visited pages lined up from most to least traffic. Each bar shows how many visitors reached that page, and the % is how many are left compared with the first page."
          why="A big drop between two pages is where people lose interest. Fix or move the call-to-action on the page just before the drop."
        />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {steps.length >= 2 && first && last
          ? `${last.visitors.toLocaleString()} visitors reach ${last.path} — ${Math.round(last.conversionPct)}% of those who start at ${first.path}`
          : "Path funnel from top GA4 pages"}
      </p>

      {steps.length < 2 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Not enough page-path data to build a funnel. Re-run a full audit with
          GA4 connected.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {steps.map((step, i) => (
            <li key={step.step}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <AnalyticsRowIcon kind="page" label={step.path} />
                  <HoverTip
                    text={step.path}
                    className="truncate font-mono text-xs text-foreground"
                  >
                    {step.path}
                  </HoverTip>
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {step.visitors.toLocaleString()}
                  </span>
                  {" · "}
                  {Math.round(step.conversionPct)}%
                  {step.dropOffPct != null
                    ? ` · −${step.dropOffPct.toFixed(0)}% vs previous`
                    : ""}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-tint">
                <motion.div
                  className="h-full origin-left rounded-full bg-foreground/85"
                  style={{
                    width: `${Math.max(3, (step.visitors / max) * 100)}%`,
                  }}
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    ease: EASE_OUT,
                    delay: i * 0.08,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
