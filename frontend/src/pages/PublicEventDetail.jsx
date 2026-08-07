import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { Calendar, Trophy, ArrowLeft, CheckCircle2, Clock, ShieldCheck, Award, Image as ImageIcon, Maximize2, Radio, Search, Flame } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateDisplay } from '../utils/dateFormatter';
import { useTheme } from '../context/ThemeContext';

export const PublicEventDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [event, setEvent] = useState(null);
  const [standingsData, setStandingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Live Standings View State
  const [activeLiveSessionIndex, setActiveLiveSessionIndex] = useState(0);
  const [liveSearchQuery, setLiveSearchQuery] = useState('');

  useEffect(() => {
    fetchEventDetail();
  }, [id]);

  const fetchEventDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/public/events/${id}`);
      if (response.data.success) {
        setEvent(response.data.data);
        if (response.data.data.is_league) {
          try {
            const stRes = await api.get(`/public/events/${id}/standings`);
            if (stRes.data.success) {
              setStandingsData(stRes.data.data);
            }
          } catch (_) {}
        }
      } else {
        setError('Event not found.');
      }
    } catch (err) {
      setError('Event not found or invalid URL.');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentBadge = (status, date) => {
    const formattedDate = date ? formatDateDisplay(date, lang) : '';
    switch (status) {
      case 'Paid':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full border shadow-xs ${
            isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-900 border-emerald-300'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('paid')} {formattedDate ? `(${formattedDate})` : ''}</span>
          </span>
        );
      case 'Processing':
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full border shadow-xs ${
            isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-900 border-cyan-300'
          }`}>
            <Clock className="w-3.5 h-3.5 animate-spin text-cyan-600" />
            <span>{t('processing')}</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-full border shadow-xs ${
            isDark ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-amber-100 text-amber-900 border-amber-300'
          }`}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('unpaid')}</span>
          </span>
        );
    }
  };

  const formattedDateRange = event
    ? (event.end_date && event.end_date !== event.start_date
        ? `${formatDateDisplay(event.start_date, lang)} s/d ${formatDateDisplay(event.end_date, lang)}`
        : formatDateDisplay(event.start_date, lang))
    : '';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PublicNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors mb-6 sm:mb-8 ${
            isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          &larr; Kembali ke Semua Acara
        </Link>

        {loading ? (
          <div className={`glass-panel p-8 sm:p-12 rounded-2xl sm:rounded-3xl animate-pulse text-center ${
            isDark ? '' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-48 h-8 rounded mx-auto mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`w-96 h-4 rounded mx-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        ) : error ? (
          <div className={`glass-panel p-8 sm:p-12 rounded-2xl sm:rounded-3xl text-center max-w-md mx-auto ${
            isDark ? '' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-lg sm:text-xl font-bold text-rose-500 mb-2">{error}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">Event yang diminta tidak ditemukan.</p>
            <Link to="/" className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs sm:text-sm font-semibold">
              Kembali ke Daftar Event
            </Link>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {/* Event Header & Poster Banner */}
            <div className={`glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start border ${
              isDark ? 'border-slate-800' : 'border-slate-200 bg-white/95 shadow-sm'
            }`}>
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full border ${
                    isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  }`}>
                    {event.event_type}
                  </span>
                  <span className={`px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full border ${
                    isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}>
                    Status: {event.event_status}
                  </span>
                </div>

                <h1 className={`text-2xl sm:text-4xl font-extrabold leading-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {event.title}
                </h1>

                {/* Formatted Description */}
                <div className={`leading-relaxed text-xs sm:text-base whitespace-pre-line space-y-3 p-4 sm:p-5 rounded-2xl border ${
                  isDark
                    ? 'text-slate-300 bg-slate-900/40 border-slate-800/80'
                    : 'text-slate-700 bg-slate-50 border-slate-200'
                }`}>
                  {event.description}
                </div>

                <div className={`flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-xs sm:text-sm border-t ${
                  isDark ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                    <span className="font-semibold">{formattedDateRange}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                    <span className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                      {t('prize_pool')}: {event.currency || 'IDR'} {Number(event.total_prize_pool).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Poster Image Preview */}
              <div className="w-full lg:sticky lg:top-24">
                <div
                  onClick={() => event.poster_url && setImageModalOpen(true)}
                  className={`w-full h-64 sm:h-96 rounded-2xl overflow-hidden border flex items-center justify-center relative group ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-300'
                  } ${event.poster_url ? 'cursor-pointer' : ''}`}
                >
                  {event.poster_url ? (
                    <>
                      <img
                        src={event.poster_url}
                        alt={event.title}
                        className={`w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-300 ${
                          isDark ? 'bg-slate-950' : 'bg-slate-50'
                        }`}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Klik untuk Memperbesar</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-4 text-center">
                      <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
                      <span className="text-xs font-medium">Poster Resmi Acara</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live Standings & Daily Progress Updates Widget */}
            {Array.isArray(event.live_standings) && event.live_standings.length > 0 && (() => {
              const activeSession = event.live_standings[activeLiveSessionIndex] || event.live_standings[0];
              if (!activeSession) return null;

              const filteredItems = (activeSession.items || []).filter(item => {
                if (!liveSearchQuery.trim()) return true;
                const q = liveSearchQuery.toLowerCase();
                return (item.player_name || '').toLowerCase().includes(q) ||
                  (item.score_display || '').toLowerCase().includes(q) ||
                  (item.status_badge || '').toLowerCase().includes(q);
              });

              return (
                <div className={`glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-6 border shadow-2xl relative overflow-hidden ${
                  isDark ? 'border-purple-500/40 bg-slate-900/90' : 'border-purple-200 bg-white'
                }`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

                  {/* Header & Sessions Bar */}
                  <div className={`flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b gap-4 ${
                    isDark ? 'border-purple-500/20' : 'border-purple-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-rose-500 shrink-0 shadow-lg shadow-purple-500/20">
                        <Radio className="w-6 h-6 text-rose-500 animate-pulse" />
                      </div>
                      <div>
                        <h2 className={`text-lg sm:text-2xl font-extrabold flex flex-wrap items-center gap-2 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          <span>{activeSession.session_title || 'Live Standings & Rekor Harian'}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 flex items-center gap-1 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                            🔴 LIVE Updates
                          </span>
                        </h2>
                        <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-purple-200' : 'text-purple-800'}`}>
                          {activeSession.note || 'Pembaruan posisi & skor sementara peserta yang di-update secara berkala.'}
                        </p>
                      </div>
                    </div>

                    {/* Session Selector Tabs */}
                    {event.live_standings.length > 1 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin shrink-0">
                        {event.live_standings.map((sess, idx) => (
                          <button
                            key={sess.id || idx}
                            onClick={() => setActiveLiveSessionIndex(idx)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                              activeLiveSessionIndex === idx
                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                                : (isDark ? 'bg-slate-900/80 text-slate-400 hover:text-white border-slate-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300')
                            }`}
                          >
                            {sess.session_title || `Sesi ${idx + 1}`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search Bar for Live Standings */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama peserta / player..."
                        value={liveSearchQuery}
                        onChange={(e) => setLiveSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-8 py-2 border rounded-xl text-xs focus:outline-none focus:border-purple-500 ${
                          isDark
                            ? 'bg-slate-900/90 border-slate-700/80 text-white placeholder-slate-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      {liveSearchQuery && (
                        <button onClick={() => setLiveSearchQuery('')} className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold">
                          ✕
                        </button>
                      )}
                    </div>

                    <div className={`text-xs font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                      Kolom Skor: <span className="underline decoration-purple-500">{activeSession.metric_label || 'Waktu / Poin'}</span>
                    </div>
                  </div>

                  {/* Live Standings Table */}
                  <div className={`overflow-x-auto rounded-2xl border shadow-inner ${
                    isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-slate-50/80'
                  }`}>
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className={`text-[11px] sm:text-xs uppercase font-extrabold border-b ${
                        isDark ? 'bg-slate-900/90 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        <tr>
                          <th className="px-4 py-3 text-center w-14">Rank</th>
                          <th className="px-4 py-3">Nama Player / Peserta</th>
                          <th className="px-4 py-3">{activeSession.metric_label || 'Waktu / Skor'}</th>
                          <th className="px-4 py-3">Status Badges</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item, idx) => (
                            <tr key={idx} className={`transition-colors ${
                              isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-100/80'
                            }`}>
                              <td className="px-4 py-3 text-center font-bold">
                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black shadow-md ${
                                  item.rank === 1
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 glow-amber'
                                    : item.rank === 2
                                    ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-950 font-black'
                                    : item.rank === 3
                                    ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black'
                                    : (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')
                                }`}>
                                  #{item.rank}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-bold">
                                <span className={isDark ? 'text-white' : 'text-slate-900'}>{item.player_name || '-'}</span>
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-amber-600 dark:text-amber-300 text-xs sm:text-sm">
                                {item.score_display || '-'}
                              </td>
                              <td className="px-4 py-3">
                                {item.status_badge ? (
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border shadow-xs ${
                                    isDark ? 'bg-purple-900/30 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-800 border-purple-200'
                                  }`}>
                                    {item.status_badge}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">-</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-slate-400 text-xs sm:text-sm">
                              Tidak ada data peserta yang cocok dengan pencarian &quot;{liveSearchQuery}&quot;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* Official Winners Transparency Section */}
            <div className={`glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-6 border ${
              isDark ? 'border-slate-800' : 'border-slate-200 bg-white/95 shadow-sm'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className={`text-lg sm:text-2xl font-extrabold flex items-center gap-2 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      Transparansi Pemenang & Payout Hadiah
                    </h2>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Daftar resmi juara acara, penerima hadiah, dan bukti status pembayaran publik.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Pencairan Terverifikasi</span>
                </div>
              </div>

              {event.prizes && event.prizes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {event.prizes.map((prize, idx) => {
                    const prizeAmountNum = Number(prize.amount || prize.reward_amount || 0);
                    const formattedPrizeAmount = isNaN(prizeAmountNum) ? '0' : prizeAmountNum.toLocaleString();
                    const rankLabel = prize.placement_rank ? `Juara #${prize.placement_rank}` : (prize.title || 'Pemenang');

                    return (
                      <div
                        key={idx}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 ${
                          isDark
                            ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                            : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider border shadow-xs ${
                              prize.placement_rank === 1
                                ? (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-amber-100 text-amber-900 border-amber-300')
                                : prize.placement_rank === 2
                                ? (isDark ? 'bg-slate-300/20 text-slate-300 border-slate-400/40' : 'bg-slate-200 text-slate-900 border-slate-300')
                                : prize.placement_rank === 3
                                ? (isDark ? 'bg-amber-800/20 text-amber-300 border-amber-700/40' : 'bg-amber-50 text-amber-900 border-amber-300')
                                : (isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-cyan-50 text-cyan-900 border-cyan-200')
                            }`}>
                              {rankLabel} {prize.title && prize.placement_rank ? `- ${prize.title}` : ''}
                            </span>
                            <span className={`text-xs font-black ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                              {event.currency || 'IDR'} {formattedPrizeAmount}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className={`text-[11px] font-extrabold uppercase block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Nama Pemenang / Tim:
                            </span>
                            <h4 className={`text-base font-extrabold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {prize.winner_name || <span className="text-slate-400 italic font-normal">Belum Ditentukan</span>}
                            </h4>
                          </div>
                        </div>

                        <div className={`pt-3 border-t flex items-center justify-between gap-2 ${
                          isDark ? 'border-slate-800/60' : 'border-slate-200'
                        }`}>
                          <span className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Status Payout:</span>
                          {getPaymentBadge(prize.payment_status || 'Unpaid', prize.paid_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className={`text-center py-12 rounded-2xl border ${
                  isDark ? 'bg-slate-900/40 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <Award className="w-10 h-10 stroke-1 text-amber-500 mx-auto mb-2" />
                  <h4 className={`text-sm font-bold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Daftar Pemenang Belum Rilis</h4>
                  <p className="text-xs">Panitia sedang memproses seleksi akhir event ini.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Image Zoom Modal */}
      {imageModalOpen && event && event.poster_url && (
        <div
          onClick={() => setImageModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center animate-fade-in cursor-zoom-out"
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img
              src={event.poster_url}
              alt={event.title}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-700"
            />
            <p className="text-center text-xs text-slate-400 mt-3 font-semibold">Klik di mana saja untuk menutup</p>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};
