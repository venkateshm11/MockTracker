import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useAnalytics } from '../../hooks/useAnalytics';

interface ScoreTrendChartProps {
  title?: string;
  dataKey?: string;
  color?: string;
  yLabel?: string;
  showAvgLine?: boolean;
}

export function ScoreTrendChart({
  title = 'Overall Score Trend',
  dataKey = 'score',
  color = '#6366f1',
  yLabel = 'Score',
  showAvgLine = false,
}: ScoreTrendChartProps) {
  const { mocks, selectedExam, selectedTestSeries, isAllExams } = useApp();
  const { chartData, avgScore } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);

  const theme =
    document.documentElement.classList.contains('dark') ? 'dark' : 'light';

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis
            dataKey="mockNum"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => `M${v}`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--tooltip-bg, #fff)',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: unknown) => [Number(value).toFixed(2), yLabel]}
            labelFormatter={(label) => `Mock ${label}`}
          />
          {showAvgLine && avgScore !== null && (
            <ReferenceLine
              y={avgScore}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{ value: 'Avg', fontSize: 10, fill: '#f59e0b' }}
            />
          )}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
