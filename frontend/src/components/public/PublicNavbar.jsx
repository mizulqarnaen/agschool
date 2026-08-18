import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../common/LanguageSelector';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, Trophy, Menu, X } from 'lucide-react';

export const PublicNavbar = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDark = theme === 'dark';

  // Determine current active navigation item (Home vs Kompensasi AGCL)
  const isKompensasiActive = location.pathname.startsWith('/compensation') || location.pathname.startsWith('/arrears');
  const isHomeActive = !isKompensasiActive;

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

        {/* Desktop Navigation Tabs (2 Items: Home & Kompensasi AGCL) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl border bg-slate-900/60 border-slate-800/80">
          {/* Item 1: Home */}
          <Link
            to="/"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
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

          {/* Item 2: Kompensasi AGCL */}
          <Link
            to="/compensation"
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
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
        </nav>

        {/* Right Controls & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle iconOnly={true} />
            <LanguageSelector variant="toggle" />
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border transition-all md:hidden ${
              isDark
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-rose-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-4 py-4 space-y-3 transition-all ${
          isDark ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            Navigasi Portal Publik
          </div>

          <div className="space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                isHomeActive
                  ? 'bg-amber-600 text-white shadow-md'
                  : isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>1. Home (Event & Turnamen)</span>
              </div>
              {isHomeActive && <span className="text-[10px] uppercase font-black bg-amber-800 px-2 py-0.5 rounded-full">Aktif</span>}
            </Link>

            <Link
              to="/compensation"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full p-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                isKompensasiActive
                  ? 'bg-cyan-600 text-white shadow-md'
                  : isDark ? 'bg-slate-900 text-slate-300 border border-slate-800' : 'bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>2. Kompensasi AGCL</span>
              </div>
              {isKompensasiActive && <span className="text-[10px] uppercase font-black bg-cyan-800 px-2 py-0.5 rounded-full">Aktif</span>}
            </Link>
          </div>

          {/* Controls row for mobile */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Pengaturan Tema & Bahasa</span>
            <div className="flex items-center gap-2">
              <ThemeToggle iconOnly={true} />
              <LanguageSelector variant="toggle" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
