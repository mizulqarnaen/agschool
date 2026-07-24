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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-lg glow-cyan flex items-center justify-center p-0.5 transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="AG School Crest Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-extrabold text-base bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent">
              AG School
            </span>
            <span className="block text-[10px] font-semibold tracking-wider text-cyan-400 uppercase">
              {t('transparency_portal')}
            </span>
          </div>
        </Link>

        {/* Right Navigation Actions with clean spacing */}
        <div className="flex items-center gap-4 sm:gap-6">
          <LanguageSelector variant="compact" />

          {user ? (
            <Link
              to="/internal/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md glow-cyan transition-all transform active:scale-95 shrink-0"
            >
              <Shield className="w-4 h-4" />
              <span>{t('dashboard')}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all transform active:scale-95 shrink-0"
            >
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>{t('sign_in')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
