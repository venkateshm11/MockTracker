import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { ContextSelector } from '../components/filters/ContextSelector';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/FormControls';
import { formatDate, formatScore, formatPercent } from '../utils/formatters';
import { calculateOverall } from '../utils/calculations';
import { Plus, Activity, ChevronRight } from 'lucide-react';
import { MockWithId } from '../types/mock';
import { Timestamp } from 'firebase/firestore';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function MockHistoryPage() {
  const { mocks, mocksLoading, selectedExam, selectedTestSeries, isAllExams } = useApp();
  const navigate = useNavigate();
  const [sort, setSort] = useState<SortOption>('newest');
  const [typeFilter, setTypeFilter] = useState<'all' | 'full' | 'sectional'>('all');

  const { contextMocks } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);

  const sortedMocks = useMemo(() => {
    let filtered = contextMocks;
    if (typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.testType === typeFilter);
    }
    const withOverall = filtered.map((m) => ({ mock: m, overall: calculateOverall(m.sections) }));

    switch (sort) {
      case 'newest':
        return [...withOverall].sort((a, b) => {
          const aDate = a.mock.date instanceof Timestamp ? a.mock.date.toDate() : new Date(a.mock.date);
          const bDate = b.mock.date instanceof Timestamp ? b.mock.date.toDate() : new Date(b.mock.date);
          return bDate.getTime() - aDate.getTime();
        });
      case 'oldest':
        return [...withOverall].sort((a, b) => {
          const aDate = a.mock.date instanceof Timestamp ? a.mock.date.toDate() : new Date(a.mock.date);
          const bDate = b.mock.date instanceof Timestamp ? b.mock.date.toDate() : new Date(b.mock.date);
          return aDate.getTime() - bDate.getTime();
        });
      case 'highest':
        return [...withOverall].sort((a, b) => b.overall.marks - a.overall.marks);
      case 'lowest':
        return [...withOverall].sort((a, b) => a.overall.marks - b.overall.marks);
    }
  }, [contextMocks, sort, typeFilter]);

  const isContextReady = isAllExams || (!!selectedExam && !!selectedTestSeries);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mock History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">All your recorded mocks</p>
        </div>
        <Button onClick={() => navigate('/add')} icon={<Plus size={16} />} size="sm" id="history-add-mock-btn">
          Add Mock
        </Button>
      </div>

      <ContextSelector />

      {!isContextReady ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
          <p className="text-sm text-slate-500">Select an exam and test series to view history.</p>
        </div>
      ) : mocksLoading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : contextMocks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <EmptyState
            title="No mocks recorded"
            description={
              isAllExams
                ? 'Add your first mock test to begin.'
                : `No mocks recorded for ${selectedExam} → ${selectedTestSeries} yet.`
            }
            action={
              <Button onClick={() => navigate('/add')} icon={<Plus size={16} />} id="history-empty-add-btn">
                Add Mock
              </Button>
            }
            icon={<Activity size={40} />}
          />
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3">
            <Select
              id="sort-filter"
              label="Sort"
              value={sort}
              onChange={(v) => setSort(v as SortOption)}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'highest', label: 'Highest Score' },
                { value: 'lowest', label: 'Lowest Score' },
              ]}
              className="min-w-[150px] flex-1"
            />
            <Select
              id="type-filter"
              label="Test Type"
              value={typeFilter}
              onChange={(v) => setTypeFilter(v as typeof typeFilter)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'full', label: 'Full Mock' },
                { value: 'sectional', label: 'Sectional Mock' },
              ]}
              className="min-w-[150px] flex-1"
            />
          </div>

          {/* Table - desktop */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="hidden sm:grid grid-cols-6 px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <div>Mock</div>
              <div>Date</div>
              <div>Type</div>
              <div>Score</div>
              <div>Accuracy</div>
              <div>Attempts</div>
            </div>

            {sortedMocks.map(({ mock, overall }) => (
              <button
                key={mock.id}
                onClick={() => navigate(`/mocks/${mock.id}`)}
                className="w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                aria-label={`View Mock ${mock.mockNumber} details`}
              >
                {/* Desktop row */}
                <div className="hidden sm:grid grid-cols-6 items-center px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                  <div>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      Mock #{mock.mockNumber}
                    </span>
                    {isAllExams && (
                      <p className="text-xs text-slate-400">{mock.exam}</p>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{formatDate(mock.date)}</div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      mock.stage === 'mains'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    }`}>
                      {mock.stage === 'mains' ? 'Mains' : 'Prelims'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      mock.testType === 'full'
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {mock.testType === 'full' ? 'Full' : 'Sectional'}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">{formatScore(overall.marks)}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{formatPercent(overall.accuracy)}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{overall.attempted}/{overall.questions}</div>
                </div>

                {/* Mobile card */}
                <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        Mock #{mock.mockNumber}
                      </p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        mock.stage === 'mains'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {mock.stage === 'mains' ? 'Mains' : 'Prelims'}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        mock.testType === 'full'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                      }`}>
                        {mock.testType === 'full' ? 'Full' : 'Sec.'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(mock.date)}</p>
                    <div className="flex gap-3 mt-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{formatScore(overall.marks)}</span>
                      <span className="text-xs text-slate-500">{formatPercent(overall.accuracy)}</span>
                      <span className="text-xs text-slate-500">{overall.attempted} att.</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-slate-400">
            Showing {sortedMocks.length} of {contextMocks.length} mocks
          </p>
        </>
      )}
    </div>
  );
}
