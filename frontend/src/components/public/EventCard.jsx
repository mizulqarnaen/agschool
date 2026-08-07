import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Image as ImageIcon, Zap, Lock, CheckCircle2, Clock, AlertCircle, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateDisplay } from '../../utils/dateFormatter';
import { useTheme } from '../../context/ThemeContext';

export const EventCard = ({ event }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Execution Status Badges
  const getEventStatusBadge = (status) => {
    switch (status) {
      case 'Ongoing':
        return (
          <span className="badge-status badge-status-success">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            ● Berlangsung
          </span>
        );
      case 'Payment Pending':
        return (
          <span className="badge-status badge-status-purple">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Payment Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="badge-status badge-status-info">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </span>
        );
      case 'Cancelled':
        return (
          <span className="badge-status badge-status-error">
            <AlertCircle className="w-3.5 h-3.5" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="badge-status badge-status-warning">
            <Calendar className="w-3.5 h-3.5" /> Dijadwalkan
          </span>
        );
    }
  };

  // Registration Status Badges
  const getRegistrationBadge = (regStatus) => {
    switch (regStatus) {
      case 'Open':
        return (
          <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-emerald-600 text-white shadow-xs flex items-center gap-1">
            🟢 Pendaftaran Buka
          </span>
        );
      case 'Closed':
        return (
          <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-slate-900/90 text-rose-300 border border-rose-500/40 backdrop-blur-md flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-rose-400" /> Pendaftaran Ditutup
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-purple-900/90 text-purple-200 border border-purple-500/40 backdrop-blur-md flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-300" /> Segera Dibuka
          </span>
        );
    }
  };

  const formattedDateRange = event.end_date && event.end_date !== event.start_date
    ? `${formatDateDisplay(event.start_date, lang)} - ${formatDateDisplay(event.end_date, lang)}`
    : formatDateDisplay(event.start_date, lang);

  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col group hover:-translate-y-1 ${
      isDark ? 'hover:border-cyan-500/40' : 'hover:border-cyan-400 hover:shadow-lg'
    }`}>
      {/* Poster Image Header */}
      <div className={`h-48 relative overflow-hidden flex items-center justify-center border-b ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
            <ImageIcon className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs font-medium text-slate-500">Official Poster Artwork</span>
          </div>
        )}

        {/* Top Badges Overlay (Registration + Execution status) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap pointer-events-none">
          <div className="shrink-0">{getRegistrationBadge(event.registration_status || 'Open')}</div>
          <div className="shrink-0">{getEventStatusBadge(event.event_status)}</div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2 flex-wrap">
            <span className={isDark ? 'text-cyan-400' : 'text-cyan-700'}>{event.event_type}</span>
            {Array.isArray(event.live_standings) && event.live_standings.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-[10px] normal-case flex items-center gap-1 font-extrabold animate-pulse">
                <Radio className="w-3 h-3 text-rose-500" /> 🔴 LIVE Updates
              </span>
            )}
            {event.is_league && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 text-[10px] normal-case flex items-center gap-1 font-semibold">
                <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400 fill-purple-400" /> Sistem Poin Liga
              </span>
            )}
          </div>

          <h3 className={`text-lg sm:text-xl font-bold transition-colors line-clamp-1 mb-2 ${
            isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-700'
          }`}>
            {event.title}
          </h3>

          <p className={`text-xs sm:text-sm line-clamp-2 whitespace-pre-line mb-4 ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {event.description}
          </p>
        </div>

        <div>
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs p-2.5 sm:p-3 rounded-xl mb-4 border ${
            isDark
              ? 'text-slate-300 bg-slate-900/60 border-slate-800'
              : 'text-slate-700 bg-slate-100/90 border-slate-200'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className={`w-4 h-4 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className="font-semibold truncate">{formattedDateRange}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
              <span className={`font-semibold truncate ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                {event.currency || 'IDR'} {Number(event.total_prize_pool).toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className={`w-full py-2 sm:py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/40'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm border border-cyan-600'
            }`}
          >
            {t('view_details')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
