import { ExamConfig } from '../types/exam';

export const PREDEFINED_EXAMS: ExamConfig[] = [
  { id: 'ibps-po', name: 'IBPS PO' },
  { id: 'ibps-clerk', name: 'IBPS Clerk' },
  { id: 'sbi-po', name: 'SBI PO' },
  { id: 'sbi-clerk', name: 'SBI Clerk' },
  { id: 'rrb-po', name: 'RRB PO' },
  { id: 'rrb-clerk', name: 'RRB Clerk' },
  { id: 'ssc-cgl', name: 'SSC CGL' },
];

export const PREDEFINED_TEST_SERIES: Record<string, string[]> = {
  'IBPS PO': ["Sreedhar's CCE", 'Testbook', 'Oliveboard', 'BYJU\'s', 'Adda247'],
  'IBPS Clerk': ["Sreedhar's CCE", 'Testbook', 'Oliveboard', 'Adda247'],
  'SBI PO': ["Sreedhar's CCE", 'Testbook', 'Oliveboard', 'BYJU\'s', 'Adda247'],
  'SBI Clerk': ["Sreedhar's CCE", 'Testbook', 'Oliveboard', 'Adda247'],
  'RRB PO': ["Sreedhar's CCE", 'Testbook', 'Oliveboard'],
  'RRB Clerk': ["Sreedhar's CCE", 'Testbook', 'Oliveboard'],
  'SSC CGL': ['Testbook', 'Oliveboard', 'Adda247', 'Career Power'],
};

export const ALL_EXAMS_OPTION = '__ALL_EXAMS__';
