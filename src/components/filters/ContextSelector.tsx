import React, { useEffect, useMemo } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PREDEFINED_EXAMS, PREDEFINED_TEST_SERIES, ALL_EXAMS_OPTION } from '../../constants/exams';

interface ContextSelectorProps {
  showCount?: boolean;
}

export function ContextSelector({ showCount = true }: ContextSelectorProps) {
  const {
    mocks,
    selectedExam,
    selectedTestSeries,
    isAllExams,
    setSelectedExam,
    setSelectedTestSeries,
    setIsAllExams,
    settings,
  } = useApp();

  // Build exam options
  const examOptions = useMemo(() => {
    const predefined = PREDEFINED_EXAMS.map((e) => e.name);
    const custom = settings.customExams.filter((e) => !predefined.includes(e));
    return [...predefined, ...custom];
  }, [settings.customExams]);

  // Build test series options for selected exam
  const testSeriesOptions = useMemo(() => {
    if (!selectedExam) return [];
    const predefined = PREDEFINED_TEST_SERIES[selectedExam] ?? [];
    const custom = settings.customTestSeries[selectedExam] ?? [];
    const all = [...predefined, ...custom.filter((s) => !predefined.includes(s))];
    return all;
  }, [selectedExam, settings.customTestSeries]);

  // Count mocks in current context
  const mockCount = useMemo(() => {
    if (isAllExams) return mocks.length;
    return mocks.filter(
      (m) => m.exam === selectedExam && m.testSeries === selectedTestSeries
    ).length;
  }, [mocks, selectedExam, selectedTestSeries, isAllExams]);

  // Auto-select first test series when exam changes
  useEffect(() => {
    if (isAllExams) return;
    if (!selectedExam) return;
    if (selectedTestSeries && testSeriesOptions.includes(selectedTestSeries)) return;
    setSelectedTestSeries(testSeriesOptions[0] ?? null);
  }, [selectedExam, testSeriesOptions]);

  const handleExamChange = (val: string) => {
    if (val === ALL_EXAMS_OPTION) {
      setIsAllExams(true);
    } else {
      setIsAllExams(false);
      setSelectedExam(val);
    }
  };

  const examSelectValue = isAllExams ? ALL_EXAMS_OPTION : (selectedExam ?? '');

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
      <div className="flex flex-wrap gap-4">
        {/* Exam Selector */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            Exam
          </label>
          <div className="relative">
            <select
              id="exam-selector"
              value={examSelectValue}
              onChange={(e) => handleExamChange(e.target.value)}
              className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Select exam"
            >
              <option value="">Select Exam</option>
              {examOptions.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
              <option value={ALL_EXAMS_OPTION}>— All Exams —</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Test Series Selector */}
        {!isAllExams && (
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Test Series
            </label>
            <div className="relative">
              <select
                id="test-series-selector"
                value={selectedTestSeries ?? ''}
                onChange={(e) => setSelectedTestSeries(e.target.value)}
                disabled={!selectedExam || testSeriesOptions.length === 0}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                aria-label="Select test series"
              >
                <option value="">Select Series</option>
                {testSeriesOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {isAllExams && (
          <div className="flex items-end">
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
              <Globe size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-medium text-amber-700 dark:text-amber-400">All Exams Combined</span>
            </div>
          </div>
        )}
      </div>

      {showCount && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{mockCount}</span>{' '}
            {mockCount === 1 ? 'mock' : 'mocks'} recorded
            {isAllExams && ' across all exams'}
            {!isAllExams && selectedExam && selectedTestSeries && (
              <> for <span className="font-medium text-slate-600 dark:text-slate-300">{selectedExam} → {selectedTestSeries}</span></>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
