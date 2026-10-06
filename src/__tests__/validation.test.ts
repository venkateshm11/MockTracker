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

  it('passes valid RRB Mains form with GA and Computer Awareness', () => {
    const errors = validateMockForm({
      exam: 'RRB PO',
      testSeries: 'Testbook',
      sections: {
        english: { questions: 40, attempted: 30, correct: 25, wrong: 5, marks: 23.75, timeSeconds: 1200 },
        numerical: { questions: 40, attempted: 25, correct: 20, wrong: 5, marks: 23.75, timeSeconds: 1500 },
        reasoning: { questions: 40, attempted: 30, correct: 28, wrong: 2, marks: 33.5, timeSeconds: 1500 },
        general_awareness: { questions: 40, attempted: 30, correct: 25, wrong: 5, marks: 23.75, timeSeconds: 900 },
        computer_awareness: { questions: 40, attempted: 35, correct: 30, wrong: 5, marks: 14.25, timeSeconds: 900 },
      },
      sectionLabels: {
        english: 'English',
        numerical: 'Numerical Ability',
        reasoning: 'Reasoning Ability',
        general_awareness: 'General Awareness',
        computer_awareness: 'Computer Awareness',
      },
    });
    expect(errors).toHaveLength(0);
  });
});

describe('getSectionsForExamAndStage', () => {
  it('returns 3 base sections for regular prelims', async () => {
    const { getSectionsForExamAndStage } = await import('../constants/sections');
    const sections = getSectionsForExamAndStage('IBPS PO', 'prelims');
    expect(sections.map((s) => s.key)).toEqual(['english', 'numerical', 'reasoning']);
  });

  it('adds general awareness for mains exams', async () => {
    const { getSectionsForExamAndStage } = await import('../constants/sections');
    const sections = getSectionsForExamAndStage('IBPS PO', 'mains');
    expect(sections.map((s) => s.key)).toEqual([
      'english',
      'numerical',
      'reasoning',
      'general_awareness',
    ]);
  });

  it('adds both general awareness and computer awareness for RRB mains', async () => {
    const { getSectionsForExamAndStage } = await import('../constants/sections');
    const rrbPo = getSectionsForExamAndStage('RRB PO', 'mains');
    expect(rrbPo.map((s) => s.key)).toEqual([
      'english',
      'numerical',
      'reasoning',
      'general_awareness',
      'computer_awareness',
    ]);

    const rrbClerk = getSectionsForExamAndStage('IBPS RRB Clerk', 'mains');
    expect(rrbClerk.map((s) => s.key)).toEqual([
      'english',
      'numerical',
      'reasoning',
      'general_awareness',
      'computer_awareness',
    ]);
  });

  it('provides general awareness for SSC CGL in prelims and mains', async () => {
    const { getSectionsForExamAndStage } = await import('../constants/sections');
    const prelims = getSectionsForExamAndStage('SSC CGL', 'prelims');
    expect(prelims.map((s) => s.key)).toEqual([
      'english',
      'numerical',
      'reasoning',
      'general_awareness',
    ]);

    const mains = getSectionsForExamAndStage('SSC CGL', 'mains');
    expect(mains.map((s) => s.key)).toEqual([
      'english',
      'numerical',
      'reasoning',
      'general_awareness',
    ]);
  });
});
