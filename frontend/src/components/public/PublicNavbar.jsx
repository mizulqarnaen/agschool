import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';

export const PublicNavbar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-lg glow-cyan flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="AG School Crest Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent block">
              AG School
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-cyan-400 uppercase block truncate max-w-[130px] sm:max-w-none">
              {t('transparency_portal')}
            </span>
          </div>
        </Link>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <LanguageSelector variant="compact" />

          {user ? (
            <Link
              to="/internal/dashboard"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md glow-cyan transition-all transform active:scale-95 shrink-0"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{t('dashboard')}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all transform active:scale-95 shrink-0"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
              <span>{t('sign_in')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
