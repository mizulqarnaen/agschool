import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { EventCard } from '../components/public/EventCard';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Search, Filter, ShieldCheck, Trophy, Sparkles, Gamepad2, Zap, Gift,
  Award, Star, UserCheck, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, Users
} from 'lucide-react';
import { TikTokIcon, DiscordIcon, InstagramIcon, YoutubeIcon } from '../components/common/SocialIcons';

export const PublicPortal = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [events, setEvents] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [compStats, setCompStats] = useState({
    total_recipients: 0,
    completed_count: 0,
    total_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [baLoading, setBaLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAllEvents, setShowAllEvents] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchAmbassadors();
    fetchCompStats();
  }, [search, statusFilter]);

  const fetchCompStats = async () => {
    try {
      const res = await api.get('/public/compensations', { params: { limit: 1 } });
      if (res.data.success && res.data.data.stats) {
        setCompStats(res.data.data.stats);
      }
    } catch (_) {}
  };

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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PublicNavbar />

      {/* Hero Header Section */}
      <section className={`relative overflow-hidden pt-8 sm:pt-12 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-300 ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/90 bg-gradient-to-b from-cyan-50/50 via-white to-slate-50'
      }`}>
        <div className={`absolute inset-0 pointer-events-none ${
          isDark ? 'bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent' : 'bg-gradient-to-b from-cyan-500/5 via-blue-500/5 to-transparent'
        }`} />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm ${
            isDark ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-cyan-100/80 border border-cyan-300 text-cyan-800'
          }`}>
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>{t('verified_public')} - AG School</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight ${
            isDark
              ? 'bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent'
              : 'text-slate-900'
          }`}>
            {t('hero_title')}
          </h1>

          <p className={`text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            {t('hero_subtitle')}
          </p>

          {/* Restored Community Feature Pills */}
          <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-xs font-bold ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <span className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
            }`}>
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-500" /> Roblox (Obby & Speedrun)
            </span>
            <span className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
            }`}>
              <Trophy className="w-3.5 h-3.5 text-amber-500" /> MLBB & Esports
            </span>
            <span className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
            }`}>
              <Zap className="w-3.5 h-3.5 text-cyan-500" /> Poin Liga & Standings
            </span>
            <span className={`px-3.5 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
              isDark ? 'bg-slate-900/90 border-slate-700 text-slate-300' : 'bg-white border-slate-300 text-slate-800 shadow-xs'
            }`}>
              <Gift className="w-3.5 h-3.5 text-emerald-500" /> Transparansi Hadiah
            </span>
          </div>

          {/* FEATURED: Highlighted Full Stretch Widescreen AGCL Compensation Banner with Animated Glowing Border */}
          <div className={`mt-8 p-6 sm:p-8 rounded-3xl border text-left w-full max-w-5xl mx-auto relative overflow-hidden transition-all duration-500 ${
            isDark
              ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/80 border-cyan-500/80 shadow-[0_0_35px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.45)] hover:border-cyan-400'
              : 'bg-gradient-to-r from-cyan-50 via-white to-cyan-50 border-cyan-400 shadow-xl hover:shadow-2xl'
          }`}>
            {/* Subtle Glowing Background Pulse Accent */}
            <div className="absolute -right-20 -top-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 flex-1">
                <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-black border ${
                  isDark ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300 shadow-xs' : 'bg-cyan-100 border-cyan-300 text-cyan-900'
                }`}>
                  <ShieldCheck className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span>{t('verified_public')} - {t('compensation')}</span>
                </div>

                <h2 className={`text-2xl sm:text-3xl font-black ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {t('compensation_title')} Status
                </h2>

                <p className={`text-xs sm:text-sm leading-relaxed max-w-2xl ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {t('compensation_hero_desc')}
                </p>

                {/* Live Real-time Stat Pills (No Dollar Icon) */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className={`px-3.5 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 ${
                    isDark ? 'bg-slate-950/90 border-emerald-500/40 text-emerald-400' : 'bg-white border-emerald-300 text-emerald-700 shadow-xs'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Total Kompensasi: IDR {Number(compStats.total_amount || 0).toLocaleString()}</span>
                  </div>

                  <div className={`px-3.5 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 ${
                    isDark ? 'bg-slate-950/90 border-cyan-500/40 text-cyan-300' : 'bg-white border-cyan-300 text-cyan-800 shadow-xs'
                  }`}>
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>{compStats.total_recipients || 0} Member Terdaftar</span>
                  </div>
                </div>
              </div>

              {/* Directly Accessible High-Visibility CTA Button */}
              <div className="shrink-0 flex items-center">
                <Link
                  to="/compensation"
                  className="w-full md:w-auto px-7 py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs sm:text-sm shadow-2xl transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 glow-cyan"
                >
                  <span>Cek Nama & Status Kompensasi &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16 space-y-16">
        {/* Section 1: Events List */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className={`text-xl sm:text-2xl font-extrabold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Trophy className="w-5 h-5 text-amber-500" /> Acara & Turnamen Komunitas
              </h2>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Jadwal event aktif, pendaftaran terbuka, dan klasemen poin liga
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className={`glass-panel p-3.5 sm:p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 border ${
            isDark ? 'border-slate-800' : 'border-slate-200 bg-white/90 shadow-sm'
          }`}>
            <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
              <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Cari acara atau turnamen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs sm:text-sm transition-colors ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700/80 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none ${
                  isDark
                    ? 'bg-slate-900/90 border-slate-700/80 text-slate-200'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="">Semua Status Event</option>
                <option value="Ongoing">● Berlangsung (Ongoing)</option>
                <option value="Scheduled">Dijadwalkan (Scheduled)</option>
                <option value="Completed">Selesai (Completed)</option>
              </select>
            </div>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`h-80 rounded-2xl animate-pulse ${isDark ? 'bg-slate-900/50' : 'bg-slate-200/60'}`} />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(showAllEvents ? events : events.slice(0, 6)).map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>

              {/* Show All / Show Less Toggle Button */}
              {events.length > 6 && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border text-xs sm:text-sm font-extrabold transition-all shadow-sm ${
                      isDark
                        ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-cyan-400 hover:text-cyan-300'
                        : 'bg-white hover:bg-slate-50 border-slate-300 text-cyan-700 hover:text-cyan-800'
                    }`}
                  >
                    {showAllEvents ? (
                      <>
                        <span>Tampilkan Lebih Sedikit</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Tampilkan Semua Event ({events.length})</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center py-16 rounded-3xl border ${
              isDark ? 'glass-panel border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
            }`}>
              <Trophy className="w-12 h-12 stroke-1 text-slate-400 mx-auto mb-3" />
              <h3 className={`text-base font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Belum Ada Turnamen Aktif</h3>
              <p className="text-xs">Silakan cek kembali secara berkala untuk pembaruan acara terbaru dari AG School.</p>
            </div>
          )}
        </div>

        {/* Section 2: Official Brand Ambassador Showcase */}
        <div className="pt-6 border-t border-slate-800/40" id="brand-ambassador">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold mb-2 border ${
                isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-900 shadow-xs'
              }`}>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Official Ambassador Talent</span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-extrabold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Award className="w-6 h-6 text-cyan-600 dark:text-cyan-400" /> Brand Ambassador AG School
              </h2>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Mewakili komunitas AG School dalam promosi game Roblox, konten interaktif, dan event turnamen.
              </p>
            </div>
          </div>

          {baLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className={`h-64 rounded-3xl animate-pulse ${isDark ? 'bg-slate-900/50' : 'bg-slate-200/60'}`} />
              ))}
            </div>
          ) : ambassadors.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {ambassadors.map((ba) => (
                <Link
                  key={ba.id}
                  to={`/brand-ambassadors/${ba.id}`}
                  className={`glass-card rounded-3xl p-5 sm:p-6 border transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center justify-between group cursor-pointer ${
                    isDark
                      ? 'border-slate-800 hover:border-cyan-500/50'
                      : 'border-slate-200 bg-white hover:border-cyan-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center w-full">
                    {/* Large Circular Avatar */}
                    <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 p-1 shrink-0 mb-4 transition-transform duration-300 group-hover:scale-105 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 group-hover:border-cyan-400'
                        : 'bg-slate-100 border-slate-300 group-hover:border-cyan-600 shadow-sm'
                    }`}>
                      <img
                        src={ba.avatar_url || `https://images.rbxcdn.com/30x30_icon_Roblox.png`}
                        alt={ba.display_name}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.rbxcdn.com/30x30_icon_Roblox.png';
                        }}
                      />
                    </div>

                    {/* Display Name */}
                    <h3 className={`text-base sm:text-lg font-extrabold truncate w-full mb-1 transition-colors ${
                      isDark ? 'text-white group-hover:text-cyan-400' : 'text-slate-900 group-hover:text-cyan-700'
                    }`}>
                      {ba.display_name}
                    </h3>

                    {/* Official BA Title */}
                    <p className={`text-xs font-semibold truncate w-full mb-4 ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {ba.title || 'Official Brand Ambassador'}
                    </p>
                  </div>

                  {/* Interaction Indicator */}
                  <div className={`pt-3 w-full border-t flex items-center justify-center gap-1 text-xs font-black transition-all ${
                    isDark
                      ? 'border-slate-800/80 text-cyan-400 group-hover:text-cyan-300'
                      : 'border-slate-100 text-cyan-700 group-hover:text-cyan-900'
                  }`}>
                    <span>Lihat Profil</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={`text-center py-12 rounded-3xl border ${
              isDark ? 'glass-panel border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'
            }`}>
              <Sparkles className="w-10 h-10 stroke-1 text-purple-400 mx-auto mb-2" />
              <p className="text-xs">Belum ada data Brand Ambassador yang ditampilkan secara publik.</p>
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};
