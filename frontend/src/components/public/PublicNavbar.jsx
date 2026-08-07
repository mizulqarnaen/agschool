import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export const PublicNavbar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-300 border-b backdrop-blur-md ${
      isDark
        ? 'bg-slate-950/80 border-slate-800/80 text-white'
        : 'bg-white/90 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
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
            <span className={`font-extrabold text-sm sm:text-base block ${
              isDark
                ? 'bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent'
                : 'text-slate-900'
            }`}>
              AG School
            </span>
            <span className={`text-[9px] sm:text-[10px] font-bold tracking-wider uppercase block truncate max-w-[130px] sm:max-w-none ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              {t('transparency_portal')}
            </span>
          </div>
        </Link>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Switcher Button */}
          <ThemeToggle />

          <LanguageSelector variant="compact" />

          {user ? (
            <Link
              to="/internal/dashboard"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs shadow-md glow-cyan transition-all transform active:scale-95 shrink-0"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('dashboard')}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border font-semibold text-xs transition-all transform active:scale-95 shrink-0 ${
                isDark
                  ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
              }`}
            >
              <Lock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span>{t('sign_in')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
