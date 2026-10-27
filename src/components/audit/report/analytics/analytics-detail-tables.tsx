"use client";

import { HoverTip } from "@/components/audit/dashboard/info-tip";
import { motion, useReducedMotion } from "motion/react";
import { AnalyticsRowIcon } from "@/components/audit/report/analytics/analytics-row-icon";
import type { AnalyticsTableRow } from "@/lib/audit/connected-analytics";
import { EASE_OUT } from "@/lib/ease";

type Group = {
  id: string;
  title: string;
  rows: AnalyticsTableRow[];
  countLabel: string;
  showShare: boolean;
};

const COLS =
  "grid items-center gap-x-4 grid-cols-[minmax(0,1fr)_5rem_4rem_3.5rem]";

/**
 * Every breakdown visible at once (it's a dashboard): two roomy columns, each card is
 * name · count · share · conversions.
 */
export function AnalyticsDetailTables(props: {
  sources: AnalyticsTableRow[];
  countries: AnalyticsTableRow[];
  devices: AnalyticsTableRow[];
  browsers: AnalyticsTableRow[];
  pages: AnalyticsTableRow[];
  events: AnalyticsTableRow[];
}) {
  const reduce = useReducedMotion();
  const groups: Group[] = [
    {
      id: "sources",
      title: "Top sources",
      rows: props.sources,
      countLabel: "Sessions",
      showShare: true,
    },
    {
      id: "countries",
      title: "Top countries",
      rows: props.countries,
      countLabel: "Sessions",
      showShare: true,
    },
    {
      id: "pages",
      title: "Top pages",
      rows: props.pages,
      countLabel: "Sessions",
      showShare: true,
    },
    {
      id: "devices",
      title: "Devices",
      rows: props.devices,
      countLabel: "Sessions",
      showShare: true,
    },
    {
      id: "browsers",
      title: "Browsers",
      rows: props.browsers,
      countLabel: "Sessions",
      showShare: true,
    },
    {
      id: "events",
      title: "Top events",
      rows: props.events,
      countLabel: "Count",
      showShare: false,
    },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {groups.map((group, gi) => {
        return (
          <motion.section
            key={group.id}
            className="min-w-0 overflow-hidden rounded-xl bg-raised p-5 shadow-sm"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.35,
              ease: EASE_OUT,
              delay: (gi % 2) * 0.05,
            }}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {group.title}
              </h3>
            </div>

            <div
              className={`${COLS} mt-4 px-2 pb-2 text-xs text-muted-foreground`}
            >
              <span>Name</span>
              <span className="text-right">{group.countLabel}</span>
              <span className="text-right">
                {group.showShare ? "Share" : ""}
              </span>
              <span className="text-right">Conv.</span>
            </div>

            {group.rows.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-muted-foreground">
                No data for this dimension yet.
              </p>
            ) : (
              <ul>
                {group.rows.map((row) => (
                  <li
                    key={row.label}
                    className={`${COLS} rounded-lg px-2 py-2.5 transition-colors hover:bg-tint/60`}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <AnalyticsRowIcon kind={row.kind} label={row.label} />
                      <HoverTip
                        text={row.label}
                        className="truncate text-sm font-medium text-foreground"
                      >
                        {row.label}
                      </HoverTip>
                    </span>
                    <span className="text-right text-sm tabular-nums text-foreground">
                      {row.views}
                    </span>
                    <span className="text-right text-sm tabular-nums text-muted-foreground">
                      {group.showShare ? row.share : ""}
                    </span>
                    <span className="text-right text-sm tabular-nums text-foreground/80">
                      {row.secondary ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
