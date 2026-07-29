import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import api from '../../services/api';
import { Users, Plus, Trash2, Edit, UserCheck, Settings, X, Gamepad2, Video, Search, Filter, Phone, Mail, DollarSign, CreditCard, MessageSquare, Trophy, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const MemberModal = ({ isOpen, onClose, onMembersUpdated }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState(['BA', 'Caster', 'Maintainer', 'Secretary', 'Staff', 'Content Creator', 'Player']);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Sub-panel for category management
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    member_type: 'Staff',
    ign_tag: '',
    email: '',
    phone: '',
    roblox_username: '',
    roblox_nickname: '',
    tiktok_handle: '',
    discord_username: '',
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    categories: ['BA'],
    role_salaries: {},
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

  const handleToggleRoleCategory = (cat) => {
    setFormData(prev => {
      const currentCats = prev.categories || [];
      let updatedCats;
      if (currentCats.includes(cat)) {
        if (currentCats.length === 1) {
          toast.error('Anggota harus memiliki minimal 1 role');
          return prev;
        }
        updatedCats = currentCats.filter(c => c !== cat);
      } else {
        updatedCats = [...currentCats, cat];
      }

      const updatedRoleSalaries = { ...(prev.role_salaries || {}) };
      if (!updatedRoleSalaries[cat]) {
        updatedRoleSalaries[cat] = { amount: '', currency: prev.salary_currency || 'IDR' };
      }

      const sum = updatedCats.reduce((acc, c) => {
        const val = updatedRoleSalaries[c];
        const amt = typeof val === 'object' ? Number(val?.amount || 0) : Number(val || 0);
        return acc + amt;
      }, 0);

      return {
        ...prev,
        categories: updatedCats,
        category: updatedCats.join(', '),
        role_salaries: updatedRoleSalaries,
        monthly_salary: sum > 0 ? sum : ''
      };
    });
  };

  const handleRoleSalaryChange = (catName, field, value) => {
    setFormData(prev => {
      const existingObj = typeof prev.role_salaries?.[catName] === 'object'
        ? prev.role_salaries[catName]
        : { amount: prev.role_salaries?.[catName] || '', currency: prev.salary_currency || 'IDR' };

      const updatedRoleSalaries = {
        ...(prev.role_salaries || {}),
        [catName]: {
          ...existingObj,
          [field]: value
        }
      };

      const sum = (prev.categories || []).reduce((acc, c) => {
        const val = updatedRoleSalaries[c];
        const amt = typeof val === 'object' ? Number(val?.amount || 0) : Number(val || 0);
        return acc + amt;
      }, 0);

      return {
        ...prev,
        role_salaries: updatedRoleSalaries,
        monthly_salary: sum > 0 ? sum : ''
      };
    });
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/finance/members');
      if (response.data.success) {
        setMembers(response.data.data);
      }
    } catch (_) {
      toast.error('Failed to load member directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/internal/finance/members/categories');
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
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
    const isPlayer = (member.member_type || (member.categories?.includes('Player') ? 'Player' : 'Staff')) === 'Player';
    const memberCats = isPlayer
      ? ['Player']
      : (member.categories && member.categories.length > 0
        ? member.categories
        : (member.category ? member.category.split(', ') : [categories[0] || 'BA']));

    const normRoleSalaries = {};
    memberCats.forEach(c => {
      const existing = member.role_salaries?.[c];
      if (existing && typeof existing === 'object') {
        normRoleSalaries[c] = {
          amount: existing.amount !== undefined && existing.amount !== null ? existing.amount : '',
          currency: existing.currency || 'IDR'
        };
      } else if (existing !== undefined && existing !== null) {
        normRoleSalaries[c] = {
          amount: existing,
          currency: member.salary_currency || 'IDR'
        };
      } else {
        normRoleSalaries[c] = {
          amount: memberCats.length === 1 && member.monthly_salary ? member.monthly_salary : '',
          currency: member.salary_currency || 'IDR'
        };
      }
    });

    setFormData({
      full_name: member.full_name,
      member_type: isPlayer ? 'Player' : 'Staff',
      ign_tag: member.ign_tag || member.roblox_username || member.roblox_nickname || '',
      email: member.email || '',
      phone: member.phone || '',
      roblox_username: member.roblox_username || '',
      roblox_nickname: member.roblox_nickname || '',
      tiktok_handle: member.tiktok_handle || '',
      discord_username: member.discord_username || '',
      bank_name: member.bank_name || '',
      bank_account_number: member.bank_account_number || '',
      bank_account_name: member.bank_account_name || '',
      categories: memberCats,
      role_salaries: normRoleSalaries,
      monthly_salary: member.monthly_salary !== undefined && member.monthly_salary !== null ? member.monthly_salary : '',
      salary_currency: member.salary_currency || 'IDR',
      category: memberCats.join(', '),
      status: member.status || 'active',
      joined_date: member.joined_date || new Date().toISOString().split('T')[0]
    });
  };

  const handleResetForm = () => {
    setEditingId(null);
    const initialType = selectedTypeFilter === 'Player' ? 'Player' : 'Staff';
    setFormData({
      full_name: '',
      member_type: initialType,
      ign_tag: '',
      email: '',
      phone: '',
      roblox_username: '',
      roblox_nickname: '',
      tiktok_handle: '',
      discord_username: '',
      bank_name: '',
      bank_account_number: '',
      bank_account_name: '',
      categories: initialType === 'Player' ? ['Player'] : [categories[0] || 'BA'],
      role_salaries: {},
      monthly_salary: '',
      salary_currency: 'IDR',
      category: initialType === 'Player' ? 'Player' : (categories[0] || 'BA'),
      status: 'active',
      joined_date: new Date().toISOString().split('T')[0]
    });
  };

  const handleSelectMemberType = (type) => {
    setFormData(prev => ({
      ...prev,
      member_type: type,
      categories: type === 'Player' ? ['Player'] : [categories[0] || 'BA'],
      category: type === 'Player' ? 'Player' : (categories[0] || 'BA')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categories: formData.member_type === 'Player' ? ['Player'] : formData.categories,
        category: formData.member_type === 'Player' ? 'Player' : (formData.categories || []).join(', ')
      };

      if (editingId) {
        await api.put(`/internal/finance/members/${editingId}`, payload);
        toast.success('Data anggota/pemain diperbarui');
      } else {
        await api.post('/internal/finance/members', payload);
        toast.success('Anggota/pemain baru berhasil ditambahkan');
      }
      handleResetForm();
      fetchMembers();
      if (onMembersUpdated) onMembersUpdated();
    } catch (err) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = async (memberId) => {
    if (!window.confirm('Hapus profil anggota/pemain ini dari direktori?')) return;
    try {
      await api.delete(`/internal/finance/members/${memberId}`);
      toast.success('Profil dihapus');
      fetchMembers();
      if (onMembersUpdated) onMembersUpdated();
    } catch (_) {
      toast.error('Gagal menghapus data');
    }
  };

  // Filter members dynamically
  const filteredMembers = members.filter((m) => {
    // Type Filter
    const mType = m.member_type || (m.categories?.includes('Player') ? 'Player' : 'Staff');
    if (selectedTypeFilter !== 'All' && mType !== selectedTypeFilter) return false;

    // Category Filter
    const matchCat = selectedCategoryFilter === 'All' || m.category?.includes(selectedCategoryFilter);
    if (!matchCat) return false;

    // Status Filter
    const mStatus = m.status || 'active';
    if (statusFilter !== 'All' && mStatus !== statusFilter) return false;

    // Search Filter
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      m.full_name?.toLowerCase().includes(q) ||
      m.ign_tag?.toLowerCase().includes(q) ||
      m.roblox_username?.toLowerCase().includes(q) ||
      m.roblox_nickname?.toLowerCase().includes(q) ||
      m.tiktok_handle?.toLowerCase().includes(q) ||
      m.discord_username?.toLowerCase().includes(q) ||
      m.bank_name?.toLowerCase().includes(q) ||
      m.bank_account_number?.toLowerCase().includes(q) ||
      m.bank_account_name?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.phone?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q)
    );
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Direktori Master Anggota Staff & Pemain Turnamen" maxWidth="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Member Roster List & Realtime Search/Filters */}
        <div className="lg:col-span-7 space-y-4">
          {/* Entity Type Tabs: All | Staff | Players */}
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('All')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all ${
                selectedTypeFilter === 'All'
                  ? 'bg-cyan-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({members.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('Staff')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedTypeFilter === 'Staff'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Staff & Pengurus
            </button>
            <button
              type="button"
              onClick={() => setSelectedTypeFilter('Player')}
              className={`flex-1 py-1.5 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                selectedTypeFilter === 'Player'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> Pemain & Turnamen
            </button>
          </div>

          {/* Search & Config Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, IGN, Discord, Roblox ID, no HP, rekening..."
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

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs text-white px-2.5 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Status</option>
              <option value="active">🟢 Aktif</option>
              <option value="inactive">🔴 Nonaktif</option>
            </select>

            <button
              type="button"
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-cyan-400 hover:text-cyan-300 font-semibold bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all shrink-0"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showCategoryManager ? 'Tutup' : 'Kategori'}</span>
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
              Semua Peran
            </button>
            {categories.map((cat) => {
              const count = members.filter(m => m.category?.includes(cat)).length;
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
              <h5 className="text-xs font-bold text-cyan-300 uppercase">Kategori Kustom Anggota & Pemain</h5>
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
                  placeholder="Kategori baru (contoh: Streamer / Analyst)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-400"
                >
                  Tambah Kategori
                </button>
              </form>
            </div>
          )}

          {/* Filtered Members List */}
          {loading ? (
            <div className="text-xs text-slate-400 p-8 text-center">Memuat direktori...</div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredMembers.map((m) => {
                const isPlayer = (m.member_type || (m.categories?.includes('Player') ? 'Player' : 'Staff')) === 'Player';
                const isActive = (m.status || 'active') === 'active';

                return (
                  <div key={m.id} className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isPlayer ? <Trophy className="w-4 h-4 text-emerald-400 shrink-0" /> : <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />}
                        <span className="font-bold text-white text-sm">{m.full_name}</span>
                        {m.ign_tag && (
                          <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            [{m.ign_tag}]
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${
                          isPlayer
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        }`}>
                          {m.category || m.member_type || 'Staff'}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                          isActive
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isActive ? 'Aktif' : 'Nonaktif / Berhenti'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400">
                        {m.joined_date && (
                          <span className="flex items-center gap-1 text-cyan-300 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Masuk: {m.joined_date}
                          </span>
                        )}
                        {m.monthly_salary > 0 && (
                          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 font-semibold">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Gaji Acuan: {m.salary_currency || 'IDR'} {Number(m.monthly_salary).toLocaleString()}/bln
                          </span>
                        )}
                        {(m.bank_name || m.bank_account_number) && (
                          <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 font-semibold">
                            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                            {m.bank_name ? `${m.bank_name}: ` : ''}{m.bank_account_number}
                            {m.bank_account_name ? ` (a.n ${m.bank_account_name})` : ''}
                          </span>
                        )}
                        {m.discord_username && (
                          <span className="flex items-center gap-1 text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 font-semibold">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Discord: {m.discord_username}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(m)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                        title="Edit Data"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
              Tidak ada data ditemukan cocok dengan pencarian "{searchQuery}".
            </div>
          )}
        </div>

        {/* Right Column: Add/Edit Member Form */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            {editingId ? 'Edit Data Profil' : 'Tambah Anggota / Pemain Baru'}
          </h4>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Entity Type Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Tipe Entitas *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectMemberType('Staff')}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formData.member_type === 'Staff'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Staff / Pengurus
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectMemberType('Player')}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formData.member_type === 'Player'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5" /> Pemain / Player
                </button>
              </div>
            </div>

            {/* Status & Tanggal Masuk Inputs */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-0.5">Status Keanggotaan *</label>
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white font-bold cursor-pointer"
                >
                  <option value="active" className="bg-slate-900 text-emerald-400 font-bold">🟢 Aktif</option>
                  <option value="inactive" className="bg-slate-900 text-rose-400 font-bold">🔴 Nonaktif / Berhenti</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-300 uppercase mb-0.5">Tanggal Masuk *</label>
                <input
                  type="date"
                  required
                  value={formData.joined_date || ''}
                  onChange={(e) => setFormData({ ...formData, joined_date: e.target.value })}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="w-full px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-cyan-300 font-mono font-bold cursor-pointer"
                />
              </div>
            </div>

            {/* PLAYER FORM (Streamlined & Simple) */}
            {formData.member_type === 'Player' ? (
              <div className="space-y-3 p-3 bg-slate-900/60 rounded-2xl border border-emerald-500/30">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Trophy className="w-4 h-4 text-emerald-400" /> Formulir Data Pemain / Tim (Simple)
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">Nama Pemain / Nama Tim *</label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: YeemMKJZT_ID / Team Alpha"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">In-Game Nickname / Tag IGN (Opsional)</label>
                  <input
                    type="text"
                    placeholder="contoh: YeemMKJZT_ID"
                    value={formData.ign_tag}
                    onChange={(e) => setFormData({ ...formData, ign_tag: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Bank Account Details */}
                <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Rekening Pembayaran Hadiah Pemain
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Bank / E-Wallet</label>
                      <input
                        type="text"
                        placeholder="contoh: BCA / Mandiri / DANA"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">No. Rekening</label>
                      <input
                        type="text"
                        placeholder="contoh: 8830192831"
                        value={formData.bank_account_number}
                        onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Nama Pemilik Rekening (a.n)</label>
                    <input
                      type="text"
                      placeholder="contoh: Yeem MKJZT"
                      value={formData.bank_account_name}
                      onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* Discord & Roblox Handles */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-indigo-300 uppercase mb-0.5 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Discord Handle *
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: @iqbalasz"
                      value={formData.discord_username}
                      onChange={(e) => setFormData({ ...formData, discord_username: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-indigo-300 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-cyan-300 uppercase mb-0.5 flex items-center gap-1">
                      <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Roblox Username
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: YeemRoblox"
                      value={formData.roblox_username}
                      onChange={(e) => setFormData({ ...formData, roblox_username: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-cyan-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">WhatsApp / No. Telepon (Opsional)</label>
                  <input
                    type="text"
                    placeholder="contoh: +62 821 1713 3380"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            ) : (
              /* STAFF FORM (Full Komplit) */
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: Alex Tan"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                    Role / Peran Anggota Staff (Multi-Select) *
                  </label>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 border border-slate-700 rounded-xl">
                    {categories.filter(c => c !== 'Player').map((c) => {
                      const isSelected = (formData.categories || []).includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleToggleRoleCategory(c)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                            isSelected
                              ? 'bg-purple-500 text-white border-purple-400 shadow-md'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Per-Role Salary Benchmark */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/30 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> Honor Acuan Per-Role (Staff)
                    </span>
                    {formData.monthly_salary > 0 && (
                      <span className="text-[10px] text-emerald-300 font-mono">
                        Total: {formData.salary_currency || 'IDR'} {Number(formData.monthly_salary).toLocaleString()}
                      </span>
                    )}
                  </span>

                  <div className="space-y-1.5">
                    {(formData.categories || []).map((cat) => {
                      const roleSal = formData.role_salaries?.[cat] || {};
                      const amountVal = typeof roleSal === 'object' ? roleSal.amount : roleSal;
                      const currVal = typeof roleSal === 'object' ? roleSal.currency || 'IDR' : 'IDR';

                      return (
                        <div key={cat} className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                          <span className="w-20 text-[10px] font-bold text-cyan-300 truncate shrink-0">{cat}</span>
                          <div className="flex-1 min-w-0 flex items-center gap-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Nominal Honor"
                              value={amountVal !== undefined && amountVal !== null ? amountVal : ''}
                              onChange={(e) => handleRoleSalaryChange(cat, 'amount', e.target.value)}
                              className="flex-1 min-w-0 px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-emerald-300 font-semibold focus:outline-none focus:border-cyan-500"
                            />
                            <select
                              value={currVal}
                              onChange={(e) => handleRoleSalaryChange(cat, 'currency', e.target.value)}
                              className="w-14 shrink-0 px-1 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] text-white font-bold focus:outline-none focus:border-cyan-500 text-center"
                            >
                              <option value="IDR">IDR</option>
                              <option value="SGD">SGD</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase block flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Informasi Rekening / Bank
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Nama Bank</label>
                      <input
                        type="text"
                        placeholder="contoh: BCA / Mandiri"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">No. Rekening</label>
                      <input
                        type="text"
                        placeholder="contoh: 8830192831"
                        value={formData.bank_account_number}
                        onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Nama Pemilik Rekening (a.n)</label>
                    <input
                      type="text"
                      placeholder="contoh: Alex Tan"
                      value={formData.bank_account_name}
                      onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                {/* Social Handles including Discord */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase block">Roblox, Discord & TikTok</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-indigo-300 uppercase mb-0.5 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-indigo-400" /> Discord Handle *
                      </label>
                      <input
                        type="text"
                        placeholder="contoh: @brenda_discord"
                        value={formData.discord_username}
                        onChange={(e) => setFormData({ ...formData, discord_username: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-indigo-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Roblox Username</label>
                      <input
                        type="text"
                        placeholder="contoh: AlexRoblox"
                        value={formData.roblox_username}
                        onChange={(e) => setFormData({ ...formData, roblox_username: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Roblox Nickname</label>
                      <input
                        type="text"
                        placeholder="contoh: Alex_Pro"
                        value={formData.roblox_nickname}
                        onChange={(e) => setFormData({ ...formData, roblox_nickname: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">TikTok Handle</label>
                      <input
                        type="text"
                        placeholder="contoh: @alextan"
                        value={formData.tiktok_handle}
                        onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                      />
                    </div>
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
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">No. Telepon (Opsional)</label>
                    <input
                      type="text"
                      placeholder="+65 9123 4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  {t('cancel')}
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-400 shadow-md glow-cyan"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah ke Direktori'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
