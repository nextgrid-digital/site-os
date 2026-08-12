export function AnalyticsPerformanceEmpty() {
  return (
    <div className="rounded-[14px] bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-zinc-950">Performance</p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
        Core Web Vitals (LCP, INP, CLS, TTFB, FCP) are not available from Search Console or GA4.
        Connect CrUX or RUM later to populate this section — no sample values are shown here.
      </p>
    </div>
  );
}
