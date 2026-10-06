import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { formatDate, formatScore, formatPercent } from '../../utils/formatters';
import { calculateOverall } from '../../utils/calculations';
import { ChevronRight } from 'lucide-react';

export function RecentMocksTable() {
  const { mocks, selectedExam, selectedTestSeries, isAllExams } = useApp();
  const { recentMocks } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);
  const navigate = useNavigate();

  if (recentMocks.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recent Mocks</h3>
      </div>

      {/* Table header - desktop */}
      <div className="hidden sm:grid grid-cols-5 px-4 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-900/50">
        <div>Mock</div>
        <div>Date</div>
        <div>Score</div>
        <div>Accuracy</div>
        <div>Attempts</div>
      </div>

      {recentMocks.map((mock) => {
        const overall = calculateOverall(mock.sections);
        return (
          <button
            key={mock.id}
            onClick={() => navigate(`/mocks/${mock.id}`)}
            className="w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            aria-label={`View Mock ${mock.mockNumber} details`}
          >
            {/* Desktop row */}
            <div className="hidden sm:grid grid-cols-5 items-center px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Mock #{mock.mockNumber}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                  mock.stage === 'mains'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                }`}>
                  {mock.stage === 'mains' ? 'Mains' : 'Prelims'}
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{formatDate(mock.date)}</div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white">{formatScore(overall.marks)}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{formatPercent(overall.accuracy)}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">{overall.attempted}/{overall.questions}</div>
            </div>

            {/* Mobile card */}
            <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  Mock #{mock.mockNumber}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    mock.stage === 'mains'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {mock.stage === 'mains' ? 'Mains' : 'Prelims'}
                  </span>
                  <span className="text-xs font-normal text-slate-400">{formatDate(mock.date)}</span>
                </p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{formatScore(overall.marks)}</span>
                  <span className="text-xs text-slate-500">{formatPercent(overall.accuracy)}</span>
                  <span className="text-xs text-slate-500">{overall.attempted} attempts</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300" />
            </div>
          </button>
        );
      })}

      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={() => navigate('/mocks')}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
        >
          View all mocks →
        </button>
      </div>
    </div>
  );
}
