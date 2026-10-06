export interface ExamConfig {
  id: string;
  name: string;
  isCustom?: boolean;
}

export interface TestSeriesConfig {
  id: string;
  name: string;
  examId: string;
  isCustom?: boolean;
}

export interface AnalyticsContext {
  exam: string | null;
  testSeries: string | null;
  isAllExams: boolean;
}
