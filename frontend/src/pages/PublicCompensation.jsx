import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { TikTokIcon, DiscordIcon } from '../components/common/SocialIcons';
import {
  Search, ShieldCheck, CheckCircle2, Clock, Filter,
  ChevronLeft, ChevronRight, Gamepad2, ArrowUpRight, Award, DollarSign
} from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export const PublicCompensation = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_recipients: 0,
    completed_count: 0,
    pending_count: 0,
    processing_count: 0,
    total_amount: 0
  });
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    limit: 12
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicData();
  }, [search, statusFilter, selectedCampaign, pagination.current_page]);

  const fetchPublicData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/public/compensations', {
        params: {
          search,
          status: statusFilter,
          campaign_id: selectedCampaign,
          page: pagination.current_page,
          limit: pagination.limit
        }
      });

      if (res.data.success) {
        setRecords(res.data.data.records || []);
        setStats(res.data.data.stats || {});
        setCampaigns(res.data.data.campaigns || []);
        if (res.data.data.pagination) {
          setPagination(res.data.data.pagination);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return (
        <span className="badge-status badge-status-success">
          <CheckCircle2 className="w-3.5 h-3.5" /> {t('completed')}
        </span>
      );
    }
    if (status === 'Processing') {
      return (
        <span className="badge-status badge-status-info">
          <Clock className="w-3.5 h-3.5 animate-spin" /> {t('processing')}
        </span>
      );
    }
    return (
      <span className="badge-status badge-status-warning">
        <Clock className="w-3.5 h-3.5" /> {t('unpaid')}
      </span>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PublicNavbar />

      {/* Hero Section */}
      <section className={`border-b py-10 sm:py-16 relative overflow-hidden ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-8 sm:mb-12">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-xs ${
              isDark ? 'bg-slate-900 border border-slate-700 text-cyan-400' : 'bg-slate-100 border border-slate-300 text-slate-900'
            }`}>
              <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>{t('verified_public')} - {t('compensation')}</span>
            </div>

            <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {t('compensation_title')}
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {t('compensation_hero_desc')}
            </p>
          </div>

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {/* Total Recipients */}
            <div className={`p-5 rounded-2xl border text-center space-y-1 transition-all ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
            }`}>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('total_recipients')}</span>
              <div className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {stats.total_recipients || 0} Member
              </div>
            </div>

            {/* Completed Payments */}
            <div className={`p-5 rounded-2xl border text-center space-y-1 transition-all ${
              isDark ? 'bg-emerald-950/30 border-emerald-800/40' : 'bg-emerald-50/80 border-emerald-200 shadow-xs'
            }`}>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{t('completed_payments')}</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.completed_count || 0} {t('completed')}
              </div>
            </div>

            {/* Pending Payments */}
            <div className={`p-5 rounded-2xl border text-center space-y-1 transition-all ${
              isDark ? 'bg-amber-950/30 border-amber-800/40' : 'bg-amber-50/80 border-amber-200 shadow-xs'
            }`}>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">{t('pending_payments')}</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                {stats.pending_count || 0} Record
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Prominent Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={t('search_compensation_placeholder')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(prev => ({ ...prev, current_page: 1 }));
              }}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl border text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
              }`}
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {campaigns.length > 1 && (
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className={`px-3 py-2.5 border rounded-xl text-xs font-semibold ${
                  isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
                }`}
              >
                <option value="">{t('all_campaigns')}</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-3 py-2.5 border rounded-xl text-xs font-semibold ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
              }`}
            >
              <option value="">{t('all_transfer_statuses')}</option>
              <option value="Completed">{t('completed')}</option>
              <option value="Processing">{t('processing')}</option>
              <option value="Pending">{t('unpaid')}</option>
            </select>
          </div>
        </div>

        {/* Recipients Responsive Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className={`h-44 rounded-2xl animate-pulse ${isDark ? 'bg-slate-900/50' : 'bg-slate-200/60'}`} />
            ))}
          </div>
        ) : records.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {records.map((rec) => (
              <div
                key={rec.id}
                className={`glass-card p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between space-y-4 ${
                  isDark
                    ? 'border-slate-800 hover:border-slate-700'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Member Details */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center font-black text-base border shrink-0 ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}>
                        {rec.avatar_url ? (
                          <img src={rec.avatar_url} alt={rec.full_name} className="w-full h-full object-cover" />
                        ) : (
                          rec.full_name ? rec.full_name.charAt(0) : 'M'
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {rec.full_name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium block truncate">
                          {rec.campaign_name || 'AGCL Compensation'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(rec.payment_status)}
                    </div>
                  </div>

                  {/* Discord & Roblox Handles */}
                  <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <DiscordIcon className="w-3.5 h-3.5 text-indigo-500" /> Discord:
                      </span>
                      <span className={`font-mono font-bold truncate ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                        {rec.discord_username ? `@${rec.discord_username}` : '-'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Gamepad2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Roblox:
                      </span>
                      <span className={`font-mono font-bold truncate ${isDark ? 'text-cyan-300' : 'text-slate-800'}`}>
                        {rec.roblox_username || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Amount & Proof Link */}
                <div className={`pt-3 border-t flex items-center justify-between gap-2 ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}>
                  {rec.proof_url ? (
                    <a
                      href={rec.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <span>📜 {t('transfer_proof')}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">Compensation:</span>
                  )}
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    IDR {Number(rec.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-16 rounded-3xl border ${
            isDark ? 'glass-panel border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-xs'
          }`}>
            <ShieldCheck className="w-12 h-12 stroke-1 text-slate-400 mx-auto mb-3" />
            <h3 className="font-extrabold text-base mb-1">{t('no_compensations_found')}</h3>
            <p className="text-xs text-slate-400">Coba cari dengan Discord handle atau Username Roblox lainnya.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className={`p-2 rounded-xl border transition-all ${
                pagination.current_page === 1
                  ? 'opacity-40 cursor-not-allowed border-slate-800'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold px-3">
              Halaman {pagination.current_page} dari {pagination.total_pages}
            </span>

            <button
              type="button"
              onClick={() => handlePageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.total_pages}
              className={`p-2 rounded-xl border transition-all ${
                pagination.current_page === pagination.total_pages
                  ? 'opacity-40 cursor-not-allowed border-slate-800'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
