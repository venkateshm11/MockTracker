import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { MockForm } from '../components/mock/MockForm';
import { ArrowLeft } from 'lucide-react';

export default function EditMockPage() {
  const { id } = useParams<{ id: string }>();
  const { mocks } = useApp();
  const navigate = useNavigate();

  const mock = mocks.find((m) => m.id === id);

  if (!mock) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400">Mock not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Mock #{mock.mockNumber}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{mock.exam} → {mock.testSeries}</p>
        </div>
      </div>
      <MockForm existingMock={mock} />
    </div>
  );
}
