import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ iconOnly = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
        isDark
          ? 'bg-slate-900 text-amber-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
      } ${className}`}
      title={isDark ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
      {!iconOnly && (
        <span className="hidden sm:inline text-xs font-bold ml-1">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
