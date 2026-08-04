import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { BrandAmbassadorModal } from '../components/common/BrandAmbassadorModal';
import {
  Award, Plus, Search, Filter, Star, Eye, EyeOff, Edit, Trash2,
  Instagram, Youtube, MessageSquare, ExternalLink, ArrowUp, ArrowDown,
  Sparkles, CheckCircle2, AlertCircle, ShieldAlert
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const BrandAmbassadorPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [search, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/brand-ambassadors', {
        params: { search, status: statusFilter }
      });
      if (response.data.success) {
        setItems(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching brand ambassadors:', err);
      toast.error(err.response?.data?.message || 'Gagal memuat data Brand Ambassador');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleToggleFeatured = async (item) => {
    try {
      const response = await api.put(`/internal/brand-ambassadors/${item.id}/featured`);
      toast.success(response.data.message || 'Status Featured diperbarui');
      fetchData();
    } catch (err) {
      toast.error('Gagal mengubah status Featured');
    }
  };

  const handleToggleStatus = async (item, newStatus) => {
    try {
      const response = await api.put(`/internal/brand-ambassadors/${item.id}/status`, { status: newStatus });
      toast.success(response.data.message || 'Status diperbarui');
      fetchData();
    } catch (err) {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin mengarsipkan Brand Ambassador ini?')) return;
    try {
      await api.delete(`/internal/brand-ambassadors/${id}`);
      toast.success('Brand Ambassador berhasil diarsipkan');
      fetchData();
    } catch (err) {
      toast.error('Gagal mengarsipkan Brand Ambassador');
    }
  };

  const handleReorder = async (item, direction) => {
    const currentOrder = item.display_order ?? 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;
    try {
      await api.put(`/internal/brand-ambassadors/${item.id}`, { display_order: newOrder });
      fetchData();
    } catch (err) {
      toast.error('Gagal merubah urutan');
    }
  };

  // Metrics
  const totalCount = items.length;
  const publicCount = items.filter(b => b.status === 'public').length;
  const featuredCount = items.filter(b => b.is_featured).length;
  const hiddenCount = items.filter(b => b.status === 'hidden' || b.status === 'archived').length;

  const columns = [
    {
      header: 'Urutan',
      render: (row) => (
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-300">
            {row.display_order ?? 1}
          </span>
          <div className="flex flex-col">
            <button
              onClick={() => handleReorder(row, 'up')}
              className="p-0.5 hover:text-cyan-400 text-slate-500 transition-colors"
              title="Naikkan Urutan"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleReorder(row, 'down')}
              className="p-0.5 hover:text-cyan-400 text-slate-500 transition-colors"
              title="Turunkan Urutan"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      )
    },
    {
      header: 'Brand Ambassador',
      render: (row) => {
        const avatarUrl = row.avatar_url && row.avatar_url.trim()
          ? row.avatar_url.trim()
          : (row.roblox_user_id
              ? `/api/public/brand-ambassadors/avatar-headshot?userId=${row.roblox_user_id}`
              : (row.roblox_username
                  ? `/api/public/brand-ambassadors/avatar-headshot?username=${encodeURIComponent(row.roblox_username)}`
                  : 'https://images.rbxcdn.com/30x30_icon_Roblox.png'));

        return (
          <div className="flex items-center gap-3 min-w-[220px]">
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-purple-500/30 overflow-hidden shrink-0 relative shadow-sm">
              <img src={avatarUrl} alt={row.display_name} className="w-full h-full object-cover" />
              {row.is_featured && (
                <span className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-amber-500 text-slate-950">
                  <Star className="w-2.5 h-2.5 fill-slate-950" />
                </span>
              )}
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block leading-snug">{row.display_name}</span>
              <span className="text-[11px] text-cyan-300 font-mono font-bold block">@{row.roblox_username}</span>
              <span className="text-[10px] text-purple-300 font-semibold block">{row.title}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Intro & Motto',
      render: (row) => (
        <div className="min-w-[200px] max-w-xs text-xs text-slate-300 space-y-1">
          <p className="line-clamp-2 text-slate-300">{row.short_intro}</p>
          {row.motto && (
            <p className="text-[10px] text-amber-300 italic font-semibold line-clamp-1">"{row.motto}"</p>
          )}
        </div>
      )
    },
    {
      header: 'Featured ⭐',
      render: (row) => (
        <button
          onClick={() => handleToggleFeatured(row)}
          className={`px-2.5 py-1 text-xs font-bold rounded-full border flex items-center gap-1 transition-all whitespace-nowrap ${
            row.is_featured
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
              : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${row.is_featured ? 'fill-amber-400 text-amber-400' : 'text-slate-500'}`} />
          {row.is_featured ? 'Featured' : 'Biasa'}
        </button>
      )
    },
    {
      header: 'Status',
      render: (row) => {
        const isPublic = row.status === 'public';
        const isHidden = row.status === 'hidden';
        return (
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full border whitespace-nowrap inline-flex items-center gap-1 ${
            isPublic
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : isHidden
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
          }`}>
            {isPublic ? '🟢 Public' : isHidden ? '🟡 Hidden' : '🔴 Archived'}
          </span>
        );
      }
    },
    {
      header: 'Medsos',
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap text-slate-400">
          {row.instagram && (
            <a href={row.instagram} target="_blank" rel="noreferrer" title="Instagram Profile">
              <Instagram className="w-4 h-4 text-pink-400 hover:scale-110 transition-transform" />
            </a>
          )}
          {row.tiktok && (
            <a href={row.tiktok} target="_blank" rel="noreferrer" title="TikTok Profile">
              <Sparkles className="w-4 h-4 text-cyan-400 hover:scale-110 transition-transform" />
            </a>
          )}
          {row.youtube && (
            <a href={row.youtube} target="_blank" rel="noreferrer" title="YouTube Channel">
              <Youtube className="w-4 h-4 text-rose-500 hover:scale-110 transition-transform" />
            </a>
          )}
          {row.discord_username && (
            <span title={`Discord: ${row.discord_username}`}>
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Aksi',
      render: (row) => (
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <button
            onClick={() => handleToggleStatus(row, row.status === 'public' ? 'hidden' : 'public')}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              row.status === 'public'
                ? 'bg-slate-900 text-amber-400 border-slate-700 hover:bg-slate-800'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title={row.status === 'public' ? 'Sembunyikan dari Publik' : 'Tampilkan ke Publik'}
          >
            {row.status === 'public' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Edit Brand Ambassador"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Arsipkan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 lg:p-10 ml-0 lg:ml-64 overflow-x-hidden space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-purple-500/20 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold mb-2">
              <Award className="w-3.5 h-3.5 text-purple-400" /> Official AG School Representatives
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Direktori Official Brand Ambassador
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Kelola profil resmi Brand Ambassador AG School, atur status keterlihatan publik, jadikan Featured BA unggulan, dan pantau tautan media sosial.
            </p>
          </div>

          <button
            onClick={handleCreate}
            className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg glow-purple transition-all transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Brand Ambassador</span>
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block">Total BA</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-1 block">{totalCount}</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <span className="text-[11px] font-semibold text-emerald-400 uppercase block">Tampil Publik 🟢</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-300 mt-1 block">{publicCount}</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <span className="text-[11px] font-semibold text-amber-400 uppercase block">Featured BA ⭐</span>
            <span className="text-xl sm:text-2xl font-black text-amber-300 mt-1 block">{featuredCount}</span>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase block">Hidden / Arsip 🔴</span>
            <span className="text-xl sm:text-2xl font-black text-slate-300 mt-1 block">{hiddenCount}</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, Roblox username, atau role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500 font-semibold"
            >
              <option value="">Semua Status</option>
              <option value="public">🟢 Public Only</option>
              <option value="hidden">🟡 Hidden Only</option>
              <option value="archived">🔴 Archived Only</option>
            </select>
          </div>
        </div>

        {/* Table Component */}
        <Table
          columns={columns}
          data={items}
          loading={loading}
          emptyMessage="Belum ada Brand Ambassador yang terdaftar."
        />

        {/* Modal Form */}
        <BrandAmbassadorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          item={selectedItem}
          onSave={fetchData}
        />
      </main>
    </div>
  );
};
