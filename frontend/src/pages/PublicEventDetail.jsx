import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { Calendar, Trophy, ArrowLeft, CheckCircle2, Clock, ShieldCheck, Award, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatDateDisplay } from '../utils/dateFormatter';

export const PublicEventDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [event, setEvent] = useState(null);
  const [standingsData, setStandingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('paid')} {formattedDate ? `(${formattedDate})` : ''}</span>
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>{t('processing')}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" />
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          &larr; Kembali ke Semua Acara
        </Link>

        {loading ? (
          <div className="glass-panel p-8 sm:p-12 rounded-2xl sm:rounded-3xl animate-pulse text-center">
            <div className="w-48 h-8 bg-slate-800 rounded mx-auto mb-4" />
            <div className="w-96 h-4 bg-slate-800 rounded mx-auto" />
          </div>
        ) : error ? (
          <div className="glass-panel p-8 sm:p-12 rounded-2xl sm:rounded-3xl text-center max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-rose-400 mb-2">{error}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mb-6">Event yang diminta tidak ditemukan.</p>
            <Link to="/" className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-xs sm:text-sm font-semibold">
              Kembali ke Daftar Event
            </Link>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {/* Event Header & Poster Banner */}
            <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    {event.event_type}
                  </span>
                  <span className="px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Status: {event.event_status}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                  {event.title}
                </h1>

                {/* Formatted Description preserving all newlines, bullet points & spacing */}
                <div className="text-slate-300 leading-relaxed text-xs sm:text-base whitespace-pre-line space-y-3 bg-slate-900/40 p-4 sm:p-5 rounded-2xl border border-slate-800/80">
                  {event.description}
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 text-xs sm:text-sm text-slate-300 border-t border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{formattedDateRange}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                    <span className="font-bold text-amber-300">
                      {t('prize_pool')}: {event.currency || 'IDR'} {Number(event.total_prize_pool).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Poster Image Preview with full uncropped fit */}
              <div className="w-full lg:sticky lg:top-24">
                <div
                  onClick={() => event.poster_url && setImageModalOpen(true)}
                  className={`w-full h-64 sm:h-96 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center relative group ${
                    event.poster_url ? 'cursor-pointer' : ''
                  }`}
                >
                  {event.poster_url ? (
                    <>
                      <img
                        src={event.poster_url}
                        alt={event.title}
                        className="w-full h-full object-contain bg-slate-950 p-2 group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Klik untuk Memperbesar</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-2 p-4 text-center">
                      <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5]" />
                      <span className="text-xs font-medium">Poster Resmi Acara</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Public League Standings Section (If is_league event) */}
            {event.is_league && standingsData && standingsData.standings && (
              <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white flex flex-wrap items-center gap-2">
                        <span>Papan Skor & Klasemen Poin Liga</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                          Official Standings
                        </span>
                      </h2>
                      <p className="text-[11px] sm:text-xs text-slate-400">
                        Akumulasi poin {standingsData.league_config?.total_matches || 3} match finalis dengan tie-breaker posisi terbaik
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                    <thead className="text-[11px] sm:text-xs font-semibold uppercase text-slate-400 bg-slate-900 border-b border-slate-800">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-center w-10 sm:w-12">Rank</th>
                        <th className="px-4 sm:px-6 py-3">Nama Peserta / Tim</th>
                        {Array.from({ length: Number(standingsData.league_config?.total_matches || 3) }, (_, i) => i + 1).map(mNum => (
                          <th key={mNum} className="px-3 sm:px-4 py-3 text-center whitespace-nowrap">
                            Match {mNum}
                          </th>
                        ))}
                        <th className="px-4 sm:px-6 py-3 text-center font-bold text-emerald-400 whitespace-nowrap">Total Poin</th>
                        <th className="px-4 sm:px-6 py-3 whitespace-nowrap">Aturan Tie-Breaker</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {standingsData.standings.map((item) => {
                        const isPodium = item.rank <= (standingsData.league_config?.podium_count || 3);
                        return (
                          <tr key={item.id} className={`hover:bg-slate-900/40 transition-colors ${isPodium ? 'bg-amber-500/5' : ''}`}>
                            <td className="px-3 sm:px-4 py-3 text-center font-bold">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-mono text-xs ${
                                item.rank === 1
                                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                                  : item.rank === 2
                                  ? 'bg-slate-300 text-slate-950 font-black'
                                  : item.rank === 3
                                  ? 'bg-amber-700 text-white font-black'
                                  : isPodium
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {item.rank}
                              </span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 font-bold text-white flex items-center gap-2 whitespace-nowrap">
                              <span>{item.player_name}</span>
                              {isPodium && (
                                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                  Podium #{item.rank}
                                </span>
                              )}
                            </td>
                            {Array.from({ length: Number(standingsData.league_config?.total_matches || 3) }, (_, i) => i + 1).map(mNum => {
                              const val = item.matches?.[mNum];
                              const pts = val ? standingsData.league_config?.point_schema?.[val] || 0 : null;
                              return (
                                <td key={mNum} className="px-3 sm:px-4 py-3 text-center font-mono text-xs whitespace-nowrap">
                                  {val ? (
                                    <span className="text-cyan-300 font-bold">
                                      #{val} <span className="text-[10px] text-emerald-400 font-semibold">(+{pts}pt)</span>
                                    </span>
                                  ) : (
                                    <span className="text-slate-600">-</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-4 sm:px-6 py-3 text-center font-bold text-emerald-400 font-mono text-xs sm:text-base whitespace-nowrap">
                              {item.total_points} pts
                            </td>
                            <td className="px-4 sm:px-6 py-3 text-xs text-slate-400 whitespace-nowrap">
                              {item.tie_note ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                  ⚡ {item.tie_note}
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Posisi Terbaik #{item.best_placement}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Prize & Winner Transparency Section */}
            <div className="glass-panel p-4 sm:p-8 rounded-2xl sm:rounded-3xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 pb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">{t('winners_and_prizes')}</h2>
                    <p className="text-[11px] sm:text-xs text-slate-400">Verifikasi transparansi publik untuk apresiasi & hadiah event</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{t('verified_public')}</span>
                </div>
              </div>

              {event.prizes && event.prizes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs font-semibold uppercase text-slate-400 bg-slate-900/80 border-b border-slate-800">
                      <tr>
                        <th className="px-6 py-4">Kategori Hadiah</th>
                        <th className="px-6 py-4">Nama Pemenang / Tim</th>
                        <th className="px-6 py-4">Deskripsi Hadiah</th>
                        <th className="px-6 py-4">Status Pembayaran</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {event.prizes.map((prize) => (
                        <tr key={prize.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            {prize.prize_title}
                          </td>
                          <td className="px-6 py-4 font-semibold text-cyan-300">
                            {prize.winner_name}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {prize.reward_description}
                          </td>
                          <td className="px-6 py-4">
                            {getPaymentBadge(prize.payment_status, prize.payment_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  Belum ada daftar pemenang atau kategori hadiah yang dipublikasikan untuk acara ini.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Image Lightbox Modal */}
      {imageModalOpen && event?.poster_url && (
        <div
          onClick={() => setImageModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={event.poster_url}
            alt={event.title}
            className="max-w-full max-h-[90vh] object-contain rounded-2xl border border-slate-700 shadow-2xl"
          />
        </div>
      )}

      <PublicFooter />
    </div>
  );
};
