import React from 'react';
import { Shield, Info, Heart, Code2, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const PublicFooter = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`border-t mt-16 py-10 transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950/90 border-slate-800/80 text-slate-400'
        : 'bg-white border-slate-200 text-slate-600 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs">
        {/* Top Info Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800/40">
          <div className="flex items-center gap-2.5">
            <Shield className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <span className="font-semibold text-slate-300 dark:text-slate-300">
              AG School Public Transparency Portal &copy; {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Info className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            <span>Portal ini menampilkan informasi acara resmi, pemenang, status hadiah & kompensasi komunitas.</span>
          </div>
        </div>

        {/* Developer Credit & Promotion Badge (Kang Iqbal) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-slate-400 font-medium">
              Designed & Developed with <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500 animate-pulse mx-0.5" /> by{' '}
              <strong className="text-white dark:text-white font-extrabold text-sm tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Kang Iqbal
              </strong>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-[11px] font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Official Developer & Technology Partner</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
