import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Users, Plus, Trash2, Edit, UserCheck, Settings, X, Gamepad2, Video, Search, Filter, Phone, Mail, DollarSign, CreditCard, MessageSquare, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const MemberPage = () => {
  const { t } = useTranslation();
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState(['BA', 'Caster', 'Maintainer', 'Secretary', 'Staff', 'Content Creator', 'Player']);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

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
    fetchMembers();
    fetchCategories();
  }, []);

  const handleToggleRoleCategory = (cat) => {
    setFormData(prev => {
      const currentCats = prev.categories || [];
      let updatedCats;
      if (currentCats.includes(cat)) {
        if (currentCats.length === 1) {
          toast.error('Anggota/Pemain harus memiliki minimal 1 role');
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
      toast.error('Gagal memuat direktori penerima');
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
      return toast.error('Kategori sudah ada');
    }
    const updatedCategories = [...categories, catName];
    try {
      await api.post('/internal/finance/members/categories', { categories: updatedCategories });
      setCategories(updatedCategories);
      setNewCategoryName('');
      toast.success(`Kategori "${catName}" ditambahkan`);
    } catch (_) {
      toast.error('Gagal menyimpan kategori');
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    if (categories.length <= 1) {
      return toast.error('Minimal 1 kategori harus tersisa');
    }
    if (!window.confirm(`Hapus kategori "${catToDelete}"?`)) return;
    const updatedCategories = categories.filter(c => c !== catToDelete);
    try {
      await api.post('/internal/finance/members/categories', { categories: updatedCategories });
      setCategories(updatedCategories);
      if (selectedCategoryFilter === catToDelete) {
        setSelectedCategoryFilter('All');
      }
      toast.success(`Kategori "${catToDelete}" dihapus`);
    } catch (_) {
      toast.error('Gagal menghapus kategori');
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingId(member.id);
      const memberCats = member.categories && member.categories.length > 0
        ? member.categories
        : (member.category ? member.category.split(', ') : [categories[0] || 'BA']);

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
        member_type: member.member_type || (member.categories?.includes('Player') ? 'Player' : 'Staff'),
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
    } else {
      setEditingId(null);
      setFormData({
        full_name: '',
        member_type: selectedTypeFilter === 'Player' ? 'Player' : 'Staff',
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
        categories: [categories[0] || 'BA'],
        role_salaries: {},
        monthly_salary: '',
        salary_currency: 'IDR',
        category: categories[0] || 'BA',
        status: 'active',
        joined_date: new Date().toISOString().split('T')[0]
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/internal/finance/members/${editingId}`, formData);
        toast.success('Data anggota/pemain diperbarui');
      } else {
        await api.post('/internal/finance/members', formData);
        toast.success('Anggota/pemain baru berhasil ditambahkan');
      }
      setModalOpen(false);
      fetchMembers();
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

  const columns = [
    {
      header: 'Nama & In-Game Tag',
      render: (row) => {
        const isPlayer = (row.member_type || (row.categories?.includes('Player') ? 'Player' : 'Staff')) === 'Player';
        return (
          <div className="flex items-center gap-2">
            {isPlayer ? <Trophy className="w-4 h-4 text-emerald-400 shrink-0" /> : <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />}
            <div>
              <div className="font-bold text-white text-sm">{row.full_name}</div>
              {row.ign_tag && <div className="text-xs text-emerald-300 font-mono">[{row.ign_tag}]</div>}
            </div>
          </div>
        );
      }
    },
    {
      header: 'Tipe & Peran',
      render: (row) => {
        const isPlayer = (row.member_type || (row.categories?.includes('Player') ? 'Player' : 'Staff')) === 'Player';
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${
              isPlayer
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }`}>
              {row.member_type || 'Staff'}
            </span>
            <span className="text-xs text-slate-300 font-semibold">{row.category}</span>
          </div>
        );
      }
    },
    {
      header: 'Informasi Rekening Bank',
      render: (row) => (
        (row.bank_name || row.bank_account_number) ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-bold text-xs border border-amber-500/20">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            {row.bank_name ? `${row.bank_name}: ` : ''}{row.bank_account_number}
            {row.bank_account_name ? ` (a.n ${row.bank_account_name})` : ''}
          </span>
        ) : <span className="text-xs text-slate-500">Belum Diisi</span>
      )
    },
    {
      header: 'Kontak & Sosmed',
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {row.roblox_username && (
            <span className="text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Roblox: @{row.roblox_username}
            </span>
          )}
          {row.discord_username && (
            <span className="text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {row.discord_username}
            </span>
          )}
          {row.phone && <span className="text-slate-300">{row.phone}</span>}
        </div>
      )
    },
    {
      header: t('actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 sm:p-8 lg:p-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-cyan-400" />
              Direktori Pemain & Staff
            </h1>
            <p className="text-xs text-slate-400 mt-1">Master database terpadu untuk pengurus, staff, dan pemain turnamen esport AG School</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            Tambah Data Baru
          </button>
        </div>

        {/* Entity Type Tabs: All | Staff | Players */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6 max-w-md">
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('All')}
            className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition-all ${
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
            className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedTypeFilter === 'Staff'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> Staff & Pengurus
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter('Player')}
            className={`flex-1 py-2 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              selectedTypeFilter === 'Player'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" /> Pemain & Turnamen
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="glass-panel p-4 rounded-2xl mb-6 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, IGN, Roblox ID, no HP, rekening bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700/80">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-semibold cursor-pointer pr-1"
              >
                <option value="All" className="bg-slate-900 text-white">Semua Kategori/Role</option>
                {categories.map(c => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs text-cyan-400 font-semibold bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/40 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showCategoryManager ? 'Tutup Kategori' : 'Kelola Kategori'}</span>
            </button>
          </div>
        </div>

        {/* Category Manager Sub Panel */}
        {showCategoryManager && (
          <div className="glass-panel p-4 rounded-2xl mb-6 border border-cyan-500/30 space-y-3">
            <h5 className="text-xs font-bold text-cyan-300 uppercase">Kelola Kategori Peran Kustom</h5>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 text-slate-200 text-xs font-semibold border border-slate-700">
                  <span>{cat}</span>
                  <button type="button" onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-rose-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 max-w-md pt-2">
              <input
                type="text"
                placeholder="Nama Kategori Baru (contoh: Streamer / Analyst)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
              />
              <button type="submit" className="px-3 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-400">
                Tambah Kategori
              </button>
            </form>
          </div>
        )}

        <Table columns={columns} data={filteredMembers} loading={loading} emptyMessage="Tidak ada data anggota atau pemain ditemukan." />

        {/* Add/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Data Profil' : 'Tambah Anggota / Pemain Baru'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tipe Entitas *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, member_type: 'Staff' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formData.member_type === 'Staff'
                      ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" /> Staff / Pengurus
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, member_type: 'Player' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    formData.member_type === 'Player'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4" /> Pemain / Player
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Lengkap / Nama Tim *</label>
              <input
                type="text"
                required
                placeholder="contoh: YeemMKJZT_ID / Alex Tan"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">In-Game Nickname / Tag IGN (Opsional)</label>
              <input
                type="text"
                placeholder="contoh: YeemMKJZT_ID"
                value={formData.ign_tag}
                onChange={(e) => setFormData({ ...formData, ign_tag: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-emerald-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Role / Peran *</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 border border-slate-700 rounded-xl">
                {categories.map((c) => {
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

            <div className="p-3 bg-slate-900/80 rounded-xl border border-amber-500/30 space-y-2.5">
              <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> Informasi Rekening Bank / E-Wallet
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Nama Bank</label>
                  <input
                    type="text"
                    placeholder="BCA / Mandiri / DANA"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-amber-300 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-0.5">No. Rekening</label>
                  <input
                    type="text"
                    placeholder="8830192831"
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
                  placeholder="Nama Pemilik Rekening"
                  value={formData.bank_account_name}
                  onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-md glow-cyan"
              >
                {editingId ? 'Simpan Perubahan' : 'Tambah ke Direktori'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
