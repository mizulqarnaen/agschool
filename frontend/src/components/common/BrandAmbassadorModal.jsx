import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { User, Sparkles, Star, Globe, Instagram, Youtube, MessageSquare, Save, Eye, EyeOff, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const BrandAmbassadorModal = ({ isOpen, onClose, item, onSave }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    display_name: '',
    roblox_username: '',
    roblox_user_id: '',
    avatar_url: '',
    title: 'Official Brand Ambassador',
    short_intro: '',
    bio: '',
    nickname: '',
    motto: '',
    favorite_game: '',
    specialty: '',
    joined_date: new Date().toISOString().split('T')[0],
    display_order: 1,
    status: 'public',
    is_featured: false,
    instagram: '',
    tiktok: '',
    youtube: '',
    discord_username: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          display_name: item.display_name || '',
          roblox_username: item.roblox_username || '',
          roblox_user_id: item.roblox_user_id || '',
          avatar_url: item.avatar_url || '',
          title: item.title || 'Official Brand Ambassador',
          short_intro: item.short_intro || '',
          bio: item.bio || '',
          nickname: item.nickname || '',
          motto: item.motto || '',
          favorite_game: item.favorite_game || '',
          specialty: item.specialty || '',
          joined_date: item.joined_date || new Date().toISOString().split('T')[0],
          display_order: item.display_order ?? 1,
          status: item.status || 'public',
          is_featured: !!item.is_featured,
          instagram: item.instagram || '',
          tiktok: item.tiktok || '',
          youtube: item.youtube || '',
          discord_username: item.discord_username || ''
        });
      } else {
        setFormData({
          display_name: '',
          roblox_username: '',
          roblox_user_id: '',
          avatar_url: '',
          title: 'Official Brand Ambassador',
          short_intro: '',
          bio: '',
          nickname: '',
          motto: '',
          favorite_game: 'Roblox Obby, Tower Race',
          specialty: 'Speedrunner & Community Influencer',
          joined_date: new Date().toISOString().split('T')[0],
          display_order: 1,
          status: 'public',
          is_featured: false,
          instagram: '',
          tiktok: '',
          youtube: '',
          discord_username: ''
        });
      }
      setActiveTab('basic');
    }
  }, [isOpen, item]);

  const previewAvatar = formData.avatar_url && formData.avatar_url.trim()
    ? formData.avatar_url
    : (formData.roblox_user_id && formData.roblox_user_id.trim()
        ? `https://thumbs.roblox.com/v1/users/avatar-headshot?userIds=${formData.roblox_user_id.trim()}&size=420x420&format=Png&isCircular=false`
        : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.display_name.trim() || !formData.roblox_username.trim() || !formData.title.trim()) {
      return toast.error('Nama Tampilan, Roblox Username, dan Title/Role wajib diisi!');
    }

    setSaving(true);
    try {
      if (item && item.id) {
        await api.put(`/internal/brand-ambassadors/${item.id}`, formData);
        toast.success('Profil Brand Ambassador diperbarui');
      } else {
        await api.post('/internal/brand-ambassadors', formData);
        toast.success('Brand Ambassador baru berhasil ditambahkan');
      }
      if (onSave) onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan Brand Ambassador');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? `Edit Brand Ambassador - ${item.display_name}` : 'Tambah Official Brand Ambassador'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl w-full">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'basic'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Profil Utama
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bio')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'bio'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Bio & Keahlian
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'social'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> Media Sosial
          </button>
        </div>

        {/* Tab 1: Basic Info */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-purple-500/40 overflow-hidden flex items-center justify-center relative shrink-0 shadow-lg">
                {previewAvatar ? (
                  <img src={previewAvatar} alt="Roblox Headshot Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-600" />
                )}
                {formData.is_featured && (
                  <span className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-slate-950 shadow">
                    <Star className="w-3.5 h-3.5 fill-slate-950" />
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Roblox Avatar Headshot Preview
                </span>
                <p className="text-[11px] text-slate-400">
                  Avatar Roblox akan otomatis terhubung saat Anda memasukkan Roblox User ID / Username. Anda juga dapat menentukan URL avatar kustom.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Nama Tampilan (Display Name) *</label>
                <input
                  type="text"
                  placeholder="Contoh: Agnes Roblox"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Roblox Username *</label>
                <input
                  type="text"
                  placeholder="Contoh: Agnes_AG"
                  value={formData.roblox_username}
                  onChange={(e) => setFormData({ ...formData, roblox_username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Roblox User ID (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: 123456789"
                  value={formData.roblox_user_id}
                  onChange={(e) => setFormData({ ...formData, roblox_user_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Jabatan / Role Official *</label>
                <input
                  type="text"
                  placeholder="Contoh: Lead Brand Ambassador / Official BA"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-purple-300 font-semibold placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Avatar Headshot Image URL (Kustom Opsional)</label>
              <input
                type="url"
                placeholder="https://thumbs.roblox.com/v1/users/avatar-headshot..."
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Intro Singkat *</label>
              <input
                type="text"
                placeholder="Contoh: Influencer & Pro Player Obby AG School Roblox Community."
                value={formData.short_intro}
                onChange={(e) => setFormData({ ...formData, short_intro: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tanggal Bergabung</label>
                <input
                  type="date"
                  value={formData.joined_date}
                  onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Urutan Tampil (Order)</label>
                <input
                  type="number"
                  min={1}
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Status Keterlihatan</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold focus:outline-none"
                >
                  <option value="public">🟢 Public (Tampil)</option>
                  <option value="hidden">🟡 Hidden (Sembunyi)</option>
                  <option value="archived">🔴 Archived (Arsip)</option>
                </select>
              </div>
            </div>

            {/* Featured BA Switch */}
            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${formData.is_featured ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                <div>
                  <span className="text-xs font-bold text-purple-200 block">Jadikan Featured Brand Ambassador ⭐</span>
                  <span className="text-[11px] text-slate-400 block">BA unggulan akan tampil lebih besar di halaman utama portal publik.</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 bg-slate-950 border-slate-700 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Bio & Keahlian */}
        {activeTab === 'bio' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Panggilan / Nickname</label>
                <input
                  type="text"
                  placeholder="Contoh: Agnes"
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Motto / Quote Favorit</label>
                <input
                  type="text"
                  placeholder="Contoh: Taklukkan setiap obby dengan senyuman!"
                  value={formData.motto}
                  onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-300 font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Game Favorit</label>
                <input
                  type="text"
                  placeholder="Contoh: Roblox Obby, Tower Race, Blox Fruits"
                  value={formData.favorite_game}
                  onChange={(e) => setFormData({ ...formData, favorite_game: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-purple-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Keahlian / Spesialisasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Speedrun & Summit Master"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Biografi Lengkap / Deskripsi Profil</label>
              <textarea
                rows={5}
                placeholder="Tuliskan cerita singkat, pencapaian, dan perjalanan Brand Ambassador ini di AG School..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Social Media */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">
              Isi link profil media sosial resmi Brand Ambassador. Hanya media sosial yang diisi yang akan ditampilkan pada portal publik.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-400" /> Instagram Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/username"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> TikTok Profile URL
                </label>
                <input
                  type="url"
                  placeholder="https://tiktok.com/@username"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-rose-500" /> YouTube Channel URL
                </label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@channelname"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Discord Username
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Agnes#1234 atau agnes_roblox"
                  value={formData.discord_username}
                  onChange={(e) => setFormData({ ...formData, discord_username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-purple transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan...' : 'Simpan Profil Brand Ambassador'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
