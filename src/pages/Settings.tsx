import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { Button } from '../components/ui/Button';
import { PREDEFINED_EXAMS, PREDEFINED_TEST_SERIES } from '../constants/exams';
import { exportToCSV, exportToJSON, downloadFile } from '../utils/export';
import { parseImportJSON } from '../utils/import';
import { batchImportMocks } from '../firebase/firestore';
import { signOutUser } from '../firebase/auth';
import {
  Sun, Moon, Monitor, Download, Upload, LogOut, User, Trash2,
  ChevronRight, AlertTriangle,
} from 'lucide-react';

export default function SettingsPage() {
  const {
    user,
    mocks,
    settings,
    updateSettings,
    addCustomExam,
    addCustomTestSeries,
    selectedExam,
    selectedTestSeries,
    isAllExams,
  } = useApp();

  const { contextMocks } = useAnalytics(mocks, selectedExam, selectedTestSeries, isAllExams);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<ReturnType<typeof parseImportJSON> | null>(null);
  const [importFile, setImportFile] = useState<string | null>(null);
  const [customExamInput, setCustomExamInput] = useState('');
  const [customSeriesExam, setCustomSeriesExam] = useState('');
  const [customSeriesInput, setCustomSeriesInput] = useState('');
  const [importConfirm, setImportConfirm] = useState(false);

  const handleExportCSV = () => {
    const data = isAllExams ? mocks : contextMocks;
    const csv = exportToCSV(data);
    const filename = isAllExams
      ? 'mocktrack_all_data.csv'
      : `mocktrack_${selectedExam}_${selectedTestSeries}.csv`.replace(/\s+/g, '_');
    downloadFile(csv, filename, 'text/csv');
  };

  const handleExportJSON = () => {
    const data = isAllExams ? mocks : contextMocks;
    const json = exportToJSON(data);
    const filename = isAllExams
      ? 'mocktrack_all_data.json'
      : `mocktrack_${selectedExam}_${selectedTestSeries}.json`.replace(/\s+/g, '_');
    downloadFile(json, filename, 'application/json');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setImportFile(text);
      const result = parseImportJSON(text);
      setImportPreview(result);
      setImportStatus(null);
      setImportConfirm(false);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importFile || !user) return;
    const result = parseImportJSON(importFile);
    if (result.errors.length > 0) {
      setImportStatus(`Errors: ${result.errors.join(', ')}`);
      return;
    }
    try {
      const count = await batchImportMocks(user.uid, result.valid.map(({ id, ...rest }) => rest));
      setImportStatus(`Successfully imported ${count} mocks.`);
      setImportPreview(null);
      setImportFile(null);
      setImportConfirm(false);
    } catch (err: unknown) {
      setImportStatus(err instanceof Error ? err.message : 'Import failed.');
    }
  };

  const allExams = [...PREDEFINED_EXAMS.map((e) => e.name), ...settings.customExams];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your preferences and data</p>
      </div>

      {/* Profile */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3 mb-3">
          <User size={16} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Profile</h3>
        </div>
        {user?.photoURL && (
          <img src={user.photoURL} alt="Profile" className="w-12 h-12 rounded-full mb-3" />
        )}
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.displayName ?? 'User'}</p>
        <p className="text-xs text-slate-400">{user?.email}</p>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Theme</h3>
        <div className="flex gap-2">
          {([
            { value: 'system', icon: Monitor, label: 'System' },
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
          ] as const).map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => updateSettings({ theme: value })}
              id={`theme-${value}-btn`}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors ${
                settings.theme === value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Exams */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add Custom Exam</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customExamInput}
            onChange={(e) => setCustomExamInput(e.target.value)}
            placeholder="Exam name..."
            id="custom-exam-input"
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Button
            size="sm"
            onClick={() => {
              if (customExamInput.trim()) {
                addCustomExam(customExamInput.trim());
                setCustomExamInput('');
              }
            }}
            id="add-custom-exam-btn"
          >
            Add
          </Button>
        </div>
        {settings.customExams.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {settings.customExams.map((e) => (
              <span key={e} className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                {e}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Custom Test Series */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Add Custom Test Series</h3>
        <div className="space-y-2">
          <select
            value={customSeriesExam}
            onChange={(e) => setCustomSeriesExam(e.target.value)}
            id="custom-series-exam-select"
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Exam</option>
            {allExams.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSeriesInput}
              onChange={(e) => setCustomSeriesInput(e.target.value)}
              placeholder="Series name..."
              id="custom-series-input"
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button
              size="sm"
              onClick={() => {
                if (customSeriesExam && customSeriesInput.trim()) {
                  addCustomTestSeries(customSeriesExam, customSeriesInput.trim());
                  setCustomSeriesInput('');
                }
              }}
              id="add-custom-series-btn"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Export Data</h3>
        <p className="text-xs text-slate-400 mb-3">
          Exports {isAllExams ? 'all mocks' : `${selectedExam} → ${selectedTestSeries} mocks`} ({(isAllExams ? mocks : contextMocks).length} records)
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportCSV}
            id="export-csv-btn"
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportJSON}
            id="export-json-btn"
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Import */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Import Data</h3>
        <p className="text-xs text-slate-400 mb-3">Restore from a JSON backup file. Existing records are not overwritten.</p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
          id="import-file-input"
        />
        <Button
          variant="secondary"
          size="sm"
          icon={<Upload size={14} />}
          onClick={() => fileInputRef.current?.click()}
          id="import-file-btn"
        >
          Choose JSON File
        </Button>

        {importPreview && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Preview Import</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  {importPreview.summary.total} mocks from {importPreview.summary.exams.join(', ')}
                </p>
                {importPreview.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">Errors: {importPreview.errors.join(', ')}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleImport} id="confirm-import-btn">
                Confirm Import
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => { setImportPreview(null); setImportFile(null); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {importStatus && (
          <p className={`mt-2 text-xs ${importStatus.startsWith('Successfully') ? 'text-emerald-600' : 'text-red-600'}`}>
            {importStatus}
          </p>
        )}
      </div>

      {/* Sign out */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <Button
          variant="danger"
          size="sm"
          icon={<LogOut size={14} />}
          onClick={signOutUser}
          id="settings-signout-btn"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
