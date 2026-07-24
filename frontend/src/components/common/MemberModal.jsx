import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import api from '../../services/api';
import { Users, Plus, Trash2, Edit, UserCheck, Settings, X, Gamepad2, Video, Search, Filter, Phone, Mail, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const MemberModal = ({ isOpen, onClose, onMembersUpdated }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState(['BA', 'Caster', 'Maintainer', 'Secretary', 'Staff', 'Content Creator']);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Sub-panel for category management
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    roblox_username: '',
    roblox_nickname: '',
    tiktok_handle: '',
    monthly_salary: '',
    salary_currency: 'IDR',
    category: 'BA',
    status: 'active',
    joined_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchCategories();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/finance/members');
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (_) {
      toast.error('Failed to load staff members');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/internal/finance/members/categories');
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
        if (response.data.data.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: response.data.data[0] }));
        }
      }
    } catch (_) {}
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catName = newCategoryName.trim();
    if (categories.includes(catName)) {
      return toast.error('Category already exists');
    }
    const updatedCategories = [...categories, catName];
    try {
      await api.post('/internal/finance/members/categories', { categories: updatedCategories });
      setCategories(updatedCategories);
      setNewCategoryName('');
      toast.success(`Category "${catName}" added`);
    } catch (_) {
      toast.error('Failed to save category');
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    if (categories.length <= 1) {
      return toast.error('At least one category must remain');
    }
    if (!window.confirm(`Delete category "${catToDelete}"?`)) return;
    const updatedCategories = categories.filter(c => c !== catToDelete);
    try {
      await api.post('/internal/finance/members/categories', { categories: updatedCategories });
      setCategories(updatedCategories);
      if (selectedCategoryFilter === catToDelete) {
        setSelectedCategoryFilter('All');
      }
      toast.success(`Category "${catToDelete}" deleted`);
    } catch (_) {
      toast.error('Failed to delete category');
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      full_name: member.full_name,
      email: member.email || '',
      phone: member.phone || '',
      roblox_username: member.roblox_username || '',
      roblox_nickname: member.roblox_nickname || '',
      tiktok_handle: member.tiktok_handle || '',
      monthly_salary: member.monthly_salary !== undefined && member.monthly_salary !== null ? member.monthly_salary : '',
      salary_currency: member.salary_currency || 'IDR',
      category: member.category || categories[0] || 'BA',
      status: member.status || 'active',
      joined_date: member.joined_date || new Date().toISOString().split('T')[0]
    });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      roblox_username: '',
      roblox_nickname: '',
      tiktok_handle: '',
      monthly_salary: '',
      salary_currency: 'IDR',
      category: categories[0] || 'BA',
      status: 'active',
      joined_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/internal/finance/members/${editingId}`, formData);
        toast.success('Member updated successfully');
      } else {
        await api.post('/internal/finance/members', formData);
        toast.success('Member added successfully');
      }
      handleResetForm();
      fetchMembers();
      if (onMembersUpdated) onMembersUpdated();
    } catch (err) {
      toast.error('Failed to save member');
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Delete this staff member?')) return;
    try {
      await api.delete(`/internal/finance/members/${memberId}`);
      toast.success('Member soft-deleted');
      fetchMembers();
      if (onMembersUpdated) onMembersUpdated();
    } catch (_) {
      toast.error('Failed to delete member');
    }
  };

  // Filter members dynamically
  const filteredMembers = members.filter((m) => {
    const matchCat = selectedCategoryFilter === 'All' || m.category === selectedCategoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      m.full_name?.toLowerCase().includes(q) ||
      m.roblox_username?.toLowerCase().includes(q) ||
      m.roblox_nickname?.toLowerCase().includes(q) ||
      m.tiktok_handle?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q);

    return matchCat && matchSearch;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Internal Staff & Member Profiles" maxWidth="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Member Roster List & Realtime Search/Filters */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Bar: Search & Category Config Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search member, Roblox ID, TikTok, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showCategoryManager ? 'Close Categories' : 'Config Categories'}</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('All')}
              className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                selectedCategoryFilter === 'All'
                  ? 'bg-cyan-500 text-white border-cyan-400 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              All ({members.length})
            </button>
            {categories.map((cat) => {
              const count = members.filter(m => m.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${
                    selectedCategoryFilter === cat
                      ? 'bg-purple-500 text-white border-purple-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Category Management Sub-Panel */}
          {showCategoryManager && (
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-cyan-500/30 space-y-3">
              <h5 className="text-xs font-bold text-cyan-300 uppercase">Custom Member Categories</h5>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">
                    <span>{cat}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddCategory} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="New Category (e.g. Shoutcaster)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-400"
                >
                  Add Category
                </button>
              </form>
            </div>
          )}

          {/* Filtered Members List */}
          {loading ? (
            <div className="text-xs text-slate-400 p-8 text-center">Loading member roster...</div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredMembers.map((m) => (
                <div key={m.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="font-bold text-white text-sm">{m.full_name}</span>
                      <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {m.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                      {m.monthly_salary > 0 && (
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Gaji Acuan: {m.salary_currency || 'IDR'} {Number(m.monthly_salary).toLocaleString()}/bln
                        </span>
                      )}
                      {m.roblox_username && (
                        <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                          <Gamepad2 className="w-3.5 h-3.5" /> @{m.roblox_username} {m.roblox_nickname ? `(${m.roblox_nickname})` : ''}
                        </span>
                      )}
                      {m.tiktok_handle && (
                        <span className="flex items-center gap-1 text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                          <Video className="w-3.5 h-3.5" /> {m.tiktok_handle}
                        </span>
                      )}
                      {m.email && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Mail className="w-3 h-3 text-slate-400" /> {m.email}
                        </span>
                      )}
                      {m.phone && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Phone className="w-3 h-3 text-slate-400" /> {m.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(m)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Edit Member"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
              No staff members found matching query "{searchQuery}".
            </div>
          )}
        </div>

        {/* Right Column: Add/Edit Member Form */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            {editingId ? 'Edit Data Anggota Staff' : 'Tambah Anggota Staff Baru'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                placeholder="contoh: Alex Tan"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Kategori / Role *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Salary / Honor Benchmark */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30 space-y-2.5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase block flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Gaji / Honor Bulanan Acuan (Opsional)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Nominal Gaji</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00 (contoh: 1500000)"
                    value={formData.monthly_salary}
                    onChange={(e) => setFormData({ ...formData, monthly_salary: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-emerald-300 font-semibold focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Mata Uang</label>
                  <select
                    value={formData.salary_currency}
                    onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="IDR">IDR</option>
                    <option value="SGD">SGD</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Gaji acuan ini akan otomatis terisi saat melakukan input pembayaran anggota.</p>
            </div>

            {/* Optional Social Handles */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-cyan-400 uppercase block">Roblox & TikTok Handles (Opsional)</span>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Roblox Username</label>
                <input
                  type="text"
                  placeholder="contoh: AlexRoblox"
                  value={formData.roblox_username}
                  onChange={(e) => setFormData({ ...formData, roblox_username: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Roblox Nickname</label>
                <input
                  type="text"
                  placeholder="contoh: Alex_Pro"
                  value={formData.roblox_nickname}
                  onChange={(e) => setFormData({ ...formData, roblox_nickname: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">TikTok Handle</label>
                <input
                  type="text"
                  placeholder="contoh: @alextan_agschool"
                  value={formData.tiktok_handle}
                  onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="email@agschool.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Nomor Telepon (Opsional)</label>
                <input
                  type="text"
                  placeholder="+65 9123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  {t('cancel')}
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-400 shadow-md glow-cyan"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah Anggota'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
