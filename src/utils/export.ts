import { MockWithId, MockSections } from '../types/mock';
import { calculateOverall, calculateSectionStats } from './calculations';
import { formatDate, formatTime } from './formatters';
import { Timestamp } from 'firebase/firestore';

function getDate(d: Date | Timestamp): Date {
  return d instanceof Timestamp ? d.toDate() : d;
}

function getSectionRow(sections: MockSections, key: string, prefix: string): Record<string, string | number> {
  const sec = sections[key];
  if (!sec) return {};
  const stats = calculateSectionStats(sec);
  return {
    [`${prefix} Questions`]: sec.questions,
    [`${prefix} Attempted`]: sec.attempted,
    [`${prefix} Correct`]: sec.correct,
    [`${prefix} Wrong`]: sec.wrong,
    [`${prefix} Unanswered`]: sec.unanswered,
    [`${prefix} Marks`]: sec.marks,
    [`${prefix} Time`]: formatTime(sec.timeSeconds),
    [`${prefix} Accuracy`]: stats.accuracy.toFixed(2),
    [`${prefix} Attempt Rate`]: stats.attemptRate.toFixed(2),
  };
}

export function exportToCSV(mocks: MockWithId[]): string {
  const sorted = [...mocks].sort((a, b) => a.mockNumber - b.mockNumber);

  const rows = sorted.map((mock) => {
    const overall = calculateOverall(mock.sections);
    const baseRow = {
      'Mock Number': mock.mockNumber,
      'Date': formatDate(mock.date),
      'Exam': mock.exam,
      'Test Series': mock.testSeries,
      'Test Type': mock.testType === 'full' ? 'Full Mock' : 'Sectional Mock',
      'Overall Questions': overall.questions,
      'Overall Attempted': overall.attempted,
      'Overall Correct': overall.correct,
      'Overall Wrong': overall.wrong,
      'Overall Unanswered': overall.unanswered,
      'Overall Score': overall.marks,
      'Overall Accuracy': overall.accuracy.toFixed(2),
      'Overall Attempt Rate': overall.attemptRate.toFixed(2),
      'Overall Time': formatTime(overall.timeSeconds),
      ...getSectionRow(mock.sections, 'english', 'English'),
      ...getSectionRow(mock.sections, 'numerical', 'Numerical'),
      ...getSectionRow(mock.sections, 'reasoning', 'Reasoning'),
    };
    return baseRow;
  });

  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = String((row as Record<string, string | number>)[h] ?? '');
        return val.includes(',') ? `"${val}"` : val;
      }).join(',')
    ),
  ];
  return csvLines.join('\n');
}

export function exportToJSON(mocks: MockWithId[]): string {
  const data = mocks.map((m) => ({
    ...m,
    date: getDate(m.date).toISOString(),
    createdAt: getDate(m.createdAt).toISOString(),
    updatedAt: getDate(m.updatedAt).toISOString(),
  }));
  return JSON.stringify(data, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
