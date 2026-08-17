import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { AlertCircle, ShieldCheck, Trophy } from 'lucide-react';

export const PublicNavbar = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isDark = theme === 'dark';

  // Determine current active tab
  const currentTab = searchParams.get('tab');
  const isHomeActive = location.pathname === '/events';
  const isKompensasiActive = location.pathname === '/compensation' && currentTab === 'kompensasi';
  const isTunggakanActive = !isHomeActive && !isKompensasiActive;

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-300 border-b backdrop-blur-md ${
      isDark
        ? 'bg-slate-950/85 border-slate-800/80 text-white'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo (Left) */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-md flex items-center justify-center p-0.5 transition-transform group-hover:scale-105 ${
            isDark
              ? 'bg-slate-900 border border-slate-700/80 glow-cyan'
              : 'bg-slate-100 border border-slate-300'
          }`}>
            <img
              src="/logo.png"
              alt="AG School Crest Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className={`font-black text-sm sm:text-base tracking-tight block ${
              isDark
                ? 'bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent'
                : 'text-slate-900'
            }`}>
              AG School
            </span>
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase block ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              {t('transparency_portal')}
            </span>
          </div>
        </Link>

        {/* 3 CENTER NAVIGATION TABS */}
        <nav className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl border bg-slate-900/60 border-slate-800/80">
          {/* Tab 1: Data Tunggakan (Default) */}
          <Link
            to="/compensation?tab=tunggakan"
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              isTunggakanActive
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>Data Tunggakan</span>
          </Link>

          {/* Tab 2: Kompensasi AGCL */}
          <Link
            to="/compensation?tab=kompensasi"
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              isKompensasiActive
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Kompensasi AGCL</span>
          </Link>

          {/* Tab 3: Home / Events */}
          <Link
            to="/events"
            className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              isHomeActive
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Home</span>
          </Link>
        </nav>

        {/* Right Ultra-Minimal Controls (Theme & Language only) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Switcher Button (Icon Only) */}
          <ThemeToggle iconOnly={true} />

          {/* Language Selector Button (ID / EN Toggle) */}
          <LanguageSelector variant="toggle" />
        </div>
      </div>
    </header>
  );
};
