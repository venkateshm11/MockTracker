import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Target, Award, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { ContextSelector } from '../components/filters/ContextSelector';
import { StatCard } from '../components/ui/StatCard';
import { EmptyState } from '../components/ui/EmptyState';
import { TrendBadge } from '../components/ui/TrendBadge';
import { ScoreTrendChart } from '../components/charts/TrendChart';
import { SectionTrendChart } from '../components/charts/SectionTrendChart';
import { SectionCards } from '../components/dashboard/SectionCards';
import { RecentMocksTable } from '../components/dashboard/RecentMocksTable';
import { StatCardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { formatScore, formatPercent, formatImprovement } from '../utils/formatters';
import { generateInsights } from '../utils/insights';
import { Lightbulb } from 'lucide-react';

import { SAMPLE_MOCKS } from '../utils/sampleData';
import { batchImportMocks } from '../firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const {
    mocks,
    mocksLoading,
    selectedExam,
    selectedTestSeries,
    isAllExams,
    user,
    setSelectedExam,
    setSelectedTestSeries,
  } = useApp();
  const navigate = useNavigate();
  const [loadingSample, setLoadingSample] = React.useState(false);

  const handleLoadSamples = async () => {
    if (!user) return;
    setLoadingSample(true);
    try {
      const now = Timestamp.now();
      await batchImportMocks(
        user.uid,
        SAMPLE_MOCKS.map((m) => ({ ...m, createdAt: now, updatedAt: now }))
      );
      setSelectedExam('IBPS PO');
      setSelectedTestSeries('Testbook');
    } catch (err) {
      console.error('Failed to load sample mocks:', err);
    } finally {
      setLoadingSample(false);
    }
  };

  const {
    contextMocks,
    latestOverall,
    bestScore,
    last5Avg,
    avgAccuracy,
    improvement,
    scoreTrend,
    accuracyTrend,
  } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);

  const insights = React.useMemo(
    () => generateInsights(contextMocks),
    [contextMocks]
  );

  const hasData = contextMocks.length > 0;
  const isContextReady = isAllExams || (!!selectedExam && !!selectedTestSeries);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track your mock test performance</p>
      </div>

      {/* Context selector */}
      <ContextSelector />

      {mocksLoading ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <ChartSkeleton />
        </>
      ) : !isContextReady ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">Select an exam and test series to view your performance.</p>
        </div>
      ) : !hasData ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
          <EmptyState
            title={mocks.length > 0 ? "No mocks for this selection" : "No mock tests recorded yet"}
            description={
              isAllExams
                ? 'Add your first mock test to start tracking performance.'
                : mocks.length > 0
                ? `You have ${mocks.length} mock${mocks.length > 1 ? 's' : ''} in total, but none recorded under ${selectedExam} → ${selectedTestSeries}.`
                : `No mocks recorded for ${selectedExam} → ${selectedTestSeries} yet.`
            }
            action={
              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-center">
                {mocks.length > 0 && !isAllExams && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      const latest = mocks[mocks.length - 1];
                      if (latest) {
                        setSelectedExam(latest.exam);
                        setSelectedTestSeries(latest.testSeries);
                      }
                    }}
                    id="dashboard-switch-to-latest-btn"
                  >
                    View Latest ({mocks[mocks.length - 1]?.exam})
                  </Button>
                )}
                <Button onClick={() => navigate('/add')} icon={<Plus size={16} />} id="dashboard-add-first-mock-btn">
                  Add Mock
                </Button>
                {mocks.length === 0 && (
                  <Button
                    variant="secondary"
                    onClick={handleLoadSamples}
                    loading={loadingSample}
                    icon={<Sparkles size={16} className="text-amber-500" />}
                    id="dashboard-load-sample-btn"
                  >
                    Load 5 Sample Mocks
                  </Button>
                )}
              </div>
            }
            icon={<Activity size={40} />}
          />
        </div>
      ) : (
        <>
          {/* Baseline banner when only 1 mock recorded */}
          {contextMocks.length === 1 && (
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 flex items-start gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                <Sparkles size={18} />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-indigo-950 dark:text-indigo-200">First mock recorded! (Baseline established)</p>
                <p className="text-indigo-700 dark:text-indigo-300 text-xs mt-0.5">
                  Your baseline scores and accuracy have been successfully saved below. Trend direction and comparison analytics will unlock automatically once you record your 2nd mock test.
                </p>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Latest Score"
              value={latestOverall ? formatScore(latestOverall.marks) : '—'}
              icon={<Activity size={16} />}
            />
            <StatCard
              label="Best Score"
              value={bestScore !== null ? formatScore(bestScore) : '—'}
              icon={<Award size={16} />}
              valueClassName="text-indigo-600 dark:text-indigo-400"
            />
            <StatCard
              label="Last 5 Avg"
              value={last5Avg !== null ? formatScore(last5Avg) : '—'}
              icon={<TrendingUp size={16} />}
            />
            <StatCard
              label="Accuracy"
              value={latestOverall ? formatPercent(latestOverall.accuracy) : '—'}
              subtitle={avgAccuracy !== null ? `Avg: ${formatPercent(avgAccuracy)}` : undefined}
              icon={<Target size={16} />}
            />
          </div>

          {/* Secondary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Score Trend</p>
              <TrendBadge trend={scoreTrend} count={contextMocks.length} />
              {contextMocks.length === 1 && (
                <p className="text-[11px] text-slate-400 mt-1">Add 2nd mock to calculate trend</p>
              )}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Accuracy Trend</p>
              <TrendBadge trend={accuracyTrend} count={contextMocks.length} />
              {contextMocks.length === 1 && (
                <p className="text-[11px] text-slate-400 mt-1">Add 2nd mock to calculate trend</p>
              )}
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Improvement</p>
              <p className={`text-lg font-bold ${
                improvement !== null && improvement > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : improvement !== null && improvement < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-900 dark:text-white'
              }`}>
                {improvement !== null ? formatImprovement(improvement) : (contextMocks.length === 1 ? 'Baseline' : '—')}
              </p>
              <p className="text-xs text-slate-400">
                {contextMocks.length === 1 ? 'Initial mock set' : 'first → latest'}
              </p>
            </div>
          </div>

          {/* Charts */}
          <ScoreTrendChart
            title="Overall Score Trend"
            dataKey="score"
            color="#6366f1"
            yLabel="Score"
            showAvgLine
          />
          <ScoreTrendChart
            title="Overall Accuracy Trend"
            dataKey="accuracy"
            color="#10b981"
            yLabel="Accuracy %"
          />
          <ScoreTrendChart
            title="Attempt Rate Trend"
            dataKey="attemptRate"
            color="#f59e0b"
            yLabel="Attempt Rate %"
          />

          {/* Section performance cards */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Section Performance</h3>
            <SectionCards />
          </div>

          {/* Section trend chart */}
          <SectionTrendChart />

          {/* Recent mocks */}
          <RecentMocksTable />

          {/* Insights */}
          {insights.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={16} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Insights</h3>
              </div>
              <ul className="space-y-2">
                {insights.map((insight) => (
                  <li
                    key={insight.id}
                    className={`text-sm px-3 py-2 rounded-lg ${
                      insight.type === 'positive'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : insight.type === 'negative'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {insight.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
