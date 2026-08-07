import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { TikTokIcon, DiscordIcon, InstagramIcon, YoutubeIcon } from '../components/common/SocialIcons';
import {
  Award, Star, ArrowLeft, ExternalLink,
  Sparkles, Calendar, Gamepad2, Trophy, ShieldCheck,
  X, Image as ImageIcon, Radio
} from 'lucide-react';
import api from '../services/api';
import { formatDateDisplay } from '../utils/dateFormatter';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export const PublicBADetail = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [ambassador, setAmbassador] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/public/brand-ambassadors/${id}`);
      if (response.data.success) {
        const data = response.data.data;
        setAmbassador(data);

        // Fetch recent events to match ambassador game or Roblox tag
        try {
          const eventsRes = await api.get('/public/events');
          if (eventsRes.data.success) {
            const allEvents = eventsRes.data.data || [];
            // Filter up to 3 relevant events
            const relevant = allEvents.slice(0, 3);
            setRecentEvents(relevant);
          }
        } catch {
          setRecentEvents([]);
        }
      } else {
        setError('Brand Ambassador tidak ditemukan');
      }
    } catch (err) {
      setError('Brand Ambassador tidak ditemukan atau belum dipublikasikan');
    } finally {
      setLoading(false);
    }
  };

  // Helper check for active social platforms
  const hasSocialMedia = ambassador && (
    ambassador.instagram ||
    ambassador.tiktok ||
    ambassador.youtube ||
    ambassador.discord_username ||
    ambassador.roblox_username ||
    ambassador.twitter
  );

  // Helper gallery array (supports array or fallback)
  const galleryList = ambassador && Array.isArray(ambassador.gallery) && ambassador.gallery.length > 0
    ? ambassador.gallery
    : [];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PublicNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Simple Top Navigation */}
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-xs font-bold transition-colors mb-8 ${
            isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> &larr; Kembali ke Gallery Brand Ambassador
        </Link>

        {loading ? (
          <div className="py-16 text-center space-y-6 animate-pulse">
            <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full mx-auto ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`} />
            <div className={`h-8 rounded-xl max-w-xs mx-auto ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`} />
            <div className={`h-4 rounded-xl max-w-md mx-auto ${isDark ? 'bg-slate-900/60' : 'bg-slate-200/60'}`} />
          </div>
        ) : error || !ambassador ? (
          <div className={`p-12 rounded-3xl text-center border space-y-4 ${
            isDark ? 'border-slate-800 bg-slate-900/50' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Brand Ambassador Tidak Ditemukan</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm transition-all"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {/* 1. HERO SECTION (Minimalist, Large Whitespace, Premium Focus) */}
            <section className="text-center flex flex-col items-center space-y-4">
              {/* Avatar Container */}
              <div className="relative">
                <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 p-1.5 shadow-xl transition-transform duration-300 hover:scale-105 ${
                  isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'
                }`}>
                  <img
                    src={ambassador.avatar_url}
                    alt={ambassador.display_name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                {ambassador.is_featured && (
                  <span className="absolute bottom-1 right-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-slate-950" /> Featured
                  </span>
                )}
              </div>

              {/* Title & Name */}
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full border text-xs font-extrabold flex items-center gap-1.5 shadow-xs ${
                    isDark ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-900 border-slate-300'
                  }`}>
                    <Award className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> {ambassador.title || 'Official Brand Ambassador'}
                  </span>
                  {ambassador.roblox_username && (
                    <span className={`px-3 py-1 rounded-full border text-xs font-mono font-extrabold ${
                      isDark ? 'bg-slate-900 text-cyan-300 border-slate-800' : 'bg-slate-100 text-slate-800 border-slate-300'
                    }`}>
                      @{ambassador.roblox_username}
                    </span>
                  )}
                </div>

                <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {ambassador.display_name}
                </h1>

                {ambassador.joined_date && (
                  <p className={`text-xs font-semibold flex items-center justify-center gap-1.5 pt-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Calendar className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span>Member Sejak: <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>{formatDateDisplay(ambassador.joined_date, lang)}</strong></span>
                  </p>
                )}
              </div>
            </section>

            {/* 2. ABOUT SECTION (Comfortable Reading Width, Clean Typography) */}
            <section className="max-w-3xl mx-auto space-y-4">
              {ambassador.motto && (
                <div className={`p-4 sm:p-5 rounded-2xl border text-center text-sm font-semibold italic ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-amber-300' : 'bg-slate-100/90 border-slate-200 text-slate-800'
                }`}>
                  "{ambassador.motto}"
                </div>
              )}

              <div className={`p-6 sm:p-8 rounded-3xl border space-y-3 ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h2 className={`text-base font-extrabold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Tentang {ambassador.display_name}
                </h2>
                <p className={`text-sm sm:text-base leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {ambassador.bio || ambassador.short_intro || (
                    <span className="italic text-slate-400">Belum ada deskripsi profil tambahan yang dimasukkan.</span>
                  )}
                </p>

                {(ambassador.favorite_game || ambassador.specialty) && (
                  <div className={`pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${
                    isDark ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    {ambassador.favorite_game && (
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <span>Game Favorit: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{ambassador.favorite_game}</strong></span>
                      </div>
                    )}
                    {ambassador.specialty && (
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Spesialisasi: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{ambassador.specialty}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* 3. GALLERY SECTION (Auto-Hides if Empty, Lightbox View) */}
            {galleryList.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg sm:text-xl font-extrabold flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <ImageIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Galeri Highlights
                  </h2>
                  <span className="text-xs font-semibold text-slate-400">{galleryList.length} Foto</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {galleryList.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveLightboxImg(imgUrl)}
                      className={`h-40 sm:h-48 rounded-2xl overflow-hidden border transition-all duration-300 group cursor-pointer relative ${
                        isDark ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/50' : 'bg-slate-100 border-slate-200 hover:border-cyan-400 hover:shadow-md'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Highlight ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2.5 py-1 rounded-full bg-slate-950/80 text-white text-[10px] font-extrabold">Perbesar 🔍</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* 4. OFFICIAL SOCIAL MEDIA (Shows ONLY Configured Platforms) */}
            {hasSocialMedia && (
              <section className="space-y-4">
                <h2 className={`text-lg sm:text-xl font-extrabold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Sparkles className="w-5 h-5 text-amber-500" /> Media Sosial Resmi
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ambassador.instagram && (
                    <a
                      href={ambassador.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                          <InstagramIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Instagram</span>
                          <span className="text-[11px] text-slate-400 block">Kunjungi Profil</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                    </a>
                  )}

                  {ambassador.tiktok && (
                    <a
                      href={ambassador.tiktok}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-cyan-500/10 transition-colors ${
                          isDark ? 'text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950' : 'text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white'
                        }`}>
                          <TikTokIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>TikTok</span>
                          <span className="text-[11px] text-slate-400 block">Tonton Konten</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                    </a>
                  )}

                  {ambassador.youtube && (
                    <a
                      href={ambassador.youtube}
                      target="_blank"
                      rel="noreferrer"
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                        isDark
                          ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                          <YoutubeIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>YouTube</span>
                          <span className="text-[11px] text-slate-400 block">Subscribe Channel</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-600 transition-colors" />
                    </a>
                  )}

                  {ambassador.discord_username && (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                          <DiscordIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Discord</span>
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-bold block truncate max-w-[130px]">{ambassador.discord_username}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {ambassador.roblox_username && (
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-500/10 text-slate-700 dark:text-slate-300">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Roblox Handle</span>
                          <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-bold block truncate max-w-[130px]">@{ambassador.roblox_username}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 5. RECENT EVENTS SECTION (Auto-Hides if Empty, Max 3 Events) */}
            {recentEvents.length > 0 && (
              <section className="space-y-4 pt-4 border-t border-slate-800/40">
                <div className="flex items-center justify-between">
                  <h2 className={`text-lg sm:text-xl font-extrabold flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    <Radio className="w-5 h-5 text-amber-500" /> Event Turnamen Terbaru
                  </h2>
                  <Link to="/" className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                    Semua Event &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recentEvents.map((evt) => (
                    <Link
                      key={evt.id}
                      to={`/events/${evt.id}`}
                      className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 group ${
                        isDark ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40' : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}>
                        {evt.poster_url ? (
                          <img src={evt.poster_url} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Trophy className="w-6 h-6 stroke-1" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-xs sm:text-sm font-bold truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {evt.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {formatDateDisplay(evt.start_date, lang)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Lightbox Image Modal */}
      {activeLightboxImg && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActiveLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
            <button
              type="button"
              onClick={() => setActiveLightboxImg(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-950/80 text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeLightboxImg}
              alt="Enlarged Highlight"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
};
