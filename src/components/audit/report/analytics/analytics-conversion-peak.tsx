"use client";

import { useMemo } from "react";
import ConversionPeakHeatmap from "@/components/marketing/site-os/components/conversion-peak-heatmap";
import { InfoTip } from "@/components/audit/dashboard/info-tip";
import type { AnalyticsPeakCell } from "@/lib/audit/connected-analytics";

/** Same heatmap as the landing page, fed with GA4 conversions by weekday × hour. */
export function AnalyticsConversionPeak({
  cells,
}: {
  cells: AnalyticsPeakCell[];
}) {
  const matrix = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
    for (const c of cells) {
      if (grid[c.dayOfWeek] && c.hour >= 0 && c.hour < 24)
        grid[c.dayOfWeek][c.hour] = c.conversions;
    }
    return grid;
  }, [cells]);

  return (
    <div className="min-w-0 rounded-xl bg-raised p-3 shadow-sm sm:p-5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">Conversion peak</p>
        <InfoTip
          what="A weekday × hour grid. Darker squares are the times when more visitors completed a conversion (a GA4 key event, e.g. a lead form)."
          why="Schedule campaigns, emails and support coverage around the dark squares; avoid spending in the empty hours."
        />
      </div>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        When visitors convert, by day of week and hour (GA4 property time).
      </p>
      {cells.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No conversion timing data yet. Re-run a full audit with GA4 connected.
        </p>
      ) : (
        <div className="min-w-0">
          <ConversionPeakHeatmap
            events={matrix}
            unit={["conversion", "conversions"]}
            tz=""
          />
        </div>
      )}
    </div>
  );
}
