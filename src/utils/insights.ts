import { MockWithId } from '../types/mock';
import { calculateOverall, calculateSectionStats, sortMocksByNumber } from './calculations';

export interface Insight {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral' | 'info';
}

export function generateInsights(mocks: MockWithId[]): Insight[] {
  const sorted = sortMocksByNumber(mocks);
  if (sorted.length < 2) return [];

  const insights: Insight[] = [];
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  const firstOverall = calculateOverall(first.sections);
  const latestOverall = calculateOverall(latest.sections);

  // Score comparison
  const scoreDiff = latestOverall.marks - firstOverall.marks;
  if (scoreDiff > 0) {
    insights.push({
      id: 'score-improvement',
      text: `Your latest score is ${scoreDiff.toFixed(2)} marks higher than your first mock in this test series.`,
      type: 'positive',
    });
  } else if (scoreDiff < 0) {
    insights.push({
      id: 'score-decline',
      text: `Your latest score is ${Math.abs(scoreDiff).toFixed(2)} marks lower than your first mock.`,
      type: 'negative',
    });
  }

  // Accuracy comparison
  const accDiff = latestOverall.accuracy - firstOverall.accuracy;
  if (Math.abs(accDiff) > 1) {
    insights.push({
      id: 'accuracy-change',
      text: `Your accuracy has ${accDiff > 0 ? 'increased' : 'decreased'} by ${Math.abs(accDiff).toFixed(1)} percentage points since your first mock.`,
      type: accDiff > 0 ? 'positive' : 'negative',
    });
  }

  // Rolling averages
  if (sorted.length >= 10) {
    const last5 = sorted.slice(-5).map((m) => calculateOverall(m.sections).marks);
    const prev5 = sorted.slice(-10, -5).map((m) => calculateOverall(m.sections).marks);
    const last5Avg = last5.reduce((s, v) => s + v, 0) / 5;
    const prev5Avg = prev5.reduce((s, v) => s + v, 0) / 5;
    if (last5Avg > prev5Avg) {
      insights.push({
        id: 'last5-vs-prev5',
        text: `Your last 5-mock average (${last5Avg.toFixed(2)}) is higher than your previous 5-mock average (${prev5Avg.toFixed(2)}).`,
        type: 'positive',
      });
    } else if (last5Avg < prev5Avg) {
      insights.push({
        id: 'last5-vs-prev5-down',
        text: `Your last 5-mock average (${last5Avg.toFixed(2)}) is lower than your previous 5-mock average (${prev5Avg.toFixed(2)}).`,
        type: 'negative',
      });
    }
  }

  // Section best accuracy
  const sectionKeys = Object.keys(latest.sections);
  if (sectionKeys.length > 1) {
    let bestSection = '';
    let bestAcc = -1;
    for (const key of sectionKeys) {
      const sec = latestOverall;
      const sectionStats = calculateSectionStats(latest.sections[key]);
      if (sectionStats.accuracy > bestAcc) {
        bestAcc = sectionStats.accuracy;
        bestSection = key;
      }
    }
    if (bestSection) {
      const sectionLabel = bestSection.charAt(0).toUpperCase() + bestSection.slice(1);
      insights.push({
        id: 'best-section-accuracy',
        text: `${sectionLabel} currently has your highest section accuracy at ${bestAcc.toFixed(1)}%.`,
        type: 'info',
      });
    }
  }

  // Attempt rate change
  const attemptDiff = latestOverall.attemptRate - firstOverall.attemptRate;
  if (Math.abs(attemptDiff) > 2) {
    insights.push({
      id: 'attempt-rate-change',
      text: `Your overall attempt rate has ${attemptDiff > 0 ? 'improved' : 'declined'} by ${Math.abs(attemptDiff).toFixed(1)} percentage points.`,
      type: attemptDiff > 0 ? 'positive' : 'negative',
    });
  }

  return insights;
}
