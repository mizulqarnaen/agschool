import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { TikTokIcon, DiscordIcon, InstagramIcon, YoutubeIcon } from '../components/common/SocialIcons';
import {
  Award, Star, ArrowLeft, ExternalLink,
  Sparkles, Calendar, Gamepad2, Trophy, ShieldCheck
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/public/brand-ambassadors/${id}`);
      if (response.data.success) {
        setAmbassador(response.data.data);
      } else {
        setError('Brand Ambassador tidak ditemukan');
      }
    } catch (err) {
      setError('Brand Ambassador tidak ditemukan atau belum dipublikasikan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PublicNavbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Link */}
        <Link
          to="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors mb-6 ${
            isDark ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-600 hover:text-cyan-700'
          }`}
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Portal Utama
        </Link>

        {loading ? (
          <div className={`glass-panel p-12 rounded-3xl text-center space-y-4 border animate-pulse ${
            isDark ? 'border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-28 h-28 rounded-3xl mx-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-6 rounded max-w-xs mx-auto ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`h-4 rounded max-w-md mx-auto ${isDark ? 'bg-slate-800/60' : 'bg-slate-200/60'}`} />
          </div>
        ) : error || !ambassador ? (
          <div className={`glass-panel p-12 rounded-3xl text-center border space-y-4 ${
            isDark ? 'border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Brand Ambassador Tidak Ditemukan</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
            <Link
              to="/"
              className={`inline-block px-5 py-2 rounded-xl text-xs font-bold ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Profile Hero Card */}
            <div className={`glass-panel p-6 sm:p-10 rounded-3xl border relative overflow-hidden ${
              isDark ? 'border-purple-500/30' : 'border-purple-200 bg-white/95 shadow-sm'
            }`}>
              <div className="absolute right-0 top-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10">
                {/* Large Roblox Avatar */}
                <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl border-2 overflow-hidden shrink-0 relative shadow-2xl p-1 ${
                  isDark ? 'bg-slate-900 border-purple-500/50 glow-purple' : 'bg-slate-100 border-purple-300'
                }`}>
                  <img
                    src={ambassador.avatar_url}
                    alt={ambassador.display_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  {ambassador.is_featured && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-slate-950" /> FEATURED
                    </span>
                  )}
                </div>

                {/* Profile Main Info */}
                <div className="flex-1 text-center md:text-left space-y-3">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className={`px-3 py-1 rounded-full border text-xs font-extrabold flex items-center gap-1.5 shadow-sm ${
                      isDark ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-purple-100 text-purple-800 border-purple-200'
                    }`}>
                      <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {ambassador.title}
                    </span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-mono font-bold ${
                      isDark ? 'bg-slate-900 text-cyan-300 border-cyan-500/30' : 'bg-slate-100 text-cyan-800 border-cyan-300'
                    }`}>
                      @{ambassador.roblox_username}
                    </span>
                  </div>

                  <h1 className={`text-3xl sm:text-4xl font-black ${
                    isDark
                      ? 'bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent'
                      : 'text-slate-900'
                  }`}>
                    {ambassador.display_name}
                  </h1>

                  <p className={`text-sm sm:text-base font-medium leading-relaxed max-w-2xl ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}>
                    {ambassador.short_intro}
                  </p>

                  {ambassador.motto && (
                    <div className={`p-3 sm:p-4 rounded-2xl border text-xs sm:text-sm font-semibold italic max-w-xl shadow-inner ${
                      isDark ? 'bg-slate-900/80 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      "{ambassador.motto}"
                    </div>
                  )}

                  <div className={`pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span>Official Member Sejak: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{formatDateDisplay(ambassador.joined_date, lang)}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialty & Favorites Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ambassador.favorite_game && (
                <div className={`glass-panel p-5 rounded-2xl border space-y-2 ${
                  isDark ? 'border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4" /> Game Roblox Favorit
                  </span>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ambassador.favorite_game}</p>
                </div>
              )}

              {ambassador.specialty && (
                <div className={`glass-panel p-5 rounded-2xl border space-y-2 ${
                  isDark ? 'border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> Spesialisasi & Peran Utama
                  </span>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{ambassador.specialty}</p>
                </div>
              )}
            </div>

            {/* Detailed Bio Section */}
            {ambassador.bio && (
              <div className={`glass-panel p-6 sm:p-8 rounded-3xl border space-y-3 ${
                isDark ? 'border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  <Award className="w-5 h-5 text-purple-500" /> Profil & Biografi Singkat
                </h3>
                <p className={`text-sm leading-relaxed whitespace-pre-line ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  {ambassador.bio}
                </p>
              </div>
            )}

            {/* Verified Social Media Section */}
            <div className={`glass-panel p-6 sm:p-8 rounded-3xl border space-y-4 ${
              isDark ? 'border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <h3 className={`text-base font-extrabold flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                <Sparkles className="w-5 h-5 text-amber-500" /> Media Sosial Resmi ({ambassador.display_name})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {ambassador.instagram && (
                  <a
                    href={ambassador.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      isDark
                        ? 'bg-slate-900/90 border-pink-500/30 hover:border-pink-500'
                        : 'bg-slate-50 border-pink-200 hover:border-pink-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                        <InstagramIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Instagram</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[120px]">Lihat Profil ➔</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-pink-500 transition-colors" />
                  </a>
                )}

                {ambassador.tiktok && (
                  <a
                    href={ambassador.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      isDark
                        ? 'bg-slate-900/90 border-cyan-500/30 hover:border-cyan-500'
                        : 'bg-slate-50 border-cyan-200 hover:border-cyan-400'
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
                        <span className="text-[11px] text-slate-500 block truncate max-w-[120px]">Tonton Konten ➔</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                  </a>
                )}

                {ambassador.youtube && (
                  <a
                    href={ambassador.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${
                      isDark
                        ? 'bg-slate-900/90 border-rose-500/30 hover:border-rose-500'
                        : 'bg-slate-50 border-rose-200 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                        <YoutubeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>YouTube</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[120px]">Subscribe Channel ➔</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-rose-500 transition-colors" />
                  </a>
                )}

                {ambassador.discord_username && (
                  <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    isDark ? 'bg-slate-900/90 border-indigo-500/30' : 'bg-slate-50 border-indigo-200'
                  }`}>
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <DiscordIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>Discord</span>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-300 font-mono font-bold block truncate max-w-[130px]">{ambassador.discord_username}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
