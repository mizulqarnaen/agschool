import React from 'react';
import { Shield, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const PublicFooter = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t mt-16 py-6 transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950/90 border-slate-800/80 text-slate-400'
        : 'bg-white border-slate-200 text-slate-600 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        {/* Left: Portal Title & Copyright */}
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          <span className="font-bold text-slate-300 dark:text-slate-300">
            AG School Public Transparency Portal &copy; {new Date().getFullYear()}
          </span>
        </div>

        {/* Right: Developer Credit (Kang Iqbal) */}
        <div className="flex items-center gap-1.5 font-medium text-slate-400">
          <span>Designed & Developed with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse mx-0.5" />
          <span>by</span>
          <strong className="text-white dark:text-white font-extrabold tracking-wide">
            Kang Iqbal
          </strong>
        </div>
      </div>
    </footer>
  );
};
