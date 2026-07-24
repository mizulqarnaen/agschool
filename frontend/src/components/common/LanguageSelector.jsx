import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector = ({ variant = 'full' }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:border-cyan-500/50 transition-colors shadow-sm">
        <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
        <select
          value={i18n.language || 'id'}
          onChange={handleLanguageChange}
          className="bg-transparent focus:outline-none cursor-pointer text-cyan-300 font-bold text-xs"
        >
          <option value="id" className="bg-slate-900 text-white font-normal">ID (Bahasa)</option>
          <option value="en" className="bg-slate-900 text-white font-normal">EN (English)</option>
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="text-[11px] text-slate-400 uppercase font-semibold">Language</span>
      </div>
      <select
        value={i18n.language || 'id'}
        onChange={handleLanguageChange}
        className="bg-transparent focus:outline-none cursor-pointer text-cyan-300 font-bold text-xs pl-2 text-right"
      >
        <option value="id" className="bg-slate-900 text-white font-normal">ID (Bahasa)</option>
        <option value="en" className="bg-slate-900 text-white font-normal">EN (English)</option>
      </select>
    </div>
  );
};
