"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfoTip } from "@/components/audit/dashboard/info-tip";
import type { FunnelHealthReport } from "@/lib/audit/funnel-health";
import type { Ga4DailyRow } from "@/lib/google/ga4";

const SESSIONS = "oklch(0.205 0 0)";
const ENGAGED = "oklch(0.565 0.11 164.584)";
const AXIS = { fontSize: 11, fill: "oklch(0.556 0 0)" };

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
 * "Can I trust these numbers?" — daily sessions vs engaged sessions. Tracking breaks show up
 * as flat-lines or sudden drops to zero; totals reconcile underneath.
 */
export function FunnelHealthStrip({
  health,
  daily,
}: {
  health: FunnelHealthReport;
  daily: Ga4DailyRow[];
}) {
  const data = daily.map((d) => ({
    date: d.date,
    label: shortDate(d.date),
    sessions: d.sessions,
    engaged: d.engagedSessions,
  }));
  const zeroDays = data.filter((d) => d.sessions === 0).length;
  const hasChart = data.length > 1;

  return (
    <div className="space-y-4 rounded-xl bg-raised p-5 shadow-sm">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Data check</h3>
          <InfoTip
            what="Daily sessions and engaged sessions from GA4. The lines should move together and never sit at zero."
            why="A sudden drop to zero or a flat line usually means tracking broke (tag removed, consent change), not that visitors vanished."
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {hasChart
            ? zeroDays > 0
              ? `${zeroDays} day${zeroDays === 1 ? "" : "s"} with zero sessions — check tracking on those dates.`
              : "No tracking gaps: every day in this window recorded sessions."
            : health.note}
        </p>
      </div>

      {hasChart ? (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="oklab(0.922 0 0 / 0.7)"
              />
              <XAxis
                dataKey="label"
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={28}
              />
              <YAxis
                tick={AXIS}
                axisLine={false}
                tickLine={false}
                width={32}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ stroke: "oklab(0.145 0 0 / 0.15)" }}
                contentStyle={{
                  borderRadius: 10,
                  fontSize: 12,
                  border: "1px solid oklab(0.922 0 0)",
                  boxShadow: "none",
                }}
              />
              <Line
                name="Sessions"
                dataKey="sessions"
                type="monotone"
                stroke={SESSIONS}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={700}
              />
              <Line
                name="Engaged"
                dataKey="engaged"
                type="monotone"
                stroke={ENGAGED}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                animationDuration={700}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {hasChart ? (
        <div className="flex gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-0.5 w-3 rounded"
              style={{ background: SESSIONS }}
            />{" "}
            Sessions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-0.5 w-3 rounded"
              style={{ background: ENGAGED }}
            />{" "}
            Engaged
          </span>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Overview sessions" value={health.overviewSessions} />
        <Metric label="Channel sum" value={health.channelSessions} />
        <Metric label="Landing sum" value={health.landingSessions} />
      </div>

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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-tint px-3 py-2">
      <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold font-mono text-foreground">
        {value > 0 ? value.toLocaleString() : "—"}
      </p>
    </div>
  );
}
