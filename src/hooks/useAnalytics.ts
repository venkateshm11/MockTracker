import { useMemo } from 'react';
import { MockWithId } from '../types/mock';
import {
  calculateOverall,
  calculateSectionStats,
  calculateRollingAverage,
  calculateTrend,
  calculateImprovement,
  calculateImprovementPercentage,
  calculatePersonalBests,
  filterMocksByContext,
  sortMocksByNumber,
} from '../utils/calculations';

export function useAnalytics(
  mocks: MockWithId[],
  exam: string | null,
  testSeries: string | null,
  isAllExams = false
) {
  const contextMocks = useMemo(
    () => filterMocksByContext(mocks, exam, testSeries, isAllExams),
    [mocks, exam, testSeries, isAllExams]
  );

  const sorted = useMemo(() => sortMocksByNumber(contextMocks), [contextMocks]);

  const overallScores = useMemo(
    () => sorted.map((m) => calculateOverall(m.sections).marks),
    [sorted]
  );

  const overallAccuracies = useMemo(
    () => sorted.map((m) => calculateOverall(m.sections).accuracy),
    [sorted]
  );

  const overallAttemptRates = useMemo(
    () => sorted.map((m) => calculateOverall(m.sections).attemptRate),
    [sorted]
  );

  const latestMock = sorted[sorted.length - 1] ?? null;
  const firstMock = sorted[0] ?? null;

  const latestOverall = useMemo(
    () => (latestMock ? calculateOverall(latestMock.sections) : null),
    [latestMock]
  );

  const firstOverall = useMemo(
    () => (firstMock ? calculateOverall(firstMock.sections) : null),
    [firstMock]
  );

  const bestScore = useMemo(
    () => (overallScores.length > 0 ? Math.max(...overallScores) : null),
    [overallScores]
  );

  const avgScore = useMemo(
    () =>
      overallScores.length > 0
        ? overallScores.reduce((s, v) => s + v, 0) / overallScores.length
        : null,
    [overallScores]
  );

  const last5Avg = useMemo(() => calculateRollingAverage(overallScores, 5), [overallScores]);
  const last3Avg = useMemo(() => calculateRollingAverage(overallScores, 3), [overallScores]);
  const last10Avg = useMemo(() => calculateRollingAverage(overallScores, 10), [overallScores]);

  const avgAccuracy = useMemo(
    () =>
      overallAccuracies.length > 0
        ? overallAccuracies.reduce((s, v) => s + v, 0) / overallAccuracies.length
        : null,
    [overallAccuracies]
  );

  const scoreTrend = useMemo(() => calculateTrend(overallScores), [overallScores]);
  const accuracyTrend = useMemo(() => calculateTrend(overallAccuracies), [overallAccuracies]);

  const improvement = useMemo(() => {
    if (!firstOverall || !latestOverall) return null;
    return calculateImprovement(firstOverall.marks, latestOverall.marks);
  }, [firstOverall, latestOverall]);

  const improvementPct = useMemo(() => {
    if (!firstOverall || !latestOverall) return null;
    return calculateImprovementPercentage(firstOverall.marks, latestOverall.marks);
  }, [firstOverall, latestOverall]);

  const personalBests = useMemo(() => calculatePersonalBests(sorted), [sorted]);

  // Section trend data
  const sectionTrends = useMemo(() => {
    if (sorted.length === 0) return {};
    const keys = Object.keys(sorted[0].sections);
    const result: Record<string, ReturnType<typeof calculateTrend>> = {};
    for (const key of keys) {
      const vals = sorted.map((m) => m.sections[key]?.marks ?? 0);
      result[key] = calculateTrend(vals);
    }
    return result;
  }, [sorted]);

  // Chart data
  const chartData = useMemo(
    () =>
      sorted.map((m, i) => {
        const overall = calculateOverall(m.sections);
        const row: Record<string, number | string> = {
          mockNum: m.mockNumber,
          score: overall.marks,
          accuracy: overall.accuracy,
          attemptRate: overall.attemptRate,
          attempted: overall.attempted,
          timeSeconds: overall.timeSeconds,
        };
        for (const [key, sec] of Object.entries(m.sections)) {
          const stats = calculateSectionStats(sec);
          row[`${key}_score`] = sec.marks;
          row[`${key}_accuracy`] = stats.accuracy;
          row[`${key}_attemptRate`] = stats.attemptRate;
          row[`${key}_attempted`] = sec.attempted;
          row[`${key}_timeSeconds`] = sec.timeSeconds;
        }
        return row;
      }),
    [sorted]
  );

  const recentMocks = useMemo(() => sorted.slice(-5).reverse(), [sorted]);

  return {
    contextMocks,
    sorted,
    latestMock,
    firstMock,
    latestOverall,
    firstOverall,
    bestScore,
    avgScore,
    last5Avg,
    last3Avg,
    last10Avg,
    avgAccuracy,
    scoreTrend,
    accuracyTrend,
    improvement,
    improvementPct,
    personalBests,
    sectionTrends,
    chartData,
    recentMocks,
    overallScores,
    overallAccuracies,
    overallAttemptRates,
  };
}
