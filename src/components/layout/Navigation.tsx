import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  List,
  TrendingUp,
  Plus,
  GitCompare,
  Settings,
  LogOut,
  BarChart3,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { signOutUser } from '../../firebase/auth';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/mocks', icon: List, label: 'Mocks' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/compare', icon: GitCompare, label: 'Compare' },
  { to: '/add', icon: Plus, label: 'Add Mock' },
];

export function Sidebar() {
  const { user } = useApp();

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 min-h-screen sticky top-0">
      {/* Brand */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">MockTrack</h1>
            <p className="text-[10px] text-slate-400">Performance Tracker</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3" aria-label="Main navigation">
        <ul className="space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <button
          onClick={signOutUser}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
        {user && (
          <div className="pt-2 px-3">
            <p className="text-xs text-slate-400 truncate">{user.displayName ?? user.email}</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export function BottomNav() {
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-40 safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <ul className="flex">
        {navItems.slice(0, 4).map(({ to, icon: Icon, label }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-center transition-colors ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          </li>
        ))}
        {/* Plus button */}
        <li className="flex-1">
          <NavLink
            to="/add"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-center transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center -mt-1">
              <Plus size={16} className="text-white" />
            </div>
            <span className="text-[10px] font-medium">Add</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
