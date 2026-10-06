import React from 'react';
import { MockForm } from '../components/mock/MockForm';

export default function AddMockPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Mock</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Record your latest mock test result</p>
      </div>
      <MockForm />
    </div>
  );
}
