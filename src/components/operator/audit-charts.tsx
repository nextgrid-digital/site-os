'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { QueryMetric } from '@/lib/supabase/types';

export function AuditCharts({
  queryMetrics,
  gscHasData,
}: {
  queryMetrics: QueryMetric[];
  gscHasData?: boolean;
}) {
  const hasData = gscHasData !== false && queryMetrics.length > 0;
  const chartData = queryMetrics
    .toSorted((a, b) => b.impressions - a.impressions)
    .slice(0, 8)
    .map((row) => ({
      name: row.query.length > 24 ? `${row.query.slice(0, 24)}…` : row.query,
      impressions: row.impressions,
      clicks: row.clicks,
      ctr: Number((row.ctr * 100).toFixed(2)),
    }));

  if (!hasData || chartData.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Search chart unavailable</p>
        <p>
          Missing Search Console volume. Site crawl, architecture, and AEO can still run. Connect
          GSC (or wait for impressions) to unlock this chart later.
        </p>
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            interval={0}
            angle={-25}
            textAnchor="end"
            height={70}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--background))',
              fontSize: 12,
            }}
          />
          <Bar dataKey="impressions" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="clicks" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
