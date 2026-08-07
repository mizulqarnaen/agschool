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
        ? 'bg-slate-950/85 border-slate-800/80 text-white'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo (Left) */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
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
            <span className={`font-black text-base sm:text-lg tracking-tight block ${
              isDark
                ? 'bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent'
                : 'text-slate-900'
            }`}>
              AG School
            </span>
            <span className={`text-[10px] font-bold tracking-wider uppercase block ${
              isDark ? 'text-cyan-400' : 'text-cyan-700'
            }`}>
              {t('transparency_portal')}
            </span>
          </div>
        </Link>

        {/* Right Ultra-Minimal Controls & Action CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Theme Switcher Button (Icon Only) */}
          <ThemeToggle iconOnly={true} />

          {/* Language Selector Button (ID / EN Toggle) */}
          <LanguageSelector variant="toggle" />

          {/* Login / Dashboard CTA */}
          {user ? (
            <Link
              to="/internal/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-md glow-cyan transition-all transform active:scale-95 shrink-0"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition-all transform active:scale-95 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
