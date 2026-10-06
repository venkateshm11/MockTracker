import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { AppUser } from '../firebase/auth';
import { useAuth } from '../hooks/useAuth';
import { useMocks } from '../hooks/useMocks';
import { useSettings } from '../hooks/useSettings';
import { MockWithId } from '../types/mock';
import { UserSettings } from '../types/user';
import { ALL_EXAMS_OPTION } from '../constants/exams';

interface AppContextValue {
  user: AppUser | null;
  authLoading: boolean;
  mocks: MockWithId[];
  mocksLoading: boolean;
  mocksError: string | null;
  addNewMock: ReturnType<typeof useMocks>['addNewMock'];
  editMock: ReturnType<typeof useMocks>['editMock'];
  settings: UserSettings;
  updateSettings: ReturnType<typeof useSettings>['updateSettings'];
  addCustomExam: ReturnType<typeof useSettings>['addCustomExam'];
  addCustomTestSeries: ReturnType<typeof useSettings>['addCustomTestSeries'];
  selectedExam: string | null;
  selectedTestSeries: string | null;
  isAllExams: boolean;
  setSelectedExam: (exam: string | null) => void;
  setSelectedTestSeries: (ts: string | null) => void;
  setIsAllExams: (val: boolean) => void;
  theme: 'light' | 'dark';
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { mocks, loading: mocksLoading, error: mocksError, addNewMock, editMock } = useMocks(user?.uid ?? null);
  const { settings, updateSettings, addCustomExam, addCustomTestSeries } = useSettings();

  const [selectedExam, setSelectedExamState] = useState<string | null>(
    settings.lastSelectedExam ?? null
  );
  const [selectedTestSeries, setSelectedTestSeriesState] = useState<string | null>(
    settings.lastSelectedTestSeries ?? null
  );
  const [isAllExams, setIsAllExams] = useState(false);

  // System theme detection
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (settings.theme === 'dark') return 'dark';
    if (settings.theme === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (settings.theme !== 'system') {
      setTheme(settings.theme);
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setTheme(mq.matches ? 'dark' : 'light');
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setSelectedExam = (exam: string | null) => {
    setSelectedExamState(exam);
    updateSettings({ lastSelectedExam: exam });
  };

  const setSelectedTestSeries = (ts: string | null) => {
    setSelectedTestSeriesState(ts);
    updateSettings({ lastSelectedTestSeries: ts });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        authLoading,
        mocks,
        mocksLoading,
        mocksError,
        addNewMock,
        editMock,
        settings,
        updateSettings,
        addCustomExam,
        addCustomTestSeries,
        selectedExam,
        selectedTestSeries,
        isAllExams,
        setSelectedExam,
        setSelectedTestSeries,
        setIsAllExams,
        theme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
