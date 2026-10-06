import React, { ReactNode } from 'react';
import { Sidebar, BottomNav } from './Navigation';
import { BarChart3 } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">MockTrack</span>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 max-w-4xl w-full mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
