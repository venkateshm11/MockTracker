import React from 'react';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { TrendStatus } from '../../types/mock';

interface TrendBadgeProps {
  trend: TrendStatus;
  className?: string;
  count?: number;
  label?: string;
}

const configs: Record<TrendStatus, { label: string; icon: React.ReactNode; classes: string; title: string }> = {
  improving: {
    label: 'Improving',
    icon: <TrendingUp size={12} />,
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    title: 'Performance is trending upward compared to earlier mocks',
  },
  declining: {
    label: 'Declining',
    icon: <TrendingDown size={12} />,
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    title: 'Performance is trending downward compared to earlier mocks',
  },
  stable: {
    label: 'Stable',
    icon: <Minus size={12} />,
    classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    title: 'Performance is consistent with earlier mocks',
  },
  insufficient: {
    label: 'Needs 2+ Mocks',
    icon: <Info size={12} />,
    classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
    title: 'Trend tracking requires at least 2 mocks to compare performance over time',
  },
};

export function TrendBadge({ trend, className = '', count, label }: TrendBadgeProps) {
  const config = configs[trend];

  let displayLabel = label || config.label;
  if (!label && trend === 'insufficient') {
    if (count === 1) {
      displayLabel = '1st Mock (Baseline)';
    } else if (count === 0) {
      displayLabel = 'No Mocks';
    } else {
      displayLabel = 'Needs 2+ Mocks';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-help ${config.classes} ${className}`}
      role="status"
      title={config.title}
      aria-label={`Trend: ${displayLabel}`}
    >
      {config.icon}
      {displayLabel}
    </span>
  );
}

