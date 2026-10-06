import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  continueAsGuest,
  createLocalAccount,
} from '../firebase/auth';
import { isFirebaseConfigured } from '../firebase/config';
import { BarChart3, ShieldCheck, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLocalFallback, setShowLocalFallback] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGuest = () => {
    try {
      continueAsGuest('Aspirant');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Guest login failed');
    }
  };

  const handleCreateLocal = () => {
    if (!email) {
      setError('Please enter an email address above.');
      return;
    }
    createLocalAccount(email);
    navigate('/', { replace: true });
  };

  const handleGoogle = async () => {
    setError('');
    setShowLocalFallback(false);
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found')) {
        setError(
          'Firebase Authentication is not activated in your project yet. Enable it in Firebase Console → Authentication, or use offline access below.'
        );
        setShowLocalFallback(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowLocalFallback(false);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = err instanceof Error ? err.message : 'Authentication failed.';

      if (code === 'auth/configuration-not-found' || msg.includes('configuration-not-found')) {
        setError(
          'Firebase Authentication is not activated in this project yet (console.firebase.google.com → Authentication → "Get Started").'
        );
        setShowLocalFallback(true);
      } else if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
        setError(
          'Email/Password sign-in is disabled in your Firebase project. Go to Firebase Console → Authentication → Sign-in method, and enable "Email/Password".'
        );
        setShowLocalFallback(true);
      } else if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
        setError('This email is already registered. Please switch to "Sign In" above.');
      } else if (code === 'auth/weak-password' || msg.includes('weak-password')) {
        setError('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
        setError('Please enter a valid email address.');
      } else if (
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-credential' ||
        msg.includes('user-not-found') ||
        msg.includes('wrong-password') ||
        msg.includes('invalid-credential')
      ) {
        setError('Invalid email or password.');
      } else {
        setError(msg);
        setShowLocalFallback(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">MockTracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Competitive Exam Performance Analytics</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          
          {/* Guest / Instant Access Button */}
          <div className="bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl p-3.5 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
              <Zap size={14} className="text-indigo-600 dark:text-indigo-400" />
              <span>Instant Offline-First Tracker</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              No registration or setup required. Stored securely on your device.
            </p>
            <Button
              type="button"
              onClick={handleGuest}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg text-sm transition-all shadow-md shadow-indigo-500/20"
              id="continue-as-guest-btn"
            >
              Continue as Guest (Instant Access)
            </Button>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-slate-400 bg-white dark:bg-slate-900 font-medium">
                or sign in / sign up
              </span>
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
            {(['signup', 'signin'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError('');
                  setShowLocalFallback(false);
                }}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  mode === m
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {m === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            ))}
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
            id="google-signin-btn"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-3 pt-1">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="text-xs bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-3 rounded-lg space-y-2">
                <p className="text-red-700 dark:text-red-300 font-medium leading-relaxed">
                  {error}
                </p>
                {showLocalFallback && (
                  <button
                    type="button"
                    onClick={handleCreateLocal}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-md border border-indigo-200 dark:border-indigo-800/60 shadow-sm transition-colors"
                  >
                    <span>Create Local Account with this Email</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="md"
              id="email-auth-btn"
            >
              {mode === 'signup' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mt-5">
          <ShieldCheck size={14} />
          <span>Local-first architecture. 100% private offline storage.</span>
        </div>
      </div>
    </div>
  );
}
