import React from 'react';
import { Shield, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const PublicFooter = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t mt-16 py-8 transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950/80 border-slate-800/80 text-slate-400'
        : 'bg-white border-slate-200 text-slate-600 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span className="font-medium">AG School Public Transparency Portal &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span>This portal displays event information, winners, and prize status only. Operational finances remain confidential.</span>
        </div>
      </div>
    </footer>
  );
};
