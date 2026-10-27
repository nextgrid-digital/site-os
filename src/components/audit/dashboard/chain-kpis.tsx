"use client";

import { motion, useReducedMotion } from "motion/react";
import { InfoTip } from "@/components/audit/dashboard/info-tip";
import { EASE_OUT } from "@/lib/ease";

type Tile = {
  id: string;
  label: string;
  source: string;
  value: string;
  sub?: string;
  what: string;
  why: string;
};

const pct = (n: number, d: number) =>
  d > 0 ? `${((n / d) * 100).toFixed(n / d < 0.1 ? 1 : 0)}%` : null;

/**
 * The search → site → conversion chain at a glance. Each tile also shows the rate that links it
 * to the previous step, which the trend chart below does not.
 */
export function ChainKpis({
  impressions,
  clicks,
  sessions,
  engaged,
  conversions,
  adsSpend,
}: {
  impressions: number;
  clicks: number;
  sessions: number;
  engaged: number;
  conversions: number;
  adsSpend: number | null;
}) {
  const reduce = useReducedMotion();
  const ctr = pct(clicks, impressions);
  const engagement = pct(engaged, sessions);
  const convRate = pct(conversions, sessions);
  const cpl =
    adsSpend != null && conversions > 0
      ? `${Math.round(adsSpend / conversions).toLocaleString()} per conversion`
      : undefined;

  const tiles: Tile[] = [
    {
      id: "impressions",
      label: "Impressions",
      source: "Search Console",
      value: impressions.toLocaleString(),
      what: "How many times your pages showed up in Google results.",
      why: "The top of the chain: more impressions means more chances to be found.",
    },
    {
      id: "clicks",
      label: "Clicks",
      source: "Search Console",
      value: clicks.toLocaleString(),
      sub: ctr ? `${ctr} click-through` : undefined,
      what: "How many times someone clicked your result in Google.",
      why: "Low clicks vs. impressions means titles and descriptions aren’t compelling enough.",
    },
    {
      id: "sessions",
      label: "Sessions",
      source: "GA4",
      value: sessions.toLocaleString(),
      what: "Visits to your site from every source (search, direct, social, ads…).",
      why: "Compare with clicks: if sessions are far lower, people leave before the page loads or tracking is missing.",
    },
    {
      id: "engaged",
      label: "Engaged",
      source: "GA4",
      value: engaged.toLocaleString(),
      sub: engagement ? `${engagement} of sessions` : undefined,
      what: "Visits that lasted 10+ seconds, viewed 2+ pages or converted.",
      why: "Separates real interest from bounces. Low engagement points at the landing page, not the traffic.",
    },
    {
      id: "conversions",
      label: "Conversions",
      source: "GA4",
      value: conversions.toLocaleString(),
      sub: convRate ? `${convRate} of sessions` : undefined,
      what: "Key events completed, like a lead form or a purchase.",
      why: "The outcome the whole chain exists for. Track this to judge whether any change worked.",
    },
    {
      id: "ads-spend",
      label: "Ads spend",
      source: "Google Ads",
      value:
        adsSpend != null && adsSpend > 0
          ? adsSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })
          : "—",
      sub: cpl,
      what: "Money spent on Google Ads in this window.",
      why: "Compare against conversions to see what each lead costs you.",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"
      aria-label="Key metrics"
    >
      {tiles.map((t, i) => (
        <motion.div
          key={t.id}
          className="flex min-w-0 flex-col justify-between gap-3 rounded-[14px] border border-solid border-surface bg-surface-3 p-4"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_OUT, delay: i * 0.04 }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-medium text-muted-foreground">
              {t.label}
            </span>
            <InfoTip what={t.what} why={t.why} label={`What is ${t.label}?`} />
          </div>
          <div>
            <p className="text-2xl leading-7 font-medium tracking-tight tabular-nums text-foreground">
              {t.value}
            </p>
            <p className="mt-1 min-h-4 text-[11px] leading-4 text-muted-foreground">
              {t.sub ?? t.source}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
