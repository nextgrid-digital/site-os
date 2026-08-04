'use client';

import { useEffect, useRef, useState } from 'react';
import { AnalyticsConversionPeak } from '@/components/audit/report/analytics/analytics-conversion-peak';
import { AnalyticsDetailTables } from '@/components/audit/report/analytics/analytics-detail-tables';
import { AnalyticsDimensionGrid } from '@/components/audit/report/analytics/analytics-dimension-grid';
import { AnalyticsKpiRow } from '@/components/audit/report/analytics/analytics-kpi-row';
import { AnalyticsPathFunnel } from '@/components/audit/report/analytics/analytics-path-funnel';
import { AnalyticsPerformanceEmpty } from '@/components/audit/report/analytics/analytics-performance-empty';
import { SectionHeading } from '@/components/audit/report/section-heading';
import type { AnalyticsBarRow, AnalyticsKpiTile, AnalyticsTableRow } from '@/lib/audit/connected-analytics';
import type { AnalyticsPeakCell, AnalyticsFunnelStepView } from '@/lib/audit/connected-analytics';

type DimensionCard = {
  title: string;
  kind: 'page' | 'source' | 'country' | 'device' | 'search' | 'event';
  rows: AnalyticsBarRow[];
  empty: string;
};

export function KobbeDeferredAnalytics({
  analyticsKpis,
  dimensionCards,
  detailTables,
  peakCells,
  funnelSteps,
}: {
  analyticsKpis: AnalyticsKpiTile[];
  dimensionCards: DimensionCard[];
  detailTables: {
    sources: AnalyticsTableRow[];
    countries: AnalyticsTableRow[];
    devices: AnalyticsTableRow[];
    browsers: AnalyticsTableRow[];
    pages: AnalyticsTableRow[];
    events: AnalyticsTableRow[];
  };
  peakCells: AnalyticsPeakCell[];
  funnelSteps: AnalyticsFunnelStepView[];
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="block pt-4">
      <div className="mx-auto max-w-280 space-y-10 px-8 py-12">
        <SectionHeading
          title="Traffic and search evidence"
          lead="Real GA4 and Search Console numbers from this audit run. For the joined Search → visit → outcome story, open the Journey tab."
        />
        {visible ? (
          <>
            <AnalyticsKpiRow tiles={analyticsKpis} />
            <AnalyticsDimensionGrid cards={dimensionCards} />
            <AnalyticsDetailTables
              sources={detailTables.sources}
              countries={detailTables.countries}
              devices={detailTables.devices}
              browsers={detailTables.browsers}
              pages={detailTables.pages}
              events={detailTables.events}
            />
            <AnalyticsConversionPeak cells={peakCells} />
            <AnalyticsPathFunnel steps={funnelSteps} />
            <AnalyticsPerformanceEmpty />
          </>
        ) : (
          <div className="h-64 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" aria-hidden />
        )}
      </div>
    </section>
  );
}
