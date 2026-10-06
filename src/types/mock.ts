import { Timestamp } from 'firebase/firestore';

export interface SectionData {
  questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unanswered: number;
  marks: number;
  timeSeconds: number;
}

export type SectionKey = 'english' | 'numerical' | 'reasoning' | string;

export interface MockSections {
  english: SectionData;
  numerical: SectionData;
  reasoning: SectionData;
  [key: string]: SectionData;
}

export type TestType = 'full' | 'sectional';

export interface MockDocument {
  id?: string;
  mockNumber: number;
  exam: string;
  testSeries: string;
  testType: TestType;
  date: Timestamp | Date;
  sections: MockSections;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface MockWithId extends MockDocument {
  id: string;
}

export interface OverallStats {
  questions: number;
  attempted: number;
  correct: number;
  wrong: number;
  unanswered: number;
  marks: number;
  timeSeconds: number;
  accuracy: number;
  attemptRate: number;
  wrongRate: number;
}

export interface SectionStats extends SectionData {
  accuracy: number;
  attemptRate: number;
  wrongRate: number;
}

export interface PersonalBests {
  highestScore: number | null;
  highestAccuracy: number | null;
  highestAttemptRate: number | null;
  sections: {
    [key: string]: {
      highestScore: number | null;
      highestAccuracy: number | null;
    };
  };
}

export type TrendStatus = 'improving' | 'stable' | 'declining' | 'insufficient';

export interface SectionTrendData {
  section: SectionKey | 'overall';
  status: TrendStatus;
  recentAvg: number;
  previousAvg: number;
}
