'use client';

import { AnalyticsConversionPeak } from '@/components/audit/report/analytics/analytics-conversion-peak';
import { AnalyticsDetailTables } from '@/components/audit/report/analytics/analytics-detail-tables';
import { AnalyticsDimensionGrid } from '@/components/audit/report/analytics/analytics-dimension-grid';
import { AnalyticsKpiRow } from '@/components/audit/report/analytics/analytics-kpi-row';
import { AnalyticsPathFunnel } from '@/components/audit/report/analytics/analytics-path-funnel';
import { AnalyticsPerformanceEmpty } from '@/components/audit/report/analytics/analytics-performance-empty';
import type {
  AnalyticsBarRow,
  AnalyticsFunnelStepView,
  AnalyticsKpiTile,
  AnalyticsPeakCell,
  AnalyticsRowKind,
  AnalyticsTableRow,
} from '@/lib/audit/connected-analytics';

export type ConnectedAnalyticsDimensionCard = {
  title: string;
  rows: AnalyticsBarRow[];
  empty: string;
  kind: AnalyticsRowKind;
};

export type ConnectedAnalyticsDetailTables = {
  sources: AnalyticsTableRow[];
  countries: AnalyticsTableRow[];
  devices: AnalyticsTableRow[];
  browsers: AnalyticsTableRow[];
  pages: AnalyticsTableRow[];
  events: AnalyticsTableRow[];
};

/**
 * Shared always-visible GA4 / GSC analytics block (KPIs → charts → tables → peak → funnel).
 */
export function ConnectedAnalyticsSuite({
  kpis,
  dimensionCards,
  detailTables,
  peakCells,
  funnelSteps,
  showPerformanceEmpty = false,
}: {
  kpis: AnalyticsKpiTile[];
  dimensionCards: ConnectedAnalyticsDimensionCard[];
  detailTables: ConnectedAnalyticsDetailTables;
  peakCells: AnalyticsPeakCell[];
  funnelSteps: AnalyticsFunnelStepView[];
  showPerformanceEmpty?: boolean;
}) {
  return (
    <div className="space-y-10">
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
      {showPerformanceEmpty ? <AnalyticsPerformanceEmpty /> : null}
    </div>
  );
}
