'use client';

import { useState } from 'react';
import { AnalyticsConversionPeak } from '@/components/audit/report/analytics/analytics-conversion-peak';
import { AnalyticsDetailTables } from '@/components/audit/report/analytics/analytics-detail-tables';
import { AnalyticsDimensionGrid } from '@/components/audit/report/analytics/analytics-dimension-grid';
import { AnalyticsKpiRow } from '@/components/audit/report/analytics/analytics-kpi-row';
import { AnalyticsPathFunnel } from '@/components/audit/report/analytics/analytics-path-funnel';
import type { AnalyticsBarRow, AnalyticsKpiTile, AnalyticsTableRow } from '@/lib/audit/connected-analytics';
import type { AnalyticsPeakCell, AnalyticsFunnelStepView } from '@/lib/audit/connected-analytics';
import type { AnalyticsRowKind } from '@/lib/audit/connected-analytics';

type DimensionCard = {
  title: string;
  rows: AnalyticsBarRow[];
  empty: string;
  kind: AnalyticsRowKind;
};

/**
 * Collapsed commodity Google dimensions — available for trust, not the primary story.
 */
export function JoinedRawGoogleDisclosure({
  kpis,
  dimensionCards,
  detailTables,
  peakCells,
  funnelSteps,
}: {
  kpis: AnalyticsKpiTile[];
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
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-[14px] border border-solid border-surface bg-surface-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:border-zinc-300"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-medium">How Google saw it (raw)</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Optional GA4/GSC dimension views — same silos you’d see in Google’s own tools.
          </p>
        </div>
        <span className="text-sm font-medium text-muted-foreground">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open ? (
        <div className="space-y-8 border-t border-surface-6 px-5 py-5">
          <AnalyticsKpiRow tiles={kpis} />
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
        </div>
      ) : null}
    </div>
  );
}
