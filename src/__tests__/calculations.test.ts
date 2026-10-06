import { describe, it, expect } from 'vitest';
import {
  calculateAccuracy,
  calculateAttemptRate,
  calculateWrongRate,
  calculateUnanswered,
  calculateOverall,
  calculateRollingAverage,
  calculateTrend,
  calculateImprovement,
  calculateImprovementPercentage,
  calculatePersonalBests,
  calculateMockNumber,
  calculateSectionStats,
  filterMocksByContext,
  sortMocksByNumber,
} from '../utils/calculations';
import { MockWithId, MockSections, SectionData } from '../types/mock';
import { Timestamp } from 'firebase/firestore';

// ── Helper to build mock data ──────────────────────────────────────────────────

function makeSec(
  questions = 30,
  attempted = 20,
  correct = 10,
  wrong = 10,
  marks = 7.5,
  timeSeconds = 1200
): SectionData {
  return { questions, attempted, correct, wrong, unanswered: questions - attempted, marks, timeSeconds };
}

function makeMock(
  overrides: Partial<MockWithId> & Pick<MockWithId, 'id' | 'mockNumber' | 'exam' | 'testSeries'>
): MockWithId {
  const now = Timestamp.now();
  return {
    testType: 'full',
    date: now,
    createdAt: now,
    updatedAt: now,
    sections: {
      english: makeSec(),
      numerical: makeSec(),
      reasoning: makeSec(),
    },
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────────

describe('calculateAccuracy', () => {
  it('returns correct percentage', () => {
    expect(calculateAccuracy(15, 20)).toBeCloseTo(75);
  });
  it('returns 0 when attempted is 0', () => {
    expect(calculateAccuracy(0, 0)).toBe(0);
  });
  it('returns 100 when all are correct', () => {
    expect(calculateAccuracy(20, 20)).toBeCloseTo(100);
  });
});

describe('calculateAttemptRate', () => {
  it('returns correct percentage', () => {
    expect(calculateAttemptRate(20, 30)).toBeCloseTo(66.667, 1);
  });
  it('returns 0 when questions is 0', () => {
    expect(calculateAttemptRate(0, 0)).toBe(0);
  });
  it('returns 100 when all attempted', () => {
    expect(calculateAttemptRate(30, 30)).toBeCloseTo(100);
  });
});

describe('calculateWrongRate', () => {
  it('returns correct percentage', () => {
    expect(calculateWrongRate(5, 20)).toBeCloseTo(25);
  });
  it('returns 0 when attempted is 0', () => {
    expect(calculateWrongRate(0, 0)).toBe(0);
  });
});

describe('calculateUnanswered', () => {
  it('returns correct value', () => {
    expect(calculateUnanswered(30, 20)).toBe(10);
  });
  it('returns 0 when all attempted', () => {
    expect(calculateUnanswered(30, 30)).toBe(0);
  });
  it('never returns negative', () => {
    expect(calculateUnanswered(10, 15)).toBe(0);
  });
});

describe('calculateOverall', () => {
  it('aggregates all sections correctly', () => {
    const sections: MockSections = {
      english: makeSec(30, 20, 9, 11, 6.25, 1200),
      numerical: makeSec(35, 17, 15, 2, 14.5, 1200),
      reasoning: makeSec(35, 14, 9, 5, 7.75, 1200),
    };
    const overall = calculateOverall(sections);
    expect(overall.questions).toBe(100);
    expect(overall.attempted).toBe(51);
    expect(overall.correct).toBe(33);
    expect(overall.wrong).toBe(18);
    expect(overall.unanswered).toBe(49);
    expect(overall.marks).toBeCloseTo(28.5);
    expect(overall.timeSeconds).toBe(3600);
    expect(overall.accuracy).toBeCloseTo(64.706, 1);
    expect(overall.attemptRate).toBeCloseTo(51);
    expect(overall.wrongRate).toBeCloseTo(35.294, 1);
  });
});

describe('calculateSectionStats', () => {
  it('calculates section stats with accuracy and rates', () => {
    const sec = makeSec(30, 20, 15, 5, 12, 1200);
    const stats = calculateSectionStats(sec);
    expect(stats.accuracy).toBeCloseTo(75);
    expect(stats.attemptRate).toBeCloseTo(66.667, 1);
    expect(stats.wrongRate).toBeCloseTo(25);
    expect(stats.unanswered).toBe(10);
  });
});

describe('calculateRollingAverage', () => {
  it('returns average of last N values', () => {
    expect(calculateRollingAverage([10, 20, 30, 40, 50], 3)).toBeCloseTo(40);
  });
  it('handles fewer values than count', () => {
    expect(calculateRollingAverage([10, 20], 5)).toBeCloseTo(15);
  });
  it('returns null for empty array', () => {
    expect(calculateRollingAverage([], 3)).toBeNull();
  });
});

describe('calculateTrend', () => {
  it('returns insufficient for fewer than 2 values', () => {
    expect(calculateTrend([50])).toBe('insufficient');
    expect(calculateTrend([])).toBe('insufficient');
  });
  it('detects improving trend', () => {
    expect(calculateTrend([20, 22, 24, 26, 30, 35, 40, 42])).toBe('improving');
  });
  it('detects declining trend', () => {
    expect(calculateTrend([40, 38, 35, 32, 28, 25, 20, 18])).toBe('declining');
  });
  it('detects stable trend', () => {
    expect(calculateTrend([50, 50, 50, 50, 50, 50, 50])).toBe('stable');
  });
});

describe('calculateImprovement', () => {
  it('returns positive difference', () => {
    expect(calculateImprovement(28.5, 52.75)).toBeCloseTo(24.25);
  });
  it('returns negative difference', () => {
    expect(calculateImprovement(52.75, 28.5)).toBeCloseTo(-24.25);
  });
  it('returns zero for same values', () => {
    expect(calculateImprovement(50, 50)).toBe(0);
  });
});

describe('calculateImprovementPercentage', () => {
  it('returns correct percentage', () => {
    expect(calculateImprovementPercentage(20, 30)).toBeCloseTo(50);
  });
  it('returns 0 when first is 0', () => {
    expect(calculateImprovementPercentage(0, 30)).toBe(0);
  });
});

describe('calculateMockNumber', () => {
  it('returns 1 for empty track', () => {
    expect(calculateMockNumber([], 'IBPS PO', "Sreedhar's CCE")).toBe(1);
  });
  it('returns next number for existing track', () => {
    const mocks = [
      makeMock({ id: '1', mockNumber: 1, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
      makeMock({ id: '2', mockNumber: 2, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
      makeMock({ id: '3', mockNumber: 3, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
    ];
    expect(calculateMockNumber(mocks, 'IBPS PO', "Sreedhar's CCE")).toBe(4);
  });
  it('returns 1 for a different exam track', () => {
    const mocks = [
      makeMock({ id: '1', mockNumber: 1, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
      makeMock({ id: '2', mockNumber: 2, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
    ];
    expect(calculateMockNumber(mocks, 'RRB PO', "Sreedhar's CCE")).toBe(1);
  });
  it('returns 1 for a different test series', () => {
    const mocks = [
      makeMock({ id: '1', mockNumber: 1, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
    ];
    expect(calculateMockNumber(mocks, 'IBPS PO', 'Testbook')).toBe(1);
  });
});

describe('calculatePersonalBests', () => {
  it('tracks highest values per section', () => {
    const mocks = [
      makeMock({
        id: '1', mockNumber: 1, exam: 'IBPS PO', testSeries: 'Testbook',
        sections: {
          english: makeSec(30, 20, 10, 10, 7.5, 1200),
          numerical: makeSec(35, 15, 12, 3, 11.25, 1200),
          reasoning: makeSec(35, 15, 8, 7, 5.25, 1200),
        },
      }),
      makeMock({
        id: '2', mockNumber: 2, exam: 'IBPS PO', testSeries: 'Testbook',
        sections: {
          english: makeSec(30, 25, 20, 5, 18.75, 1200),
          numerical: makeSec(35, 20, 10, 10, 7.5, 1200),
          reasoning: makeSec(35, 20, 15, 5, 13.75, 1200),
        },
      }),
    ];
    const bests = calculatePersonalBests(mocks);
    expect(bests.highestScore).toBeCloseTo(40); // 18.75+7.5+13.75
    expect(bests.sections['english'].highestScore).toBeCloseTo(18.75);
    expect(bests.sections['numerical'].highestScore).toBeCloseTo(11.25);
    expect(bests.sections['reasoning'].highestScore).toBeCloseTo(13.75);
  });
  it('returns nulls for empty mocks', () => {
    const bests = calculatePersonalBests([]);
    expect(bests.highestScore).toBeNull();
  });
});

describe('Exam + Test Series Isolation', () => {
  it('filterMocksByContext only returns matching mocks', () => {
    const mocks = [
      makeMock({ id: '1', mockNumber: 1, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
      makeMock({ id: '2', mockNumber: 1, exam: 'RRB PO', testSeries: "Sreedhar's CCE" }),
      makeMock({ id: '3', mockNumber: 2, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
      makeMock({ id: '4', mockNumber: 1, exam: 'IBPS PO', testSeries: 'Testbook' }),
    ];

    const ibpsSreedhar = filterMocksByContext(mocks, 'IBPS PO', "Sreedhar's CCE");
    expect(ibpsSreedhar).toHaveLength(2);
    expect(ibpsSreedhar.every(m => m.exam === 'IBPS PO' && m.testSeries === "Sreedhar's CCE")).toBe(true);

    const rrbSreedhar = filterMocksByContext(mocks, 'RRB PO', "Sreedhar's CCE");
    expect(rrbSreedhar).toHaveLength(1);

    const ibpsTestbook = filterMocksByContext(mocks, 'IBPS PO', 'Testbook');
    expect(ibpsTestbook).toHaveLength(1);
  });

  it('filterMocksByContext returns all when isAllExams is true', () => {
    const mocks = [
      makeMock({ id: '1', mockNumber: 1, exam: 'IBPS PO', testSeries: "Sreedhar's CCE" }),
      makeMock({ id: '2', mockNumber: 1, exam: 'RRB PO', testSeries: "Sreedhar's CCE" }),
    ];
    expect(filterMocksByContext(mocks, null, null, true)).toHaveLength(2);
  });
});

describe('sortMocksByNumber', () => {
  it('sorts mocks by mock number ascending', () => {
    const mocks = [
      makeMock({ id: '3', mockNumber: 3, exam: 'X', testSeries: 'Y' }),
      makeMock({ id: '1', mockNumber: 1, exam: 'X', testSeries: 'Y' }),
      makeMock({ id: '2', mockNumber: 2, exam: 'X', testSeries: 'Y' }),
    ];
    const sorted = sortMocksByNumber(mocks);
    expect(sorted.map(m => m.mockNumber)).toEqual([1, 2, 3]);
  });
});
