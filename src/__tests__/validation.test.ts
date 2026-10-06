import { describe, it, expect } from 'vitest';
import { validateSection, validateMockForm } from '../utils/validation';

describe('validateSection', () => {
  it('passes valid data', () => {
    const errors = validateSection('english', 'English', {
      questions: 30, attempted: 20, correct: 10, wrong: 10, marks: 7.5, timeSeconds: 1200,
    });
    expect(errors).toHaveLength(0);
  });

  it('errors when attempted > questions', () => {
    const errors = validateSection('english', 'English', {
      questions: 30, attempted: 35, correct: 20, wrong: 15, marks: 15, timeSeconds: 1200,
    });
    expect(errors.some(e => e.field === 'english.attempted')).toBe(true);
  });

  it('errors when correct + wrong != attempted', () => {
    const errors = validateSection('english', 'English', {
      questions: 30, attempted: 20, correct: 12, wrong: 10, marks: 7.5, timeSeconds: 1200,
    });
    expect(errors.some(e => e.message.includes('must equal'))).toBe(true);
  });

  it('errors on negative values', () => {
    const errors = validateSection('english', 'English', {
      questions: -5, attempted: 20, correct: 10, wrong: 10, marks: 7.5, timeSeconds: 1200,
    });
    expect(errors.some(e => e.field === 'english.questions')).toBe(true);
  });
});

describe('validateMockForm', () => {
  it('errors when exam is empty', () => {
    const errors = validateMockForm({
      exam: '',
      testSeries: 'X',
      sections: { english: { questions: 30, attempted: 20, correct: 10, wrong: 10, marks: 7.5, timeSeconds: 1200 } },
      sectionLabels: { english: 'English' },
    });
    expect(errors.some(e => e.field === 'exam')).toBe(true);
  });

  it('errors when testSeries is empty', () => {
    const errors = validateMockForm({
      exam: 'IBPS PO',
      testSeries: '',
      sections: { english: { questions: 30, attempted: 20, correct: 10, wrong: 10, marks: 7.5, timeSeconds: 1200 } },
      sectionLabels: { english: 'English' },
    });
    expect(errors.some(e => e.field === 'testSeries')).toBe(true);
  });

  it('passes valid complete form', () => {
    const errors = validateMockForm({
      exam: 'IBPS PO',
      testSeries: "Sreedhar's CCE",
      sections: {
        english: { questions: 30, attempted: 20, correct: 10, wrong: 10, marks: 7.5, timeSeconds: 1200 },
        numerical: { questions: 35, attempted: 17, correct: 15, wrong: 2, marks: 14.5, timeSeconds: 1200 },
        reasoning: { questions: 35, attempted: 14, correct: 9, wrong: 5, marks: 7.75, timeSeconds: 1200 },
      },
      sectionLabels: { english: 'English', numerical: 'Numerical Ability', reasoning: 'Reasoning Ability' },
    });
    expect(errors).toHaveLength(0);
  });
});
