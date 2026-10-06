import { useState, useCallback, useEffect } from 'react';
import { UserSettings } from '../types/user';

const SETTINGS_KEY = 'mocktrack_settings';

const defaultSettings: UserSettings = {
  theme: 'system',
  defaultExam: null,
  defaultTestSeries: null,
  lastSelectedExam: null,
  lastSelectedTestSeries: null,
  customExams: [],
  customTestSeries: {},
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const addCustomExam = useCallback((examName: string) => {
    setSettings((prev) => ({
      ...prev,
      customExams: prev.customExams.includes(examName)
        ? prev.customExams
        : [...prev.customExams, examName],
    }));
  }, []);

  const addCustomTestSeries = useCallback((examName: string, seriesName: string) => {
    setSettings((prev) => {
      const existing = prev.customTestSeries[examName] || [];
      if (existing.includes(seriesName)) return prev;
      return {
        ...prev,
        customTestSeries: {
          ...prev.customTestSeries,
          [examName]: [...existing, seriesName],
        },
      };
    });
  }, []);

  return { settings, updateSettings, addCustomExam, addCustomTestSeries };
}
