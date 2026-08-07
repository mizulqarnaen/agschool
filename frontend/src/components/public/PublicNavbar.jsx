import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Lock, Menu, X, Award, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

export const PublicNavbar = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDark = theme === 'dark';

  const navLinks = [
    { label: t('events') || 'Acara & Turnamen', path: '/', icon: Calendar },
    { label: 'Brand Ambassador', path: '/#brand-ambassador', icon: Award },
    { label: t('compensation') || 'Kompensasi AGCL', path: '/compensation', icon: Shield },
  ];

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

        {/* Center Main Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/40 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/60">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || (link.path.startsWith('/#') && location.hash === link.path.replace('/', ''));
            
            return (
              <a
                key={link.path}
                href={link.path}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-md'
                    : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Right Controls & Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme Switcher Button */}
          <ThemeToggle />

          {/* Language Selector */}
          <LanguageSelector variant="compact" />

          {/* Login / Dashboard CTA */}
          {user ? (
            <Link
              to="/internal/dashboard"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs shadow-md glow-cyan transition-all transform active:scale-95 shrink-0"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t('dashboard')}</span>
              <span className="sm:hidden">Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs shadow-md transition-all transform active:scale-95 shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{t('sign_in')}</span>
            </Link>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border border-slate-700 md:hidden text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className={`md:hidden border-b p-4 space-y-2 animate-scale-up ${
          isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === link.path
                    ? 'bg-cyan-600 text-white'
                    : isDark ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
};
