"use client";

import { useState } from "react";
import { InfoTip } from "@/components/audit/dashboard/info-tip";
import type { FunnelHealthReport } from "@/lib/audit/funnel-health";
import type { Ga4DailyRow } from "@/lib/google/ga4";

function shortDate(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
}

/**
 * "Can I trust these numbers?" — a day-by-day tracking strip (one cell per day, empty days
 * stand out), plus flags when the session totals disagree.
 */
export function FunnelHealthStrip({
  health,
  daily,
}: {
  health: FunnelHealthReport;
  daily: Ga4DailyRow[];
}) {
  const [day, setDay] = useState<number | null>(null);
  const hasDays = daily.length > 1;
  const zeroDays = daily.filter((d) => d.sessions === 0).length;
  const peak = Math.max(...daily.map((d) => d.sessions), 1);

  return (
    <div className="space-y-5 rounded-xl bg-raised p-5 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Data check</h3>
          <InfoTip
            what="Whether the numbers on this dashboard agree with each other, and whether tracking recorded visits on every day."
            why="A day with no visits or totals that disagree usually means tracking broke (tag removed, consent change), not that visitors vanished."
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasDays
            ? zeroDays > 0
              ? `${zeroDays} day${zeroDays === 1 ? "" : "s"} with zero sessions — check tracking on those dates.`
              : "No tracking gaps: every day in this window recorded sessions."
            : health.note}
        </p>
      </div>

      {hasDays ? (
        <div>
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">
              {day != null ? shortDate(daily[day].date) : "Whole window"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
                {(day != null
                  ? daily[day].sessions
                  : daily.reduce((n, d) => n + d.sessions, 0)
                ).toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">
                sessions
                {day != null
                  ? ` · ${daily[day].engagedSessions.toLocaleString()} engaged`
                  : ""}
              </span>
            </div>
          </div>
          <div
            onMouseLeave={() => setDay(null)}
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))`,
            }}
          >
            {daily.map((d, di) => {
              const empty = d.sessions === 0;
              const base = empty ? 1 : 0.25 + 0.75 * (d.sessions / peak);
              return (
                <span
                  key={d.date}
                  tabIndex={0}
                  onMouseEnter={() => setDay(di)}
                  onFocus={() => setDay(di)}
                  onBlur={() => setDay(null)}
                  aria-label={`${shortDate(d.date)}: ${d.sessions.toLocaleString()} sessions`}
                  className={`h-8 cursor-pointer rounded-[3px] outline-none transition-[opacity,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring ${empty ? "bg-warning" : "bg-success"}`}
                  style={{
                    opacity: day != null && day !== di ? base * 0.35 : base,
                    transform: day === di ? "scaleY(1.15)" : undefined,
                  }}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
            <span>{shortDate(daily[0].date)}</span>
            <span>{shortDate(daily[daily.length - 1].date)}</span>
          </div>
        </div>
      ) : null}

      {health.flags.length > 0 ? (
        <ul className="space-y-2">
          {health.flags.map((flag) => (
            <li
              key={flag.id}
              className={
                flag.severity === "warn"
                  ? "rounded-lg bg-warning-soft/80 px-3 py-2 text-sm text-warning-ink"
                  : "rounded-lg bg-tint px-3 py-2 text-sm text-foreground/80"
              }
            >
              {flag.message}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
