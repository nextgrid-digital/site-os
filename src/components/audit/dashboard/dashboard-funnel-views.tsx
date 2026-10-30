"use client";

import { motion, useReducedMotion } from "motion/react";
import { HoverTip, InfoTip } from "@/components/audit/dashboard/info-tip";
import { AnalyticsRowIcon } from "@/components/audit/report/analytics/analytics-row-icon";
import type { FunnelAssessment } from "@/lib/audit/funnel-assessment";
import { EASE_OUT } from "@/lib/ease";

const LEAK_STYLE: Record<
  FunnelAssessment["landings"][number]["leakLabel"],
  string
> = {
  looks_like_a_leak: "bg-warning-soft text-warning-ink",
  ok: "bg-success-soft text-success-ink",
  unclear: "bg-tint text-muted-foreground",
};
const LEAK_TEXT: Record<
  FunnelAssessment["landings"][number]["leakLabel"],
  string
> = {
  looks_like_a_leak: "Leaking",
  ok: "Healthy",
  unclear: "Not enough data",
};

function rate(part: number, whole: number) {
  return whole > 0 ? (part / whole) * 100 : null;
}

function Pct({ n }: { n: number | null }) {
  return <>{n == null ? "—" : `${n < 10 ? n.toFixed(1) : Math.round(n)}%`}</>;
}

/**
 * Goal funnel (Visit → Engaged → Conversion) + the landing pages that lose the most visitors.
 * Channel and page tables already live above, so they are not repeated here.
 */
export function DashboardFunnelViews({
  assessment,
}: {
  assessment: FunnelAssessment;
}) {
  const reduce = useReducedMotion();
  const { sessions, engaged, conversions } = assessment.goalTotals;

  const steps = [
    {
      label: "Visited",
      value: sessions,
      stepRate: null as number | null,
      tip: "Every session (visit) recorded by GA4 in this audit window.",
    },
    {
      label: "Engaged",
      value: engaged,
      stepRate: rate(engaged, sessions),
      tip: "Sessions that lasted 10+ seconds, viewed 2+ pages or converted. The % is the share of visits that stayed.",
    },
    {
      label: "Converted",
      value: conversions,
      stepRate: rate(conversions, engaged > 0 ? engaged : sessions),
      tip: "Sessions where a key event fired (e.g. a lead form). The % is the share of engaged visitors who converted.",
    },
  ];
  const max = Math.max(sessions, 1);
  const overall = rate(conversions, sessions);

  const leakHint =
    assessment.bottlenecks[0]?.title ??
    (assessment.hasFunnelProblem ? assessment.verdict : null);
  const landings = assessment.landings.slice(0, 5);

  return (
    <div className="space-y-4">
      {leakHint ? (
        <p className="rounded-lg bg-warning-soft/70 px-3 py-2 text-sm text-warning-ink">
          {leakHint}
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl bg-raised p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Visit → conversion
            </h3>
            <InfoTip
              what="A funnel counts how many people make it through each stage toward a goal. Here: visit the site, stay and engage, then convert."
              why="It shows which stage loses the most people. Low “engaged” = the landing pages don’t hold attention. Low “converted” = the offer or form isn’t convincing."
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {overall != null ? (
              <>
                <span className="font-medium text-foreground">
                  <Pct n={overall} />
                </span>{" "}
                of all visits end in a conversion
              </>
            ) : (
              "Whole property, same window as the rest of the dashboard"
            )}
          </p>
          <ul className="mt-5 space-y-5">
            {steps.map((s, i) => (
              <li key={s.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    {s.label}
                    <InfoTip what={s.tip} label={`About ${s.label}`} />
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {s.value.toLocaleString()}
                    </span>
                    {s.stepRate != null ? (
                      <>
                        {" · "}
                        <Pct n={s.stepRate} /> of previous step
                      </>
                    ) : null}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-tint">
                  <motion.div
                    className="h-full origin-left rounded-full bg-foreground/85"
                    style={{ width: `${Math.max(2, (s.value / max) * 100)}%` }}
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.6,
                      ease: EASE_OUT,
                      delay: i * 0.1,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-raised p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              Landing pages that leak
            </h3>
            <InfoTip
              what="Pages where people first arrive, with the share of those visits that stayed engaged."
              why="Start fixing at the top: a high-traffic page with low engagement wastes the most visitors."
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked by visits · engaged = stayed
          </p>
          {landings.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No landing page data yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {landings.map((l) => (
                <li
                  key={l.path}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <AnalyticsRowIcon kind="page" label={l.path} />
                    <span className="min-w-0">
                      <HoverTip
                        text={l.path}
                        className="block truncate font-medium text-foreground"
                      >
                        {l.path}
                      </HoverTip>
                      <span className="block text-xs tabular-nums text-muted-foreground">
                        {l.sessions.toLocaleString()} visits ·{" "}
                        <Pct n={rate(l.engagedSessions, l.sessions)} /> engaged
                      </span>
                    </span>
                  </span>
                  <HoverTip
                    text={l.meaning}
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${LEAK_STYLE[l.leakLabel]}`}
                  >
                    {LEAK_TEXT[l.leakLabel]}
                  </HoverTip>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
