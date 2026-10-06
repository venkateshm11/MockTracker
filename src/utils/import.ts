import { MockWithId } from '../types/mock';
import { Timestamp } from 'firebase/firestore';

export interface ImportResult {
  valid: MockWithId[];
  errors: string[];
  summary: {
    total: number;
    exams: string[];
    testSeries: string[];
  };
}

function isValidSectionData(sec: unknown): boolean {
  if (!sec || typeof sec !== 'object') return false;
  const s = sec as Record<string, unknown>;
  const requiredKeys = ['questions', 'attempted', 'correct', 'wrong', 'marks', 'timeSeconds'];
  return requiredKeys.every((k) => typeof s[k] === 'number');
}

function isValidMock(obj: unknown): obj is MockWithId {
  if (!obj || typeof obj !== 'object') return false;
  const m = obj as Record<string, unknown>;
  if (typeof m.mockNumber !== 'number') return false;
  if (typeof m.exam !== 'string' || !m.exam) return false;
  if (typeof m.testSeries !== 'string' || !m.testSeries) return false;
  if (m.testType !== 'full' && m.testType !== 'sectional') return false;
  if (!m.sections || typeof m.sections !== 'object') return false;
  const sections = m.sections as Record<string, unknown>;
  for (const val of Object.values(sections)) {
    if (!isValidSectionData(val)) return false;
  }
  return true;
}

export function parseImportJSON(jsonString: string): ImportResult {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { valid: [], errors: ['Invalid JSON format.'], summary: { total: 0, exams: [], testSeries: [] } };
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  const valid: MockWithId[] = [];
  const examSet = new Set<string>();
  const tsSet = new Set<string>();

  arr.forEach((item: unknown, idx: number) => {
    if (!isValidMock(item)) {
      errors.push(`Item ${idx + 1}: Invalid mock structure.`);
      return;
    }
    const m = item as MockWithId;

    // Normalize date fields
    const normalized: MockWithId = {
      ...m,
      id: m.id || `imported-${idx}`,
      date: m.date instanceof Timestamp ? m.date : Timestamp.fromDate(new Date(m.date as unknown as string)),
      createdAt: m.createdAt instanceof Timestamp ? m.createdAt : Timestamp.fromDate(new Date(m.createdAt as unknown as string)),
      updatedAt: Timestamp.now(),
    };

    valid.push(normalized);
    examSet.add(m.exam);
    tsSet.add(m.testSeries);
  });

  return {
    valid,
    errors,
    summary: { total: valid.length, exams: Array.from(examSet), testSeries: Array.from(tsSet) },
  };
}
