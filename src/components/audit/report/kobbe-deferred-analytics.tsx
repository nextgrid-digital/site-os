'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ConnectedAnalyticsSuite,
  type ConnectedAnalyticsDetailTables,
  type ConnectedAnalyticsDimensionCard,
} from '@/components/audit/report/analytics/connected-analytics-suite';
import { SectionHeading } from '@/components/audit/report/section-heading';
import type {
  AnalyticsFunnelStepView,
  AnalyticsKpiTile,
  AnalyticsPeakCell,
} from '@/lib/audit/connected-analytics';

export function KobbeDeferredAnalytics({
  analyticsKpis,
  dimensionCards,
  detailTables,
  peakCells,
  funnelSteps,
}: {
  analyticsKpis: AnalyticsKpiTile[];
  dimensionCards: ConnectedAnalyticsDimensionCard[];
  detailTables: ConnectedAnalyticsDetailTables;
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
          <ConnectedAnalyticsSuite
            kpis={analyticsKpis}
            dimensionCards={dimensionCards}
            detailTables={detailTables}
            peakCells={peakCells}
            funnelSteps={funnelSteps}
            showPerformanceEmpty
          />
        ) : (
          <div className="h-64 animate-pulse rounded-2xl bg-zinc-100" aria-hidden />
        )}
      </div>
    </section>
  );
}
