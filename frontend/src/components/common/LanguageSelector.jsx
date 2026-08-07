import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const LanguageSelector = ({ variant = 'full' }) => {
  const { i18n } = useTranslation();
  let isDark = true;

  try {
    const { theme } = useTheme();
    isDark = theme === 'dark';
  } catch (_) {
    // Fallback if rendered outside ThemeProvider
  }

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border text-xs font-semibold transition-all ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-cyan-500/50 shadow-sm'
          : 'bg-white border-slate-300 text-slate-800 hover:border-cyan-600 shadow-xs'
      }`}>
        <Globe className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
        <select
          value={i18n.language || 'id'}
          onChange={handleLanguageChange}
          className={`bg-transparent focus:outline-none cursor-pointer font-bold text-xs ${
            isDark ? 'text-cyan-300' : 'text-cyan-800'
          }`}
        >
          <option value="id" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>ID (Bahasa)</option>
          <option value="en" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>EN (English)</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between w-full px-3.5 py-2 rounded-xl border text-xs font-semibold ${
      isDark
        ? 'bg-slate-900/90 border-slate-700/80 text-slate-300'
        : 'bg-white border-slate-300 text-slate-800'
    }`}>
      <div className="flex items-center gap-2">
        <Globe className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
        <span className={`text-[11px] uppercase font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Language</span>
      </div>
      <select
        value={i18n.language || 'id'}
        onChange={handleLanguageChange}
        className={`bg-transparent focus:outline-none cursor-pointer font-bold text-xs pl-2 text-right ${
          isDark ? 'text-cyan-300' : 'text-cyan-800'
        }`}
      >
        <option value="id" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>ID (Bahasa)</option>
        <option value="en" className={isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}>EN (English)</option>
      </select>
    </div>
  );
};
