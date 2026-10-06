export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserSettings {
  theme: 'system' | 'light' | 'dark';
  defaultExam: string | null;
  defaultTestSeries: string | null;
  lastSelectedExam: string | null;
  lastSelectedTestSeries: string | null;
  customExams: string[];
  customTestSeries: { [examName: string]: string[] };
}
