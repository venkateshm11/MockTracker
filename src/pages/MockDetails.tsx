import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateOverall, calculateSectionStats } from '../utils/calculations';
import { formatDate, formatScore, formatPercent, formatTime } from '../utils/formatters';
import { SECTION_CONFIGS } from '../constants/sections';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Edit, Calendar, BookOpen } from 'lucide-react';

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

export default function MockDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { mocks } = useApp();
  const navigate = useNavigate();

  const mock = mocks.find((m) => m.id === id);

  if (!mock) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400">Mock not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const overall = calculateOverall(mock.sections);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mock #{mock.mockNumber}</h2>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(mock.date)}
              </span>
              <span>•</span>
              <span>{mock.exam}</span>
              <span>•</span>
              <span>{mock.testSeries}</span>
              <span>•</span>
              <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                mock.stage === 'mains'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
              }`}>
                {mock.stage === 'mains' ? 'Mains' : 'Prelims'}
              </span>
              <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                mock.testType === 'full'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}>
                {mock.testType === 'full' ? 'Full Mock' : 'Sectional Mock'}
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={<Edit size={14} />}
          onClick={() => navigate(`/mocks/${mock.id}/edit`)}
          id="mock-details-edit-btn"
        >
          Edit
        </Button>
      </div>

      {/* Overall summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
          <BookOpen size={14} />
          Overall Performance
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{formatScore(overall.marks)}</p>
            <p className="text-xs text-indigo-500/70 dark:text-indigo-400/70">Score</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatPercent(overall.accuracy)}</p>
            <p className="text-xs text-emerald-500/70 dark:text-emerald-400/70">Accuracy</p>
          </div>
          <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{formatPercent(overall.attemptRate)}</p>
            <p className="text-xs text-amber-500/70 dark:text-amber-400/70">Attempt Rate</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{formatTime(overall.timeSeconds)}</p>
            <p className="text-xs text-slate-500">Time</p>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
          <StatRow label="Total Questions" value={overall.questions} />
          <StatRow label="Attempted" value={overall.attempted} />
          <StatRow label="Correct" value={overall.correct} />
          <StatRow label="Wrong" value={overall.wrong} />
          <StatRow label="Unanswered" value={overall.unanswered} />
        </div>
      </div>

      {/* Section breakdowns */}
      {SECTION_CONFIGS.map(({ key, label, color }) => {
        const sec = mock.sections[key];
        if (!sec) return null;
        const stats = calculateSectionStats(sec);
        return (
          <div key={key} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatScore(sec.marks)}</p>
                <p className="text-xs text-slate-400">Score</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatPercent(stats.accuracy)}</p>
                <p className="text-xs text-slate-400">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{formatTime(sec.timeSeconds)}</p>
                <p className="text-xs text-slate-400">Time</p>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
              <StatRow label="Questions" value={sec.questions} />
              <StatRow label="Attempted" value={sec.attempted} />
              <StatRow label="Correct" value={sec.correct} />
              <StatRow label="Wrong" value={sec.wrong} />
              <StatRow label="Unanswered" value={sec.unanswered} />
              <StatRow label="Attempt Rate" value={formatPercent(stats.attemptRate)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
