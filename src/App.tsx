import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { Skeleton } from './components/ui/Skeleton';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import LoginPage from './pages/Login';

// Lazy load authenticated sub-pages
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const AddMockPage = lazy(() => import('./pages/AddMock'));
const MockHistoryPage = lazy(() => import('./pages/MockHistory'));
const MockDetailsPage = lazy(() => import('./pages/MockDetails'));
const EditMockPage = lazy(() => import('./pages/EditMock'));
const ProgressPage = lazy(() => import('./pages/Progress'));
const ComparePage = lazy(() => import('./pages/Compare'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function LoadingFallback() {
  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4 pt-8">
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}

function ProtectedRoutes() {
  const { user, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-base tracking-wider">MT</span>
          </div>
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <AppShell>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/add" element={<AddMockPage />} />
          <Route path="/mocks" element={<MockHistoryPage />} />
          <Route path="/mocks/:id" element={<MockDetailsPage />} />
          <Route path="/mocks/:id/edit" element={<EditMockPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <ProtectedRoutes />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
