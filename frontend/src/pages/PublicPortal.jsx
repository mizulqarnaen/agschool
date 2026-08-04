import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { EventCard } from '../components/public/EventCard';
import {
  Search, Filter, ShieldCheck, Trophy, Sparkles, Gamepad2, Zap, Clock, Gift,
  Award, Star, UserCheck, ArrowRight, ExternalLink
} from 'lucide-react';
import { TikTokIcon, DiscordIcon, InstagramIcon, YoutubeIcon } from '../components/common/SocialIcons';

export const PublicPortal = () => {
  const [events, setEvents] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [baLoading, setBaLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchAmbassadors();
  }, [search, statusFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/public/events', {
        params: { search, status: statusFilter }
      });
      if (response.data.success) {
        const rawEvents = response.data.data || [];
        const getStatusPriority = (status) => {
          const s = String(status || '').trim().toLowerCase();
          if (s === 'ongoing' || s === 'berlangsung') return 1;
          if (s === 'scheduled' || s === 'dijadwalkan') return 2;
          if (s === 'payment pending' || s === 'payment_pending' || s === 'pending') return 3;
          if (s === 'completed' || s === 'selesai') return 4;
          if (s === 'cancelled' || s === 'dibatalkan') return 5;
          return 6;
        };

        const sortedEvents = [...rawEvents].sort((a, b) => {
          const prioA = getStatusPriority(a.event_status);
          const prioB = getStatusPriority(b.event_status);
          if (prioA !== prioB) return prioA - prioB;

          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;

          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;

          return (b.id || 0) - (a.id || 0);
        });

        setEvents(sortedEvents);
      }
    } catch (err) {
      console.error('Failed to load public events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmbassadors = async () => {
    setBaLoading(true);
    try {
      const response = await api.get('/public/brand-ambassadors');
      if (response.data.success) {
        setAmbassadors(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load public brand ambassadors:', err);
    } finally {
      setBaLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-4 sm:mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Portal Resmi Acara AG School</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
            AG School Event & Turnamen
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Selamat datang di Portal Resmi AG School. Temukan informasi acara komunitas, turnamen game (Roblox, MLBB, dll), poster resmi, status pendaftaran, klasemen poin liga, dan transparansi daftar pemenang.
          </p>

          {/* Community Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 pt-6 border-t border-slate-800/60 text-xs font-bold text-slate-300">
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-purple-300 flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-purple-400" /> Roblox (Obby & Speedrun)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-blue-500/30 text-blue-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-blue-400" /> MLBB & Esports
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Poin Liga & Standings
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-emerald-400" /> Transparansi Hadiah
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16 space-y-16">
        {/* Section 1: Events List */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Acara & Turnamen Komunitas
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">Jadwal event aktif, pendaftaran terbuka, dan klasemen poin liga</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-panel p-3.5 sm:p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border border-slate-800">
            <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari acara atau turnamen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors font-semibold"
              >
                <option value="">Semua Status Event</option>
                <option value="Scheduled">Dijadwalkan</option>
                <option value="Ongoing">Berlangsung</option>
                <option value="Payment Pending">Payment Pending</option>
                <option value="Completed">Selesai</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="glass-card rounded-2xl h-96 animate-pulse p-6">
                  <div className="w-full h-40 bg-slate-800/60 rounded-xl mb-4" />
                  <div className="w-3/4 h-6 bg-slate-800/60 rounded mb-2" />
                  <div className="w-1/2 h-4 bg-slate-800/60 rounded" />
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center max-w-md mx-auto border border-slate-800">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3 stroke-1" />
              <h3 className="text-lg font-bold text-white mb-1">Acara Tidak Ditemukan</h3>
              <p className="text-xs text-slate-400">
                Tidak ada event publik yang cocok dengan pencarian Anda.
              </p>
            </div>
          )}
        </div>

        {/* Section 2: Official Brand Ambassadors Gallery */}
        {ambassadors.length > 0 && (
          <div className="pt-8 border-t border-slate-800/80">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-extrabold">
                <Award className="w-3.5 h-3.5 text-purple-400" /> OFFICIAL BRAND AMBASSADORS
              </div>
              <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                Perwakilan Resmi AG School
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Wajah resmi AG School yang mempromosikan setiap event, menginspirasi komunitas player Roblox, dan memperluas jangkauan AG School.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ambassadors.map((ba) => (
                <div
                  key={ba.id}
                  className={`glass-card rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1.5 relative overflow-hidden border ${
                    ba.is_featured
                      ? 'border-purple-500/40 hover:border-purple-400 shadow-xl glow-purple bg-gradient-to-b from-purple-950/20 via-slate-900/90 to-slate-950'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/80'
                  }`}
                >
                  {ba.is_featured && (
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-slate-950" /> FEATURED BA
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Header Avatar & Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-purple-500/40 overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-lg p-0.5">
                        <img
                          src={ba.avatar_url}
                          alt={ba.display_name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">{ba.title}</span>
                        <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-purple-300 transition-colors">{ba.display_name}</h3>
                        <span className="text-xs font-mono font-bold text-cyan-300 block">@{ba.roblox_username}</span>
                      </div>
                    </div>

                    {/* Short Intro */}
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {ba.short_intro}
                    </p>

                    {/* Motto */}
                    {ba.motto && (
                      <p className="text-[11px] text-amber-300 font-semibold italic line-clamp-1 bg-amber-500/5 p-2 rounded-xl border border-amber-500/20">
                        "{ba.motto}"
                      </p>
                    )}
                  </div>

                  {/* Footer Actions & Medsos */}
                  <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      {ba.instagram && (
                        <a href={ba.instagram} target="_blank" rel="noreferrer" title="Instagram Profile">
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-400 hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {ba.tiktok && (
                        <a href={ba.tiktok} target="_blank" rel="noreferrer" title="TikTok Profile">
                          <TikTokIcon className="w-3.5 h-3.5 text-slate-300 hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {ba.youtube && (
                        <a href={ba.youtube} target="_blank" rel="noreferrer" title="YouTube Channel">
                          <YoutubeIcon className="w-3.5 h-3.5 text-rose-500 hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {ba.discord_username && (
                        <span title={`Discord: ${ba.discord_username}`}>
                          <DiscordIcon className="w-3.5 h-3.5 text-indigo-400" />
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/brand-ambassadors/${ba.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-purple-300 hover:text-white transition-colors group/link"
                    >
                      <span>Lihat Profil</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
