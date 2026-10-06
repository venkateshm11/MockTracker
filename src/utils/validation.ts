import { SectionData, MockSections } from '../types/mock';

export interface ValidationError {
  field: string;
  message: string;
}

export interface SectionValidationInput {
  questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  marks: number;
  timeSeconds: number;
}

function isNonNegativeNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

export function validateSection(
  key: string,
  label: string,
  data: SectionValidationInput
): ValidationError[] {
  const errors: ValidationError[] = [];
  const { questions, attempted, correct, wrong, marks, timeSeconds } = data;

  if (!isNonNegativeNumber(questions)) {
    errors.push({ field: `${key}.questions`, message: `${label}: Questions must be a non-negative number.` });
  }
  if (!isNonNegativeNumber(attempted)) {
    errors.push({ field: `${key}.attempted`, message: `${label}: Attempted must be a non-negative number.` });
  }
  if (!isNonNegativeNumber(correct)) {
    errors.push({ field: `${key}.correct`, message: `${label}: Correct must be a non-negative number.` });
  }
  if (!isNonNegativeNumber(wrong)) {
    errors.push({ field: `${key}.wrong`, message: `${label}: Wrong must be a non-negative number.` });
  }
  if (!isNonNegativeNumber(marks)) {
    errors.push({ field: `${key}.marks`, message: `${label}: Marks must be a non-negative number.` });
  }
  if (!isNonNegativeNumber(timeSeconds)) {
    errors.push({ field: `${key}.timeSeconds`, message: `${label}: Time must be non-negative.` });
  }

  if (isNonNegativeNumber(attempted) && isNonNegativeNumber(questions) && attempted > questions) {
    errors.push({ field: `${key}.attempted`, message: `${label}: Attempted (${attempted}) cannot exceed Questions (${questions}).` });
  }

  if (isNonNegativeNumber(correct) && isNonNegativeNumber(wrong) && isNonNegativeNumber(attempted)) {
    if (correct + wrong !== attempted) {
      errors.push({
        field: `${key}.correct`,
        message: `${label}: Correct (${correct}) + Wrong (${wrong}) must equal Attempted (${attempted}). Currently: ${correct + wrong}.`,
      });
    }
  }

  return errors;
}

export function validateMockForm(data: {
  exam: string;
  testSeries: string;
  sections: Record<string, SectionValidationInput>;
  sectionLabels: Record<string, string>;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.exam || data.exam.trim() === '') {
    errors.push({ field: 'exam', message: 'Exam is required.' });
  }
  if (!data.testSeries || data.testSeries.trim() === '') {
    errors.push({ field: 'testSeries', message: 'Test Series is required.' });
  }

  for (const [key, section] of Object.entries(data.sections)) {
    const label = data.sectionLabels[key] || key;
    errors.push(...validateSection(key, label, section));
  }

  return errors;
}
