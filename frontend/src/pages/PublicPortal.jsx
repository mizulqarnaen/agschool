import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { EventCard } from '../components/public/EventCard';
import { useTheme } from '../context/ThemeContext';
import {
  Search, Filter, ShieldCheck, Trophy, Sparkles, Gamepad2, Zap, Gift,
  Award, Star, UserCheck, ArrowRight
} from 'lucide-react';
import { TikTokIcon, DiscordIcon, InstagramIcon, YoutubeIcon } from '../components/common/SocialIcons';

export const PublicPortal = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PublicNavbar />

      {/* Hero Header Section */}
      <section className={`relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-300 ${
        isDark ? 'border-slate-800/60' : 'border-slate-200/90 bg-gradient-to-b from-cyan-50/50 via-white to-slate-50'
      }`}>
        <div className={`absolute inset-0 pointer-events-none ${
          isDark ? 'bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent' : 'bg-gradient-to-b from-cyan-500/5 via-blue-500/5 to-transparent'
        }`} />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold mb-4 sm:mb-6 shadow-sm ${
            isDark ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'bg-cyan-100/80 border border-cyan-300 text-cyan-800'
          }`}>
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Portal Resmi Acara AG School</span>
          </div>

          <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-tight ${
            isDark
              ? 'bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent'
              : 'text-slate-900'
          }`}>
            AG School Event & Turnamen
          </h1>

          <p className={`text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Selamat datang di Portal Resmi AG School. Temukan informasi acara komunitas, turnamen game (Roblox, MLBB, dll), poster resmi, status pendaftaran, klasemen poin liga, dan transparansi daftar pemenang.
          </p>

          {/* Community Feature Pills */}
          <div className={`flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 pt-6 border-t text-xs font-bold ${
            isDark ? 'border-slate-800/60 text-slate-300' : 'border-slate-200 text-slate-700'
          }`}>
            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-purple-500/30 text-purple-300' : 'bg-white border-purple-200 text-purple-800 shadow-xs'
            }`}>
              <Gamepad2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Roblox (Obby & Speedrun)
            </span>
            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-blue-500/30 text-blue-300' : 'bg-white border-blue-200 text-blue-800 shadow-xs'
            }`}>
              <Trophy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> MLBB & Esports
            </span>
            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-cyan-500/30 text-cyan-300' : 'bg-white border-cyan-200 text-cyan-800 shadow-xs'
            }`}>
              <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Poin Liga & Standings
            </span>
            <span className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isDark ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-300' : 'bg-white border-emerald-200 text-emerald-800 shadow-xs'
            }`}>
              <Gift className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Transparansi Hadiah
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
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
        <div className="pt-6 border-t border-slate-800/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold mb-2 border ${
                isDark ? 'bg-purple-500/10 border-purple-500/30 text-purple-300' : 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
              }`}>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Official Ambassador Talent</span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-extrabold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Brand Ambassador AG School
              </h2>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Mewakili komunitas AG School dalam promosi game Roblox, konten interaktif, dan event turnamen.
              </p>
            </div>
          </div>

          {baLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`h-64 rounded-3xl animate-pulse ${isDark ? 'bg-slate-900/50' : 'bg-slate-200/60'}`} />
              ))}
            </div>
          ) : ambassadors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {ambassadors.map((ba) => (
                <div
                  key={ba.id}
                  className={`glass-card rounded-3xl p-5 border transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group relative overflow-hidden ${
                    isDark
                      ? 'border-purple-500/20 hover:border-purple-500/50'
                      : 'border-purple-200 bg-white hover:border-purple-300 hover:shadow-lg'
                  }`}
                >
                  {/* Top Featured Badge Overlay */}
                  {ba.is_featured && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-slate-950" /> Featured
                      </span>
                    </div>
                  )}

                  <div>
                    {/* BA Avatar & Basic Details */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 p-0.5 shrink-0 shadow-lg group-hover:scale-105 transition-transform ${
                        isDark ? 'bg-slate-900 border-purple-500/40 glow-purple' : 'bg-slate-100 border-purple-300'
                      }`}>
                        <img
                          src={ba.avatar_url || `https://images.rbxcdn.com/30x30_icon_Roblox.png`}
                          alt={ba.display_name}
                          className="w-full h-full object-cover rounded-xl"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.rbxcdn.com/30x30_icon_Roblox.png';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className={`text-base font-bold truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {ba.display_name}
                        </h3>
                        <p className="text-xs font-bold text-purple-900 dark:text-purple-300 truncate mb-1">
                          {ba.title || 'Official Brand Ambassador'}
                        </p>
                        <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg border font-mono font-bold ${
                          isDark ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/30' : 'bg-cyan-50 text-cyan-900 border-cyan-300'
                        }`}>
                          <UserCheck className="w-3 h-3 text-cyan-600 dark:text-cyan-500" /> @{ba.roblox_username}
                        </span>
                      </div>
                    </div>

                    {/* Bio / Motto Snippet */}
                    {ba.motto && (
                      <p className={`text-[11px] font-semibold italic line-clamp-1 p-2 rounded-xl border mb-3 ${
                        isDark ? 'text-amber-300 bg-amber-500/5 border-amber-500/20' : 'text-amber-800 bg-amber-50 border-amber-200'
                      }`}>
                        "{ba.motto}"
                      </p>
                    )}
                  </div>

                  {/* Footer Actions & Medsos */}
                  <div className={`pt-4 mt-2 border-t flex items-center justify-between gap-2 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 text-slate-400">
                      {ba.instagram && (
                        <a href={ba.instagram} target="_blank" rel="noreferrer" title="Instagram Profile">
                          <InstagramIcon className="w-4 h-4 text-pink-500 hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {ba.tiktok && (
                        <a href={ba.tiktok} target="_blank" rel="noreferrer" title="TikTok Profile">
                          <TikTokIcon className={`w-4 h-4 hover:scale-110 transition-transform ${isDark ? 'text-slate-200' : 'text-slate-800'}`} />
                        </a>
                      )}
                      {ba.youtube && (
                        <a href={ba.youtube} target="_blank" rel="noreferrer" title="YouTube Channel">
                          <YoutubeIcon className="w-4 h-4 text-rose-500 hover:scale-110 transition-transform" />
                        </a>
                      )}
                      {ba.discord_username && (
                        <span title={`Discord: ${ba.discord_username}`}>
                          <DiscordIcon className="w-4 h-4 text-indigo-500" />
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/brand-ambassadors/${ba.id}`}
                      className={`inline-flex items-center gap-1 text-xs font-black transition-all hover:underline ${
                        isDark ? 'text-purple-300 hover:text-white' : 'text-purple-900 hover:text-purple-950'
                      }`}
                    >
                      <span>Lihat Profil</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
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
