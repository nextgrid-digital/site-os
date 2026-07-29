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

export interface ChartDatum {
  name: string;
  value: number;
  secondary?: number;
}

interface DashboardChartProps {
  data: ChartDatum[];
  valueKey?: 'value' | 'secondary';
  secondaryKey?: boolean;
  valueLabel?: string;
  secondaryLabel?: string;
  emptyLabel?: string;
  height?: number;
}

export function DashboardChart({
  data,
  secondaryKey = false,
  valueLabel = 'Value',
  secondaryLabel = 'Secondary',
  emptyLabel = 'No chart data yet.',
  height = 280,
}: DashboardChartProps) {
  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 text-sm text-zinc-500"
        style={{ height }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#71717a' }}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={56}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e4e4e7',
              background: '#fff',
              fontSize: 12,
            }}
            formatter={(value, name) => {
              const n = typeof value === 'number' ? value : Number(value);
              const label = name === 'secondary' ? secondaryLabel : valueLabel;
              return [Number.isFinite(n) ? n : value, label];
            }}
          />
          <Bar dataKey="value" name={valueLabel} fill="#18181b" radius={[4, 4, 0, 0]} />
          {secondaryKey ? (
            <Bar dataKey="secondary" name={secondaryLabel} fill="#a1a1aa" radius={[4, 4, 0, 0]} />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
