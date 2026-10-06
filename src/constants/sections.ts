import { ExamStage } from '../types/mock';

export interface SectionConfig {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
}

export const ALL_SECTION_CONFIGS: SectionConfig[] = [
  { key: 'english', label: 'English', shortLabel: 'ENG', color: '#6366f1' },
  { key: 'numerical', label: 'Numerical Ability', shortLabel: 'NUM', color: '#f59e0b' },
  { key: 'reasoning', label: 'Reasoning Ability', shortLabel: 'RES', color: '#10b981' },
  { key: 'general_awareness', label: 'General Awareness', shortLabel: 'GA', color: '#ec4899' },
  { key: 'computer_awareness', label: 'Computer Awareness', shortLabel: 'COMP', color: '#06b6d4' },
];

export const SECTION_CONFIGS: SectionConfig[] = ALL_SECTION_CONFIGS;

export const DEFAULT_SECTION_DATA = {
  questions: 0,
  attempted: 0,
  correct: 0,
  wrong: 0,
  unanswered: 0,
  marks: 0,
  timeSeconds: 0,
};

export const TREND_THRESHOLD_PERCENT = 3;

export function isRRBExam(examName: string): boolean {
  return /rrb/i.test(examName || '');
}

export function isSSCExam(examName: string): boolean {
  return /ssc/i.test(examName || '');
}

export function getSectionsForExamAndStage(
  exam: string,
  stage: ExamStage = 'prelims'
): SectionConfig[] {
  const sections: SectionConfig[] = [
    { key: 'english', label: 'English', shortLabel: 'ENG', color: '#6366f1' },
    { key: 'numerical', label: 'Numerical Ability', shortLabel: 'NUM', color: '#f59e0b' },
    { key: 'reasoning', label: 'Reasoning Ability', shortLabel: 'RES', color: '#10b981' },
  ];

  // General Awareness:
  // - When Mains is selected (all exams)
  // - When SSC CGL is selected (even for prelims)
  const needsGA = stage === 'mains' || isSSCExam(exam);
  if (needsGA) {
    sections.push({
      key: 'general_awareness',
      label: 'General Awareness',
      shortLabel: 'GA',
      color: '#ec4899',
    });
  }

  // Computer Awareness:
  // - When RRB exam AND stage is Mains
  const needsComputer = isRRBExam(exam) && stage === 'mains';
  if (needsComputer) {
    sections.push({
      key: 'computer_awareness',
      label: 'Computer Awareness',
      shortLabel: 'COMP',
      color: '#06b6d4',
    });
  }

  return sections;
}

