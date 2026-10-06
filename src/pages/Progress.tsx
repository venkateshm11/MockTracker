import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { ContextSelector } from '../components/filters/ContextSelector';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { SECTION_CONFIGS } from '../constants/sections';
import { calculateOverall, calculateSectionStats, calculateRollingAverage, calculateImprovement, calculateImprovementPercentage } from '../utils/calculations';
import { formatScore, formatPercent, formatImprovement, formatImprovementPercent } from '../utils/formatters';
import { Plus, Activity, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatRowProps {
  label: string;
  value: string | null;
  change?: string | null;
  isPositive?: boolean;
}

function StatRow({ label, value, change, isPositive }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-3">
        {change && (
          <span className={`text-xs font-medium ${
            isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {change}
          </span>
        )}
        <span className="text-sm font-semibold text-slate-900 dark:text-white min-w-[60px] text-right">
          {value ?? '—'}
        </span>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { mocks, mocksLoading, selectedExam, selectedTestSeries, isAllExams } = useApp();
  const navigate = useNavigate();

  const { contextMocks, sorted, last3Avg, last5Avg, last10Avg } = useAnalytics(
    mocks,
    selectedExam,
    selectedTestSeries,
    isAllExams
  );

  const hasData = sorted.length > 0;
  const isContextReady = isAllExams || (!!selectedExam && !!selectedTestSeries);

  const firstOverall = useMemo(() => sorted[0] ? calculateOverall(sorted[0].sections) : null, [sorted]);
  const latestOverall = useMemo(
    () => sorted[sorted.length - 1] ? calculateOverall(sorted[sorted.length - 1].sections) : null,
    [sorted]
  );
  const bestScore = useMemo(
    () => sorted.length > 0 ? Math.max(...sorted.map((m) => calculateOverall(m.sections).marks)) : null,
    [sorted]
  );
  const avgScore = useMemo(
    () => sorted.length > 0
      ? sorted.reduce((s, m) => s + calculateOverall(m.sections).marks, 0) / sorted.length
      : null,
    [sorted]
  );
  const bestAccuracy = useMemo(
    () => sorted.length > 0 ? Math.max(...sorted.map((m) => calculateOverall(m.sections).accuracy)) : null,
    [sorted]
  );
  const avgAccuracy = useMemo(
    () => sorted.length > 0
      ? sorted.reduce((s, m) => s + calculateOverall(m.sections).accuracy, 0) / sorted.length
      : null,
    [sorted]
  );
  const bestAttemptRate = useMemo(
    () => sorted.length > 0 ? Math.max(...sorted.map((m) => calculateOverall(m.sections).attemptRate)) : null,
    [sorted]
  );

  const scoreImprovement = firstOverall && latestOverall
    ? calculateImprovement(firstOverall.marks, latestOverall.marks)
    : null;
  const scorePct = firstOverall && latestOverall
    ? calculateImprovementPercentage(firstOverall.marks, latestOverall.marks)
    : null;
  const accuracyImprovement = firstOverall && latestOverall
    ? calculateImprovement(firstOverall.accuracy, latestOverall.accuracy)
    : null;
  const attemptRateImprovement = firstOverall && latestOverall
    ? calculateImprovement(firstOverall.attemptRate, latestOverall.attemptRate)
    : null;

  // Rolling averages - only show if enough data
  const rollingAvgs: { label: string; value: number | null }[] = [];
  if (sorted.length >= 3) rollingAvgs.push({ label: 'Last 3 Average', value: last3Avg });
  if (sorted.length >= 5) rollingAvgs.push({ label: 'Last 5 Average', value: last5Avg });
  if (sorted.length >= 10) rollingAvgs.push({ label: 'Last 10 Average', value: last10Avg });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Progress</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track your improvement over time</p>
      </div>

      <ContextSelector />

      {!isContextReady ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
          <p className="text-sm text-slate-500">Select an exam and test series to view progress.</p>
        </div>
      ) : mocksLoading ? (
        <div className="text-center py-8 text-slate-400">Loading...</div>
      ) : !hasData ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <EmptyState
            title="No data to show"
            description="Add your first mock to start tracking progress."
            action={
              <Button onClick={() => navigate('/add')} icon={<Plus size={16} />} id="progress-add-btn">
                Add Mock
              </Button>
            }
            icon={<TrendingUp size={40} />}
          />
        </div>
      ) : (
        <>
          {/* Baseline banner when only 1 mock recorded */}
          {sorted.length === 1 && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-indigo-950 dark:text-indigo-200">First mock recorded! (Baseline established)</p>
                <p className="text-indigo-700 dark:text-indigo-300 text-xs mt-0.5">
                  Showing baseline metrics from Mock #{sorted[0]?.mockNumber}. Progress deltas, improvement rates, and rolling averages will activate once you record Mock #2.
                </p>
              </div>
            </div>
          )}

          {/* Score progress */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Score</h3>
            <p className="text-xs text-slate-400 mb-3">{sorted.length} mock{sorted.length !== 1 ? 's' : ''} recorded</p>
            <StatRow label="First Mock Score" value={firstOverall ? formatScore(firstOverall.marks) : null} />
            <StatRow
              label="Latest Mock Score"
              value={latestOverall ? formatScore(latestOverall.marks) : null}
              change={sorted.length >= 2 && scoreImprovement !== null ? formatImprovement(scoreImprovement) : undefined}
              isPositive={scoreImprovement !== null && scoreImprovement >= 0}
            />
            <StatRow label="Best Score" value={bestScore !== null ? formatScore(bestScore) : null} />
            <StatRow label="Average Score" value={avgScore !== null ? formatScore(avgScore) : null} />
            {rollingAvgs.map(({ label, value }) => (
              <StatRow key={label} label={label} value={value !== null ? formatScore(value) : null} />
            ))}
            <StatRow
              label="Overall Improvement"
              value={sorted.length >= 2 && scoreImprovement !== null ? formatImprovement(scoreImprovement) : (sorted.length === 1 ? 'Baseline set' : null)}
              isPositive={scoreImprovement !== null && scoreImprovement >= 0}
            />
            <StatRow
              label="Improvement %"
              value={sorted.length >= 2 && scorePct !== null ? formatImprovementPercent(scorePct) : (sorted.length === 1 ? 'Baseline set' : null)}
              isPositive={scorePct !== null && scorePct >= 0}
            />
          </div>

          {/* Accuracy progress */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Accuracy</h3>
            <StatRow label="First Mock Accuracy" value={firstOverall ? formatPercent(firstOverall.accuracy) : null} />
            <StatRow
              label="Latest Mock Accuracy"
              value={latestOverall ? formatPercent(latestOverall.accuracy) : null}
              change={sorted.length >= 2 && accuracyImprovement !== null ? `${formatImprovement(accuracyImprovement)} pp` : undefined}
              isPositive={accuracyImprovement !== null && accuracyImprovement >= 0}
            />
            <StatRow label="Best Accuracy" value={bestAccuracy !== null ? formatPercent(bestAccuracy) : null} />
            <StatRow label="Average Accuracy" value={avgAccuracy !== null ? formatPercent(avgAccuracy) : null} />
          </div>

          {/* Attempt rate */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Attempt Rate</h3>
            <StatRow label="First Mock" value={firstOverall ? formatPercent(firstOverall.attemptRate) : null} />
            <StatRow
              label="Latest Mock"
              value={latestOverall ? formatPercent(latestOverall.attemptRate) : null}
              change={sorted.length >= 2 && attemptRateImprovement !== null ? `${formatImprovement(attemptRateImprovement)} pp` : undefined}
              isPositive={attemptRateImprovement !== null && attemptRateImprovement >= 0}
            />
            <StatRow label="Best" value={bestAttemptRate !== null ? formatPercent(bestAttemptRate) : null} />
          </div>

          {/* Section progress */}
          {SECTION_CONFIGS.map(({ key, label, color }) => {
            if (!sorted[0]?.sections[key]) return null;
            const firstSec = calculateSectionStats(sorted[0].sections[key]);
            const latestSec = calculateSectionStats(sorted[sorted.length - 1].sections[key]);
            const scoreChange = calculateImprovement(firstSec.marks, latestSec.marks);
            const accChange = calculateImprovement(firstSec.accuracy, latestSec.accuracy);
            const arChange = calculateImprovement(firstSec.attemptRate, latestSec.attemptRate);
            const bestSectionScore = Math.max(...sorted.map((m) => m.sections[key]?.marks ?? 0));

            return (
              <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</h3>
                </div>
                <StatRow label="First Score" value={formatScore(firstSec.marks)} />
                <StatRow
                  label="Latest Score"
                  value={formatScore(latestSec.marks)}
                  change={sorted.length >= 2 ? formatImprovement(scoreChange) : undefined}
                  isPositive={scoreChange >= 0}
                />
                <StatRow label="Best Score" value={formatScore(bestSectionScore)} />
                <StatRow label="First Accuracy" value={formatPercent(firstSec.accuracy)} />
                <StatRow
                  label="Latest Accuracy"
                  value={formatPercent(latestSec.accuracy)}
                  change={sorted.length >= 2 ? `${formatImprovement(accChange)} pp` : undefined}
                  isPositive={accChange >= 0}
                />
                <StatRow label="First Attempt Rate" value={formatPercent(firstSec.attemptRate)} />
                <StatRow
                  label="Latest Attempt Rate"
                  value={formatPercent(latestSec.attemptRate)}
                  change={sorted.length >= 2 ? `${formatImprovement(arChange)} pp` : undefined}
                  isPositive={arChange >= 0}
                />
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
