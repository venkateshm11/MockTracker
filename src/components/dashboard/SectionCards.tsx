import React from 'react';
import { TrendBadge } from '../ui/TrendBadge';
import { useApp } from '../../context/AppContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { SECTION_CONFIGS } from '../../constants/sections';
import { formatScore, formatPercent } from '../../utils/formatters';
import { calculateSectionStats } from '../../utils/calculations';
import { TrendStatus } from '../../types/mock';

export function SectionCards() {
  const { mocks, selectedExam, selectedTestSeries, isAllExams } = useApp();
  const { sorted, sectionTrends } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);

  if (sorted.length === 0) return null;

  const latestMock = sorted[sorted.length - 1];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {SECTION_CONFIGS.map(({ key, label, color }) => {
        const sec = latestMock.sections[key];
        if (!sec) return null;
        const stats = calculateSectionStats(sec);

        // Best score for section
        const bestScore = Math.max(...sorted.map((m) => m.sections[key]?.marks ?? 0));
        const avgScore =
          sorted.reduce((s, m) => s + (m.sections[key]?.marks ?? 0), 0) / sorted.length;

        const trend = (sectionTrends[key] ?? 'insufficient') as TrendStatus;

        return (
          <div
            key={key}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {label}
                </h4>
              </div>
              <TrendBadge trend={trend} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-slate-400">Latest Score</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{formatScore(sec.marks)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Best Score</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatScore(bestScore)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Accuracy</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatPercent(stats.accuracy)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Attempts</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {sec.attempted}/{sec.questions}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">Avg Score</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatScore(avgScore)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
