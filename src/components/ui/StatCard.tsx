import React, { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  valueClassName?: string;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  valueClassName = '',
  className = '',
  trend,
}: StatCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
      ? 'text-red-600 dark:text-red-400'
      : '';

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 ${className}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}
        </p>
        {icon && <span className="text-slate-400 dark:text-slate-500">{icon}</span>}
      </div>
      <p
        className={`mt-1 text-2xl font-bold text-slate-900 dark:text-white ${valueClassName} ${trendColor}`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
