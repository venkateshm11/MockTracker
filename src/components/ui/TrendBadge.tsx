import React from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { TrendStatus } from '../../types/mock';

interface TrendBadgeProps {
  trend: TrendStatus;
  className?: string;
}

const configs: Record<TrendStatus, { label: string; icon: React.ReactNode; classes: string }> = {
  improving: {
    label: 'Improving',
    icon: <TrendingUp size={12} />,
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  declining: {
    label: 'Declining',
    icon: <TrendingDown size={12} />,
    classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  stable: {
    label: 'Stable',
    icon: <Minus size={12} />,
    classes: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  },
  insufficient: {
    label: 'Insufficient Data',
    icon: <AlertCircle size={12} />,
    classes: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-500',
  },
};

export function TrendBadge({ trend, className = '' }: TrendBadgeProps) {
  const config = configs[trend];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.classes} ${className}`}
      role="status"
      aria-label={`Trend: ${config.label}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
