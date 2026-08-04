import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Trophy, Image as ImageIcon, Zap, Lock, CheckCircle2, Clock, PlayCircle, AlertCircle, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateDisplay } from '../../utils/dateFormatter';

export const EventCard = ({ event }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  // Event Execution Status (Scheduled, Ongoing, Completed, Cancelled)
  const getEventStatusBadge = (status) => {
    switch (status) {
      case 'Ongoing':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            ● Berlangsung
          </span>
        );
      case 'Payment Pending':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Payment Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Selesai
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-amber-400" /> Dijadwalkan
          </span>
        );
    }
  };

  // Registration Status (Open, Closed, Upcoming)
  const getRegistrationBadge = (regStatus) => {
    switch (regStatus) {
      case 'Open':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500 text-slate-950 shadow-md flex items-center gap-1">
            🟢 Pendaftaran Buka
          </span>
        );
      case 'Closed':
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-950/80 text-rose-300 border border-rose-500/40 backdrop-blur-md flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-rose-400" /> Pendaftaran Ditutup
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-950/80 text-purple-300 border border-purple-500/40 backdrop-blur-md flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" /> Segera Dibuka
          </span>
        );
    }
  };

  const formattedDateRange = event.end_date && event.end_date !== event.start_date
    ? `${formatDateDisplay(event.start_date, lang)} - ${formatDateDisplay(event.end_date, lang)}`
    : formatDateDisplay(event.start_date, lang);

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Poster Image Header */}
      <div className="h-48 bg-slate-900/80 relative overflow-hidden flex items-center justify-center border-b border-slate-800">
        {event.poster_url ? (
          <img
            src={event.poster_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-600 gap-2">
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
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex-wrap">
            <span>{event.event_type}</span>
            {Array.isArray(event.live_standings) && event.live_standings.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] normal-case flex items-center gap-1 font-extrabold animate-pulse">
                <Radio className="w-3 h-3 text-rose-400" /> 🔴 LIVE Updates
              </span>
            )}
            {event.is_league && (
              <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] normal-case flex items-center gap-1 font-semibold">
                <Zap className="w-3 h-3 text-purple-400 fill-purple-400" /> Sistem Poin Liga
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 mb-2">
            {event.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 whitespace-pre-line mb-4">
            {event.description}
          </p>
        </div>

        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 sm:p-3 rounded-xl mb-4 border border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-200 truncate">{formattedDateRange}</span>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-amber-300 truncate">
                {event.currency || 'IDR'} {Number(event.total_prize_pool).toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="w-full py-2 sm:py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-700 hover:border-cyan-500/40 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {t('view_details')} &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
