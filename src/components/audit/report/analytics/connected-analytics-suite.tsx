"use client";

import { AnalyticsConversionPeak } from "@/components/audit/report/analytics/analytics-conversion-peak";
import { AnalyticsDetailTables } from "@/components/audit/report/analytics/analytics-detail-tables";
import type {
  AnalyticsPeakCell,
  AnalyticsTableRow,
} from "@/lib/audit/connected-analytics";

export type ConnectedAnalyticsDetailTables = {
  sources: AnalyticsTableRow[];
  countries: AnalyticsTableRow[];
  devices: AnalyticsTableRow[];
  browsers: AnalyticsTableRow[];
  pages: AnalyticsTableRow[];
  events: AnalyticsTableRow[];
};

/** GA4 breakdown tables + conversion timing. (KPIs and funnels live in their own sections.) */
export function ConnectedAnalyticsSuite({
  detailTables,
  peakCells,
}: {
  detailTables: ConnectedAnalyticsDetailTables;
  peakCells: AnalyticsPeakCell[];
}) {
  return (
    <div className="space-y-6">
      <AnalyticsDetailTables {...detailTables} />
      <AnalyticsConversionPeak cells={peakCells} />
    </div>
  );
}
