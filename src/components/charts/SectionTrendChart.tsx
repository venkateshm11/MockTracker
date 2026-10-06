import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { SECTION_CONFIGS } from '../../constants/sections';
import { Select } from '../ui/FormControls';
import { formatTime } from '../../utils/formatters';

type SectionOption = 'overall' | 'english' | 'numerical' | 'reasoning';
type MetricOption = 'score' | 'accuracy' | 'attempted' | 'attemptRate' | 'time';

const sectionOptions = [
  { value: 'overall', label: 'Overall' },
  { value: 'english', label: 'English' },
  { value: 'numerical', label: 'Numerical Ability' },
  { value: 'reasoning', label: 'Reasoning Ability' },
];

const metricOptions = [
  { value: 'score', label: 'Score' },
  { value: 'accuracy', label: 'Accuracy (%)' },
  { value: 'attempted', label: 'Attempts' },
  { value: 'attemptRate', label: 'Attempt Rate (%)' },
  { value: 'time', label: 'Time' },
];

function getDataKey(section: SectionOption, metric: MetricOption): string {
  if (section === 'overall') return metric;
  if (metric === 'score') return `${section}_score`;
  if (metric === 'accuracy') return `${section}_accuracy`;
  if (metric === 'attempted') return `${section}_attempted`;
  if (metric === 'attemptRate') return `${section}_attemptRate`;
  if (metric === 'time') return `${section}_timeSeconds`;
  return metric;
}

function getColor(section: SectionOption): string {
  const config = SECTION_CONFIGS.find((s) => s.key === section);
  return config?.color ?? '#6366f1';
}

export function SectionTrendChart() {
  const [section, setSection] = useState<SectionOption>('overall');
  const [metric, setMetric] = useState<MetricOption>('score');
  const { mocks, selectedExam, selectedTestSeries, isAllExams } = useApp();
  const { chartData } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);

  const dataKey = getDataKey(section, metric);
  const color = section === 'overall' ? '#6366f1' : getColor(section);

  const formattedData = useMemo(() => chartData, [chartData]);

  if (chartData.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Section Performance Trend</h3>
        <p className="text-sm text-slate-400 text-center py-8">No data yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Section Performance Trend</h3>
      <div className="flex flex-wrap gap-3 mb-4">
        <Select
          id="section-select"
          label="Section"
          value={section}
          onChange={(v) => setSection(v as SectionOption)}
          options={sectionOptions}
          className="min-w-[160px] flex-1"
        />
        <Select
          id="metric-select"
          label="Metric"
          value={metric}
          onChange={(v) => setMetric(v as MetricOption)}
          options={metricOptions}
          className="min-w-[160px] flex-1"
        />
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={formattedData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
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
            tickFormatter={metric === 'time' ? (v) => formatTime(v) : undefined}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--tooltip-bg, #fff)',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(val: unknown) => {
              const value = Number(val) || 0;
              if (metric === 'time') return [formatTime(value), 'Time'];
              if (metric === 'accuracy' || metric === 'attemptRate') return [`${value.toFixed(1)}%`, metricOptions.find((m) => m.value === metric)?.label ?? metric];
              return [value.toFixed(2), metricOptions.find((m) => m.value === metric)?.label ?? metric];
            }}
            labelFormatter={(label) => `Mock ${label}`}
          />
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
