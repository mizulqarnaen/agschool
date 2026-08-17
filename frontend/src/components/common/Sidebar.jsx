import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, TrendingDown, Users, UserCheck,
  Calendar, Shield, FileText, Settings, History,
  LogOut, Menu, X, Award, AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role_slug ? user.role_slug.toLowerCase() : '';

  const navItems = [
    { label: t('dashboard'), path: '/internal/dashboard', icon: LayoutDashboard, roles: ['administrator', 'finance', 'secretary'] },
    { label: t('incomes'), path: '/internal/incomes', icon: TrendingUp, roles: ['administrator', 'finance'] },
    { label: t('expenses'), path: '/internal/expenses', icon: TrendingDown, roles: ['administrator', 'finance'] },
    { label: t('payments'), path: '/internal/payments', icon: Users, roles: ['administrator', 'finance'] },
    { label: 'Direktori Pemain & Staff', path: '/internal/members', icon: UserCheck, roles: ['administrator', 'finance', 'secretary'] },
    { label: t('events'), path: '/internal/events', icon: Calendar, roles: ['administrator', 'secretary'] },
    { label: 'Brand Ambassador', path: '/internal/brand-ambassadors', icon: Award, roles: ['administrator', 'finance', 'secretary'] },
    { label: 'Kompensasi AGCL', path: '/internal/compensation', icon: Shield, roles: ['administrator', 'finance', 'secretary'] },
    { label: 'Data Tunggakan', path: '/internal/arrears', icon: AlertCircle, roles: ['administrator', 'finance', 'secretary'] },
    { label: t('users'), path: '/internal/users', icon: Shield, roles: ['administrator'] },
    { label: t('reports'), path: '/internal/reports', icon: FileText, roles: ['administrator', 'finance'] },
    { label: t('settings'), path: '/internal/settings', icon: Settings, roles: ['administrator'] },
    { label: t('logs'), path: '/internal/logs', icon: History, roles: ['administrator'] },
  ];

  const allowedNav = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 shadow-xl"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3.5 mb-3.5">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 shadow-md shrink-0 flex items-center justify-center p-0.5 glow-cyan">
                <img
                  src="/logo.png"
                  alt="AG School Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h1 className="font-extrabold text-sm text-white truncate">AG School</h1>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                  Finance Portal
                </span>
              </div>
            </div>

            {/* Language Selector placed on its own row for clean spacing */}
            <div className="w-full">
              <LanguageSelector />
            </div>
          </div>

          {/* User Badge */}
          <div className="p-3.5 mx-3 my-3 bg-slate-900/80 rounded-xl border border-slate-800">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || user?.username}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {user?.role_slug || 'Role'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Link & Logout & Developer Credit */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <span>{t('transparency_portal')} &rarr;</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('sign_out')}</span>
          </button>

          <div className="pt-2 text-[10px] text-center text-slate-500 border-t border-slate-900 font-medium">
            <span>Crafted with ❤️ by <strong className="text-slate-300 font-bold">Kang Iqbal</strong></span>
          </div>
        </div>
      </aside>
    </>
  );
};
