'use client';

import { useReducedMotion } from 'motion/react';
import { Pie, PieChart } from 'recharts';
import { SCORE_BANDS, type ScoreBandId } from '@/lib/aeo/score-bands';
import type { AeoScanSummary } from '@/lib/aeo/summarize-scans';

export const BAND_NAMES: Record<ScoreBandId, string> = {
  low: 'Hard to quote',
  mid: 'Needs work',
  good: 'Good',
  high: 'Strong',
};

/** Donut of pages per score band, with the average score in the centre. Display only. */
export function AEOScoreDistributionChart({ summary }: { summary: AeoScanSummary }) {
  const reduced = useReducedMotion();

  const data = summary.bands.map((band, index) => ({
    name: BAND_NAMES[SCORE_BANDS[index].id],
    value: band.count,
    fill: SCORE_BANDS[index].fill,
  }));

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[200px]"
      role="img"
      aria-label={`AEO score ${summary.averageScore} out of 100. ${data
        .map((d) => `${d.name}: ${d.value} pages`)
        .join(', ')}`}
    >
      <PieChart
        responsive
        accessibilityLayer={false}
        style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
        className="[&_*]:outline-none"
        aria-hidden
      >
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="72%"
          outerRadius="100%"
          paddingAngle={summary.pageCount > 0 ? 3 : 0}
          cornerRadius={4}
          stroke="none"
          startAngle={90}
          endAngle={-270}
          isAnimationActive={!reduced}
          animationDuration={700}
          animationEasing="ease-out"
        />
      </PieChart>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[44px] font-bold leading-none tracking-tight text-foreground tabular-nums">
          {summary.averageScore}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">AEO score</span>
      </div>
    </div>
  );
}
