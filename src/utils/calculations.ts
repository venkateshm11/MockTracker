import { SectionData, MockSections, OverallStats, SectionStats, PersonalBests, TrendStatus, MockWithId } from '../types/mock';
import { TREND_THRESHOLD_PERCENT } from '../constants/sections';

// ─────────────────────────────────────────────────────────────────────────────
// Basic field calculations
// ─────────────────────────────────────────────────────────────────────────────

export function calculateUnanswered(questions: number, attempted: number): number {
  return Math.max(0, questions - attempted);
}

export function calculateAccuracy(correct: number, attempted: number): number {
  if (attempted === 0) return 0;
  return (correct / attempted) * 100;
}

export function calculateAttemptRate(attempted: number, questions: number): number {
  if (questions === 0) return 0;
  return (attempted / questions) * 100;
}

export function calculateWrongRate(wrong: number, attempted: number): number {
  if (attempted === 0) return 0;
  return (wrong / attempted) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Section stats
// ─────────────────────────────────────────────────────────────────────────────

export function calculateSectionStats(section: SectionData): SectionStats {
  return {
    ...section,
    unanswered: calculateUnanswered(section.questions, section.attempted),
    accuracy: calculateAccuracy(section.correct, section.attempted),
    attemptRate: calculateAttemptRate(section.attempted, section.questions),
    wrongRate: calculateWrongRate(section.wrong, section.attempted),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Overall stats aggregation
// ─────────────────────────────────────────────────────────────────────────────

export function calculateOverall(sections: MockSections): OverallStats {
  const sectionValues = Object.values(sections);

  const questions = sectionValues.reduce((s, sec) => s + (sec.questions || 0), 0);
  const attempted = sectionValues.reduce((s, sec) => s + (sec.attempted || 0), 0);
  const correct = sectionValues.reduce((s, sec) => s + (sec.correct || 0), 0);
  const wrong = sectionValues.reduce((s, sec) => s + (sec.wrong || 0), 0);
  const marks = sectionValues.reduce((s, sec) => s + (sec.marks || 0), 0);
  const timeSeconds = sectionValues.reduce((s, sec) => s + (sec.timeSeconds || 0), 0);
  const unanswered = calculateUnanswered(questions, attempted);

  return {
    questions,
    attempted,
    correct,
    wrong,
    unanswered,
    marks,
    timeSeconds,
    accuracy: calculateAccuracy(correct, attempted),
    attemptRate: calculateAttemptRate(attempted, questions),
    wrongRate: calculateWrongRate(wrong, attempted),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Rolling averages
// ─────────────────────────────────────────────────────────────────────────────

export function calculateRollingAverage(values: number[], count: number): number | null {
  if (values.length === 0) return null;
  const slice = values.slice(-count);
  if (slice.length === 0) return null;
  return slice.reduce((s, v) => s + v, 0) / slice.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Trend calculation
// ─────────────────────────────────────────────────────────────────────────────

export function calculateTrend(values: number[]): TrendStatus {
  if (values.length < 2) return 'insufficient';
  if (values.length < 4) {
    // With 2-3 values compare first half vs second half
    const mid = Math.floor(values.length / 2);
    const prev = values.slice(0, mid).reduce((s, v) => s + v, 0) / mid || 1;
    const recent = values.slice(mid).reduce((s, v) => s + v, 0) / (values.length - mid) || 1;
    const changePct = ((recent - prev) / Math.abs(prev)) * 100;
    if (changePct >= TREND_THRESHOLD_PERCENT) return 'improving';
    if (changePct <= -TREND_THRESHOLD_PERCENT) return 'declining';
    return 'stable';
  }

  // Primary: last 3 vs previous 3
  const recent3 = values.slice(-3);
  const prev3 = values.slice(-6, -3);

  if (prev3.length < 3) {
    // fallback: last 3 vs everything before
    const recentAvg = recent3.reduce((s, v) => s + v, 0) / 3;
    const prevValues = values.slice(0, -3);
    if (prevValues.length === 0) return 'insufficient';
    const prevAvg = prevValues.reduce((s, v) => s + v, 0) / prevValues.length;
    if (prevAvg === 0) return 'stable';
    const changePct = ((recentAvg - prevAvg) / Math.abs(prevAvg)) * 100;
    if (changePct >= TREND_THRESHOLD_PERCENT) return 'improving';
    if (changePct <= -TREND_THRESHOLD_PERCENT) return 'declining';
    return 'stable';
  }

  const recentAvg = recent3.reduce((s, v) => s + v, 0) / 3;
  const prevAvg = prev3.reduce((s, v) => s + v, 0) / 3;
  if (prevAvg === 0) return 'stable';
  const changePct = ((recentAvg - prevAvg) / Math.abs(prevAvg)) * 100;
  if (changePct >= TREND_THRESHOLD_PERCENT) return 'improving';
  if (changePct <= -TREND_THRESHOLD_PERCENT) return 'declining';
  return 'stable';
}

// ─────────────────────────────────────────────────────────────────────────────
// Improvement
// ─────────────────────────────────────────────────────────────────────────────

export function calculateImprovement(first: number, latest: number): number {
  return latest - first;
}

export function calculateImprovementPercentage(first: number, latest: number): number {
  if (first === 0) return 0;
  return ((latest - first) / Math.abs(first)) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
// Personal bests
// ─────────────────────────────────────────────────────────────────────────────

export function calculatePersonalBests(mocks: MockWithId[]): PersonalBests {
  if (mocks.length === 0) {
    return { highestScore: null, highestAccuracy: null, highestAttemptRate: null, sections: {} };
  }

  let highestScore: number | null = null;
  let highestAccuracy: number | null = null;
  let highestAttemptRate: number | null = null;
  const sectionBests: PersonalBests['sections'] = {};

  for (const mock of mocks) {
    const overall = calculateOverall(mock.sections);

    if (highestScore === null || overall.marks > highestScore) highestScore = overall.marks;
    if (highestAccuracy === null || overall.accuracy > highestAccuracy) highestAccuracy = overall.accuracy;
    if (highestAttemptRate === null || overall.attemptRate > highestAttemptRate) highestAttemptRate = overall.attemptRate;

    for (const [key, sec] of Object.entries(mock.sections)) {
      const stats = calculateSectionStats(sec);
      if (!sectionBests[key]) {
        sectionBests[key] = { highestScore: null, highestAccuracy: null };
      }
      if (sectionBests[key].highestScore === null || sec.marks > sectionBests[key].highestScore!) {
        sectionBests[key].highestScore = sec.marks;
      }
      if (sectionBests[key].highestAccuracy === null || stats.accuracy > sectionBests[key].highestAccuracy!) {
        sectionBests[key].highestAccuracy = stats.accuracy;
      }
    }
  }

  return { highestScore, highestAccuracy, highestAttemptRate, sections: sectionBests };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock numbering
// ─────────────────────────────────────────────────────────────────────────────

export function calculateMockNumber(
  mocks: MockWithId[],
  exam: string,
  testSeries: string
): number {
  const relevant = mocks.filter(
    (m) => m.exam === exam && m.testSeries === testSeries
  );
  if (relevant.length === 0) return 1;
  const max = Math.max(...relevant.map((m) => m.mockNumber));
  return max + 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter mocks by context
// ─────────────────────────────────────────────────────────────────────────────

export function filterMocksByContext(
  mocks: MockWithId[],
  exam: string | null,
  testSeries: string | null,
  isAllExams = false
): MockWithId[] {
  if (isAllExams) return mocks;
  return mocks.filter(
    (m) => m.exam === exam && m.testSeries === testSeries
  );
}

export function sortMocksByNumber(mocks: MockWithId[]): MockWithId[] {
  return [...mocks].sort((a, b) => a.mockNumber - b.mockNumber);
}
