import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { ContextSelector } from '../components/filters/ContextSelector';
import { Select } from '../components/ui/FormControls';
import { EmptyState } from '../components/ui/EmptyState';
import { SECTION_CONFIGS } from '../constants/sections';
import { calculateOverall, calculateSectionStats, sortMocksByNumber } from '../utils/calculations';
import { formatScore, formatPercent, formatTime, formatImprovement, formatDate } from '../utils/formatters';
import { GitCompare, ArrowRight } from 'lucide-react';

function DiffCell({
  a,
  b,
  format: fmt = 'number',
}: {
  a: number;
  b: number;
  format?: 'number' | 'percent' | 'time';
}) {
  const diff = b - a;
  const isPositive = diff > 0;
  const isZero = Math.abs(diff) < 0.001;

  const formatVal = (v: number) => {
    if (fmt === 'percent') return formatPercent(v);
    if (fmt === 'time') return formatTime(v);
    return formatScore(v);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-500">{formatVal(a)}</span>
      <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{formatVal(b)}</span>
      {!isZero && (
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isPositive ? '+' : ''}{formatVal(diff)}
          {fmt === 'percent' ? ' pp' : ''}
        </span>
      )}
    </div>
  );
}

export default function ComparePage() {
  const { mocks, selectedExam, selectedTestSeries, isAllExams } = useApp();
  const [mockAId, setMockAId] = useState('');
  const [mockBId, setMockBId] = useState('');

  const { contextMocks } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);
  const sortedContext = useMemo(() => sortMocksByNumber(contextMocks), [contextMocks]);

  const mockOptions = useMemo(() =>
    sortedContext.map((m) => ({
      value: m.id,
      label: `Mock #${m.mockNumber} (${formatDate(m.date)})`,
    })),
    [sortedContext]
  );

  const mockA = sortedContext.find((m) => m.id === mockAId);
  const mockB = sortedContext.find((m) => m.id === mockBId);

  const overallA = mockA ? calculateOverall(mockA.sections) : null;
  const overallB = mockB ? calculateOverall(mockB.sections) : null;

  const isContextReady = isAllExams || (!!selectedExam && !!selectedTestSeries);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compare Mocks</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Compare two mocks side by side</p>
      </div>

      <ContextSelector />

      {!isContextReady ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
          <p className="text-sm text-slate-500">Select an exam and test series to compare mocks.</p>
        </div>
      ) : sortedContext.length < 2 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <EmptyState
            title="Need at least 2 mocks"
            description="Add more mocks to this test series to compare performance."
            icon={<GitCompare size={40} />}
          />
        </div>
      ) : (
        <>
          {/* Mock selectors */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                id="mock-a-select"
                label="Mock A (Base)"
                value={mockAId}
                onChange={setMockAId}
                options={[{ value: '', label: 'Select mock...' }, ...mockOptions]}
              />
              <Select
                id="mock-b-select"
                label="Mock B (Compare)"
                value={mockBId}
                onChange={(v) => { if (v !== mockAId) setMockBId(v); }}
                options={[{ value: '', label: 'Select mock...' }, ...mockOptions.filter((o) => o.value !== mockAId)]}
              />
            </div>
          </div>

          {/* Comparison */}
          {mockA && mockB && overallA && overallB && (
            <>
              {/* Headers */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                  <p className="text-xs text-indigo-500/70 font-medium uppercase tracking-wide">Mock A</p>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300">#{mockA.mockNumber}</p>
                  <p className="text-xs text-indigo-500/70">{formatDate(mockA.date)}</p>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-2xl font-light text-slate-300">vs</span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                  <p className="text-xs text-emerald-500/70 font-medium uppercase tracking-wide">Mock B</p>
                  <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">#{mockB.mockNumber}</p>
                  <p className="text-xs text-emerald-500/70">{formatDate(mockB.date)}</p>
                </div>
              </div>

              {/* Overall comparison */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Overall</h3>
                {[
                  { label: 'Score', a: overallA.marks, b: overallB.marks },
                  { label: 'Accuracy', a: overallA.accuracy, b: overallB.accuracy, format: 'percent' as const },
                  { label: 'Attempt Rate', a: overallA.attemptRate, b: overallB.attemptRate, format: 'percent' as const },
                  { label: 'Attempted', a: overallA.attempted, b: overallB.attempted },
                  { label: 'Correct', a: overallA.correct, b: overallB.correct },
                  { label: 'Wrong', a: overallA.wrong, b: overallB.wrong },
                  { label: 'Time', a: overallA.timeSeconds, b: overallB.timeSeconds, format: 'time' as const },
                ].map(({ label, a, b, format: fmt }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400 w-28">{label}</span>
                    <DiffCell a={a} b={b} format={fmt} />
                  </div>
                ))}
              </div>

              {/* Section comparisons */}
              {SECTION_CONFIGS.map(({ key, label, color }) => {
                const secA = mockA.sections[key];
                const secB = mockB.sections[key];
                if (!secA || !secB) return null;
                const statsA = calculateSectionStats(secA);
                const statsB = calculateSectionStats(secB);
                return (
                  <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</h3>
                    </div>
                    {[
                      { label: 'Score', a: secA.marks, b: secB.marks },
                      { label: 'Accuracy', a: statsA.accuracy, b: statsB.accuracy, format: 'percent' as const },
                      { label: 'Attempted', a: secA.attempted, b: secB.attempted },
                      { label: 'Correct', a: secA.correct, b: secB.correct },
                      { label: 'Wrong', a: secA.wrong, b: secB.wrong },
                      { label: 'Attempt Rate', a: statsA.attemptRate, b: statsB.attemptRate, format: 'percent' as const },
                      { label: 'Time', a: secA.timeSeconds, b: secB.timeSeconds, format: 'time' as const },
                    ].map(({ label: l, a, b, format: fmt }) => (
                      <div key={l} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                        <span className="text-sm text-slate-500 dark:text-slate-400 w-28">{l}</span>
                        <DiffCell a={a} b={b} format={fmt} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
}
