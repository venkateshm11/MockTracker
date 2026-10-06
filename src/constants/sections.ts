export interface SectionConfig {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
}

export const SECTION_CONFIGS: SectionConfig[] = [
  { key: 'english', label: 'English', shortLabel: 'ENG', color: '#6366f1' },
  { key: 'numerical', label: 'Numerical Ability', shortLabel: 'NUM', color: '#f59e0b' },
  { key: 'reasoning', label: 'Reasoning Ability', shortLabel: 'RES', color: '#10b981' },
];

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
