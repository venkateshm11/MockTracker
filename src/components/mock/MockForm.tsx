import React, { useState, useMemo, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PREDEFINED_EXAMS, PREDEFINED_TEST_SERIES } from '../../constants/exams';
import {
  ALL_SECTION_CONFIGS,
  getSectionsForExamAndStage,
  isRRBExam,
  isSSCExam,
} from '../../constants/sections';
import { getSectionPattern } from '../../constants/examPatterns';
import { MockWithId, MockSections, TestType, ExamStage } from '../../types/mock';
import {
  calculateMockNumber,
  calculateOverall,
} from '../../utils/calculations';
import { validateMockForm } from '../../utils/validation';
import { formatTime, parseTimeInput } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/FormControls';
import { format } from 'date-fns';

interface SectionInput {
  attempted: string;
  correct: string;
  time: string; // MM:SS
}

const emptySectionInput = (): SectionInput => ({
  attempted: '',
  correct: '',
  time: '',
});

interface MockFormProps {
  existingMock?: MockWithId;
}

export function MockForm({ existingMock }: MockFormProps) {
  const {
    mocks,
    addNewMock,
    editMock,
    settings,
    addCustomExam,
    addCustomTestSeries,
    selectedExam,
    selectedTestSeries,
    setSelectedExam,
    setSelectedTestSeries,
    setIsAllExams,
  } = useApp();
  const navigate = useNavigate();

  // --- Form state ---
  const getAvailableSeriesForExam = (examName: string): string[] => {
    if (!examName) return [];
    const predefined = PREDEFINED_TEST_SERIES[examName] ?? [];
    const custom = settings.customTestSeries[examName] ?? [];
    return [...predefined, ...custom.filter((s) => !predefined.includes(s))];
  };

  const defaultExam = existingMock?.exam || selectedExam || PREDEFINED_EXAMS[0].name;
  const initialAvailableSeries = getAvailableSeriesForExam(defaultExam);
  const defaultSeries =
    existingMock?.testSeries ||
    (selectedTestSeries && initialAvailableSeries.includes(selectedTestSeries) ? selectedTestSeries : '') ||
    initialAvailableSeries[0] ||
    '';

  const [exam, setExam] = useState(defaultExam);
  const [customExamInput, setCustomExamInput] = useState('');
  const [showCustomExam, setShowCustomExam] = useState(false);

  const [testSeries, setTestSeries] = useState(defaultSeries);
  const [customSeriesInput, setCustomSeriesInput] = useState('');
  const [showCustomSeries, setShowCustomSeries] = useState(false);

  const [stage, setStage] = useState<ExamStage>(existingMock?.stage ?? 'prelims');
  const [testType, setTestType] = useState<TestType>(existingMock?.testType ?? 'full');
  const [date, setDate] = useState(() => {
    if (existingMock?.date) {
      const d = existingMock.date instanceof Timestamp
        ? existingMock.date.toDate()
        : new Date(existingMock.date);
      return format(d, 'yyyy-MM-dd');
    }
    return format(new Date(), 'yyyy-MM-dd');
  });

  const activeExamName = showCustomExam ? customExamInput.trim() : exam;
  const activeSectionConfigs = useMemo(() => {
    return getSectionsForExamAndStage(activeExamName, stage);
  }, [activeExamName, stage]);

  const [sections, setSections] = useState<Record<string, SectionInput>>(() => {
    const result: Record<string, SectionInput> = {};
    for (const { key } of ALL_SECTION_CONFIGS) {
      if (existingMock?.sections[key]) {
        const s = existingMock.sections[key];
        result[key] = {
          attempted: String(s.attempted),
          correct: String(s.correct),
          time: formatTime(s.timeSeconds),
        };
      } else {
        result[key] = emptySectionInput();
      }
    }
    return result;
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Reset section inputs when exam or stage changes (only for new mocks, not editing)
  useEffect(() => {
    if (!existingMock) {
      setSections((prev) => {
        const reset: Record<string, SectionInput> = {};
        for (const key of Object.keys(prev)) {
          reset[key] = emptySectionInput();
        }
        return reset;
      });
    }
  }, [activeExamName, stage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Exam options
  const examOptions = useMemo(() => {
    const predefined = PREDEFINED_EXAMS.map((e) => ({ value: e.name, label: e.name }));
    const custom = settings.customExams
      .filter((e) => !PREDEFINED_EXAMS.map((p) => p.name).includes(e))
      .map((e) => ({ value: e, label: e }));
    const allExams = [...predefined, ...custom];
    const showPlaceholder = !exam && !showCustomExam;
    return [
      ...(showPlaceholder ? [{ value: '', label: '-- Select Exam --' }] : []),
      ...allExams,
      { value: '__custom__', label: '+ Add Custom Exam' },
    ];
  }, [settings.customExams, exam, showCustomExam]);

  const seriesOptions = useMemo(() => {
    const currentExam = showCustomExam ? customExamInput.trim() : exam;
    if (!currentExam) {
      return [
        { value: '', label: '-- Select Test Series --' },
        { value: '__custom__', label: '+ Add Custom Series' },
      ];
    }
    const all = getAvailableSeriesForExam(currentExam);
    const opts = all.map((s) => ({ value: s, label: s }));
    const showPlaceholder = !testSeries && !showCustomSeries;
    return [
      ...(showPlaceholder ? [{ value: '', label: '-- Select Test Series --' }] : []),
      ...opts,
      { value: '__custom__', label: '+ Add Custom Series' },
    ];
  }, [exam, showCustomExam, customExamInput, testSeries, showCustomSeries, settings.customTestSeries]);

  // Mock number
  const mockNumber = useMemo(() => {
    if (existingMock) return existingMock.mockNumber;
    if (!exam || !testSeries) return null;
    return calculateMockNumber(mocks, exam, testSeries);
  }, [mocks, exam, testSeries, existingMock]);

  // Live summary
  const liveSummary = useMemo(() => {
    const builtSections: MockSections = {};
    for (const { key } of activeSectionConfigs) {
      const s = sections[key] || emptySectionInput();
      const pattern = getSectionPattern(activeExamName, stage, key);
      const attempted = parseFloat(s.attempted) || 0;
      const correct = parseFloat(s.correct) || 0;
      const wrong = Math.max(0, attempted - correct);
      const questions = pattern ? pattern.questions : 0;
      const marks = pattern
        ? correct * pattern.marksPerCorrect - wrong * pattern.negativeMarks
        : 0;
      builtSections[key] = {
        questions,
        attempted,
        correct,
        wrong,
        unanswered: Math.max(0, questions - attempted),
        marks: Math.round(marks * 100) / 100,
        timeSeconds: parseTimeInput(s.time),
      };
    }
    return calculateOverall(builtSections);
  }, [sections, activeSectionConfigs, activeExamName, stage]);

  const handleSectionChange = (key: string, field: keyof SectionInput, value: string) => {
    setSections((prev) => {
      const updated = { ...prev, [key]: { ...prev[key], [field]: value } };
      return updated;
    });
  };

  const handleExamChange = (val: string) => {
    if (val === '__custom__') {
      setShowCustomExam(true);
      setExam('');
      setTestSeries('');
    } else {
      setExam(val);
      setShowCustomExam(false);
      const available = getAvailableSeriesForExam(val);
      if (testSeries && available.includes(testSeries)) {
        // Keep current test series if available for the new exam
      } else {
        setTestSeries(available[0] ?? '');
      }
    }
  };

  const handleSeriesChange = (val: string) => {
    if (val === '__custom__') {
      setShowCustomSeries(true);
      setTestSeries('');
    } else {
      setTestSeries(val);
      setShowCustomSeries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalExam = showCustomExam ? customExamInput.trim() : exam;
    const finalSeries = showCustomSeries ? customSeriesInput.trim() : testSeries;

    // Build sections data using exam patterns
    const builtSections: MockSections = {};
    const sectionLabels: Record<string, string> = {};
    for (const { key, label } of activeSectionConfigs) {
      const s = sections[key] || emptySectionInput();
      const pattern = getSectionPattern(finalExam, stage, key);
      const attempted = parseFloat(s.attempted) || 0;
      const correct = parseFloat(s.correct) || 0;
      const wrong = Math.max(0, attempted - correct);
      const questions = pattern ? pattern.questions : 0;
      const marks = pattern
        ? Math.round((correct * pattern.marksPerCorrect - wrong * pattern.negativeMarks) * 100) / 100
        : 0;
      builtSections[key] = {
        questions,
        attempted,
        correct,
        wrong,
        unanswered: Math.max(0, questions - attempted),
        marks,
        timeSeconds: parseTimeInput(s.time),
      };
      sectionLabels[key] = label;
    }

    // Validate
    const validationErrors = validateMockForm({
      exam: finalExam,
      testSeries: finalSeries,
      sections: Object.fromEntries(
        Object.entries(builtSections).map(([k, v]) => [k, {
          questions: v.questions,
          attempted: v.attempted,
          correct: v.correct,
          wrong: v.wrong,
          marks: v.marks,
          timeSeconds: v.timeSeconds,
        }])
      ),
      sectionLabels,
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors.map((e) => e.message));
      const firstField = validationErrors[0].field;
      let targetId = '';
      if (firstField === 'exam') {
        targetId = showCustomExam ? 'form-custom-exam' : 'form-exam';
      } else if (firstField === 'testSeries') {
        targetId = showCustomSeries ? 'form-custom-series' : 'form-series';
      } else {
        targetId = firstField.replace('.', '-');
      }
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
      return;
    }

    setErrors([]);
    setSaving(true);

    try {
      // Save custom exam/series
      if (showCustomExam && customExamInput.trim()) {
        addCustomExam(customExamInput.trim());
      }
      if (showCustomSeries && customSeriesInput.trim()) {
        addCustomTestSeries(finalExam, customSeriesInput.trim());
      }

      const dateObj = new Date(date);
      const payload = {
        exam: finalExam,
        testSeries: finalSeries,
        stage,
        testType,
        date: Timestamp.fromDate(dateObj),
        sections: builtSections,
        mockNumber: mockNumber ?? 1,
      };

      if (existingMock) {
        await editMock(existingMock.id, payload);
        setSelectedExam(finalExam);
        setSelectedTestSeries(finalSeries);
        setIsAllExams(false);
        navigate(`/mocks/${existingMock.id}`);
      } else {
        const id = await addNewMock(payload);
        setSelectedExam(finalExam);
        setSelectedTestSeries(finalSeries);
        setIsAllExams(false);
        navigate(`/mocks/${id}`);
      }
    } catch (err: unknown) {
      setErrors([err instanceof Error ? err.message : 'Failed to save mock. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Header info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Exam */}
          <div>
            <Select
              id="form-exam"
              label="Exam"
              value={showCustomExam ? '__custom__' : exam}
              onChange={handleExamChange}
              options={examOptions}
              required
            />
            {showCustomExam && (
              <Input
                id="form-custom-exam"
                label="Custom Exam Name"
                value={customExamInput}
                onChange={setCustomExamInput}
                placeholder="e.g., SBI Apprentice"
                required
                className="mt-2"
              />
            )}
          </div>

          {/* Test Series */}
          <div>
            <Select
              id="form-series"
              label="Test Series"
              value={showCustomSeries ? '__custom__' : testSeries}
              onChange={handleSeriesChange}
              options={seriesOptions}
              disabled={!exam && !showCustomExam}
              required
            />
            {showCustomSeries && (
              <Input
                id="form-custom-series"
                label="Custom Series Name"
                value={customSeriesInput}
                onChange={setCustomSeriesInput}
                placeholder="e.g., My Study Group"
                required
                className="mt-2"
              />
            )}
          </div>

          {/* Exam Stage */}
          <Select
            id="form-stage"
            label="Exam Stage"
            value={stage}
            onChange={(v) => setStage(v as ExamStage)}
            options={[
              { value: 'prelims', label: 'Prelims' },
              { value: 'mains', label: 'Mains' },
            ]}
          />

          {/* Test Type */}
          <Select
            id="form-test-type"
            label="Test Type"
            value={testType}
            onChange={(v) => setTestType(v as TestType)}
            options={[
              { value: 'full', label: 'Full Mock' },
              { value: 'sectional', label: 'Sectional Mock' },
            ]}
          />

          {/* Date */}
          <Input
            id="form-date"
            label="Date"
            type="date"
            value={date}
            onChange={setDate}
            required
          />
        </div>

        {/* Mock Number */}
        {mockNumber !== null && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Mock Number</span>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
                <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  Mock #{mockNumber}
                </span>
              </div>
              <span className="text-xs text-slate-400">(auto-generated)</span>
            </div>
          </div>
        )}
      </div>

      {/* Section inputs header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Sections ({activeSectionConfigs.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stage === 'mains'
                ? isRRBExam(activeExamName)
                  ? 'RRB Mains: English, Numerical, Reasoning, General Awareness & Computer Awareness'
                  : 'Mains: English, Numerical, Reasoning & General Awareness'
                : isRRBExam(activeExamName)
                ? 'RRB Prelims: Numerical & Reasoning Ability (no English)'
                : isSSCExam(activeExamName)
                ? 'SSC CGL: English, Numerical, Reasoning & General Awareness'
                : 'Prelims: English, Numerical & Reasoning Ability'}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {stage === 'mains' && (
              <span className="px-2 py-0.5 rounded-full font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                + General Awareness
              </span>
            )}
            {isRRBExam(activeExamName) && stage === 'mains' && (
              <span className="px-2 py-0.5 rounded-full font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                + Computer Awareness
              </span>
            )}
            {isSSCExam(activeExamName) && stage === 'prelims' && (
              <span className="px-2 py-0.5 rounded-full font-medium bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                + General Awareness (SSC)
              </span>
            )}
            {isRRBExam(activeExamName) && stage === 'prelims' && (
              <span className="px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                − English (RRB Prelims)
              </span>
            )}
          </div>
        </div>

        {activeSectionConfigs.map(({ key, label, color }) => {
          const pattern = getSectionPattern(activeExamName, stage, key);
          const sec = sections[key];
          const attempted = parseFloat(sec?.attempted) || 0;
          const correct = parseFloat(sec?.correct) || 0;
          const wrong = Math.max(0, attempted - correct);
          const unanswered = pattern ? Math.max(0, pattern.questions - attempted) : 0;
          const marks = pattern
            ? Math.round((correct * pattern.marksPerCorrect - wrong * pattern.negativeMarks) * 100) / 100
            : 0;
          const hasPattern = !!pattern;

          return (
          <div
            key={key}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4"
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</h3>
              </div>
              {hasPattern && (
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
                    {pattern.questions}Q
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
                    +{pattern.marksPerCorrect} / −{pattern.negativeMarks}
                  </span>
                </div>
              )}
            </div>

            {/* User inputs: only Attempted + Correct + Time */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Input
                id={`${key}-attempted`}
                label="Attempted ✏️"
                type="number"
                value={sec?.attempted ?? ''}
                onChange={(v) => handleSectionChange(key, 'attempted', v)}
                min={0}
                max={hasPattern ? pattern.questions : undefined}
                placeholder="0"
              />
              <Input
                id={`${key}-correct`}
                label="Correct ✏️"
                type="number"
                value={sec?.correct ?? ''}
                onChange={(v) => handleSectionChange(key, 'correct', v)}
                min={0}
                placeholder="0"
              />
              <Input
                id={`${key}-time`}
                label="Time (MM:SS)"
                value={sec?.time ?? ''}
                onChange={(v) => handleSectionChange(key, 'time', v)}
                placeholder={hasPattern ? formatTime(pattern.timeSeconds) : '20:00'}
              />
            </div>

            {/* Auto-calculated read-only stats */}
            {hasPattern && (
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Total Q</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{pattern.questions}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Wrong</p>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">{attempted > 0 ? wrong : '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Unanswered</p>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{attempted > 0 ? unanswered : '—'}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Score</p>
                  <p className={`text-sm font-bold ${marks >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {attempted > 0 ? marks.toFixed(2) : '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Live Summary */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-3">
          Live Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Overall Score</p>
            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{liveSummary.marks.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Accuracy</p>
            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{liveSummary.accuracy.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Attempted</p>
            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
              {liveSummary.attempted}/{liveSummary.questions}
            </p>
          </div>
          <div>
            <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Time</p>
            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{formatTime(liveSummary.timeSeconds)}</p>
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Please fix the following:</p>
          <ul className="space-y-1">
            {errors.map((err, i) => (
              <li key={i} className="text-sm text-red-600 dark:text-red-400">• {err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {existingMock ? 'Save Changes' : 'Save Mock'}
        </Button>
      </div>
    </form>
  );
}
