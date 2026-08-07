import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-300 flex items-center gap-1.5 text-xs font-bold ${
        theme === 'dark'
          ? 'bg-slate-900/90 text-amber-400 border-amber-500/40 hover:bg-slate-800 shadow-md shadow-amber-500/10'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 shadow-sm hover:text-amber-600'
      } ${className}`}
      title={theme === 'dark' ? 'Ganti ke Mode Terang (Light Mode)' : 'Ganti ke Mode Gelap (Dark Mode)'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <>
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span className="hidden sm:inline text-amber-300 font-semibold">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-600" />
          <span className="hidden sm:inline text-slate-700 font-semibold">Dark</span>
        </>
      )}
    </button>
  );
};
