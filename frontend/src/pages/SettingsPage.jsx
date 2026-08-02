import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Modal } from '../components/common/Modal';
import { Settings, Save, RefreshCw, DollarSign, Wallet, Plus, Trash2, Tag, TrendingUp, TrendingDown, Users, Lock, Key, ShieldCheck, UserPlus, UserCheck, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role_slug === 'administrator' || currentUser.role_id === 1;

  const [settings, setSettings] = useState({
    org_name: 'AG School',
    contact_email: 'contact@agschool.com',
    initial_balance_idr: '0',
    default_language: 'id',
    default_currency: 'IDR',
    exchange_rate_mode: 'manual',
    exchange_rate_sgd_idr: '11800.00',
    auto_sync_interval_hours: '24'
  });

  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [paymentCategories, setPaymentCategories] = useState([]);
  const [memberCategories, setMemberCategories] = useState([]);

  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newPaymentCat, setNewPaymentCat] = useState('');
  const [newMemberCat, setNewMemberCat] = useState('');

  const [rateInfo, setRateInfo] = useState(null);
  const [calcAmount, setCalcAmount] = useState('100');
  const [calcCurrency, setCalcCurrency] = useState('SGD');
  const [syncing, setSyncing] = useState(false);
  const [loading, setLoading] = useState(true);

  // User Management & Password States
  const [usersList, setUsersList] = useState([]);
  const [selfPasswordForm, setSelfPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });

  // Reset User Password Modal State
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [targetNewPassword, setTargetNewPassword] = useState('');

  // Create New User Modal State
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: '', full_name: '', email: '', password: '', role_id: '2' });

  useEffect(() => {
    fetchSettings();
    fetchAllCategories();
    if (isAdmin) fetchUsersList();
  }, []);

  const fetchUsersList = async () => {
    try {
      const res = await api.get('/internal/admin/users');
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (_) {}
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/admin/settings');
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...response.data.data }));
        if (response.data.data.rate_info) {
          setRateInfo(response.data.data.rate_info);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memuat pengaturan sistem');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCategories = async () => {
    try {
      const [incRes, expRes, payRes, memRes] = await Promise.all([
        api.get('/internal/finance/incomes/categories'),
        api.get('/internal/finance/expenses/categories'),
        api.get('/internal/finance/payments/categories'),
        api.get('/internal/finance/members/categories')
      ]);

      if (incRes.data.success) setIncomeCategories(incRes.data.data);
      if (expRes.data.success) setExpenseCategories(expRes.data.data);
      if (payRes.data.success) setPaymentCategories(payRes.data.data);
      if (memRes.data.success) setMemberCategories(memRes.data.data);
    } catch (_) {}
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.post('/internal/admin/settings', settings);
      toast.success('Pengaturan sistem berhasil disimpan');
      fetchSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    }
  };

  const handleSyncRateNow = async () => {
    setSyncing(true);
    try {
      const response = await api.post('/internal/admin/settings/sync-rate');
      if (response.data.success) {
        toast.success(response.data.data.message || 'Kurs berhasil diperbarui');
        fetchSettings();
      } else {
        toast.error('Gagal memperbarui kurs');
      }
    } catch (_) {
      toast.error('Gagal memicu sinkronisasi kurs');
    } finally {
      setSyncing(false);
    }
  };

  // Password & User Handlers
  const handleSelfChangePassword = async (e) => {
    e.preventDefault();
    if (selfPasswordForm.new_password !== selfPasswordForm.confirm_password) {
      toast.error('Konfirmasi password baru tidak cocok');
      return;
    }
    if (selfPasswordForm.new_password.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    try {
      const res = await api.put('/auth/change-password', {
        current_password: selfPasswordForm.current_password,
        new_password: selfPasswordForm.new_password
      });
      toast.success(res.data.message || 'Password Anda berhasil diperbarui!');
      setSelfPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah password');
    }
  };

  const handleResetUserPassword = async (e) => {
    e.preventDefault();
    if (!targetNewPassword || targetNewPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    try {
      const res = await api.put(`/internal/admin/users/${targetUser.id}/password`, {
        new_password: targetNewPassword
      });
      toast.success(res.data.message || `Password user ${targetUser.username} berhasil diperbarui!`);
      setResetModalOpen(false);
      setTargetUser(null);
      setTargetNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mereset password user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.username || !newUserForm.password) {
      toast.error('Username dan Password wajib diisi');
      return;
    }
    try {
      const res = await api.post('/internal/admin/users', newUserForm);
      if (res.data.success) {
        toast.success(`User ${newUserForm.username} berhasil dibuat!`);
        setCreateUserModalOpen(false);
        setNewUserForm({ username: '', full_name: '', email: '', password: '', role_id: '2' });
        fetchUsersList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membuat user baru');
    }
  };

  const handleToggleUserStatus = async (userItem) => {
    const newStatus = userItem.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/internal/admin/users/${userItem.id}/status`, { status: newStatus });
      toast.success(`Status ${userItem.username} diubah menjadi ${newStatus}`);
      fetchUsersList();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status user');
    }
  };

  // Category Save Handlers
  const saveCategoryList = async (endpoint, categoriesArray, typeName) => {
    try {
      await api.post(endpoint, { categories: categoriesArray });
      toast.success(`Kategori ${typeName} diperbarui`);
      fetchAllCategories();
    } catch (_) {
      toast.error(`Gagal memperbarui kategori ${typeName}`);
    }
  };

  const addCategoryItem = (currentList, newItem, setInput, endpoint, typeName) => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (currentList.includes(trimmed)) {
      toast.error('Kategori sudah ada dalam daftar');
      return;
    }
    const updated = [...currentList, trimmed];
    saveCategoryList(endpoint, updated, typeName);
    setInput('');
  };

  const removeCategoryItem = (currentList, targetItem, endpoint, typeName) => {
    if (currentList.length <= 1) {
      toast.error('Minimal harus ada 1 kategori');
      return;
    }
    const updated = currentList.filter(item => item !== targetItem);
    saveCategoryList(endpoint, updated, typeName);
  };

  const currentRate = Number(settings.exchange_rate_sgd_idr || 11800);
  const convertedPreview = calcCurrency === 'SGD'
    ? (Number(calcAmount || 0) * currentRate).toLocaleString(undefined, { minimumFractionDigits: 2 })
    : (Number(calcAmount || 0) / currentRate).toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 sm:p-8 lg:p-10 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <Settings className="w-7 h-7 text-cyan-400" />
              {t('settings')} & Konfigurasi Sistem
            </h1>
            <p className="text-xs text-slate-400 mt-1">Kelola Profil Organisasi, Saldo Awal, Kategori Keuangan, dan Kurs Nilai Tukar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Settings Form */}
          <form onSubmit={handleSaveSettings} className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800">
            <h3 className="text-lg font-bold text-white mb-2">Parameter Sistem Utama</h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Organisasi</label>
              <input
                type="text"
                required
                value={settings.org_name || ''}
                onChange={(e) => setSettings({ ...settings, org_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email Kontak</label>
              <input
                type="email"
                required
                value={settings.contact_email || ''}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Saldo Kas Awal Sistem (IDR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={settings.initial_balance_idr || '0'}
                onChange={(e) => setSettings({ ...settings, initial_balance_idr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mata Uang Default</label>
                <select
                  value={settings.default_currency || 'IDR'}
                  onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="SGD">SGD (Dollar Singapura)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Mode Nilai Tukar</label>
                <select
                  value={settings.exchange_rate_mode || 'manual'}
                  onChange={(e) => setSettings({ ...settings, exchange_rate_mode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="manual">Manual Input</option>
                  <option value="auto">Auto ExchangeRate-API</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Nilai Kurs SGD ke IDR
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                value={settings.exchange_rate_sgd_idr || '11800.00'}
                onChange={(e) => setSettings({ ...settings, exchange_rate_sgd_idr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg glow-cyan transition-all"
              >
                <Save className="w-4 h-4" />
                {t('save_settings')}
              </button>
            </div>
          </form>

          {/* Currency Converter Preview */}
          <div className="glass-panel p-8 rounded-3xl space-y-6 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Kalkulator Konversi Mata Uang</h3>
                  <p className="text-xs text-slate-400">Pengujian instan berdasarkan kurs aktif</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('amount')}</label>
                    <input
                      type="number"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('currency')}</label>
                    <select
                      value={calcCurrency}
                      onChange={(e) => setCalcCurrency(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-cyan-400 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="SGD">SGD</option>
                      <option value="IDR">IDR</option>
                    </select>
                  </div>
                </div>

                <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">
                    Hasil Konversi ({calcCurrency === 'SGD' ? 'IDR' : 'SGD'})
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-400">
                    {calcCurrency === 'SGD' ? `IDR ${convertedPreview}` : `SGD ${convertedPreview}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-6 border-t border-slate-800 flex items-center justify-between">
              <span>Active Rate: 1 SGD = {currentRate.toLocaleString()} IDR</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold uppercase text-[10px]">
                {settings.exchange_rate_mode} Mode
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Category Management Panel Section */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kelola Kategori Keuangan & Anggota</h3>
              <p className="text-xs text-slate-400">Tambah, hapus, atau atur daftar kategori operasional pendapatan, pengeluaran, pembayaran staff, dan anggota</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Operational Income Categories */}
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> Kategori Pendapatan Operasional
                </h4>
                <span className="text-[10px] text-slate-400">{incomeCategories.length} Kategori</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kategori pendapatan baru..."
                  value={newIncomeCat}
                  onChange={(e) => setNewIncomeCat(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => addCategoryItem(incomeCategories, newIncomeCat, setNewIncomeCat, '/internal/finance/incomes/categories', 'Pendapatan')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {incomeCategories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategoryItem(incomeCategories, cat, '/internal/finance/incomes/categories', 'Pendapatan')}
                      className="text-slate-400 hover:text-rose-400 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Operational Expense Categories */}
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" /> Kategori Pengeluaran Operasional
                </h4>
                <span className="text-[10px] text-slate-400">{expenseCategories.length} Kategori</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kategori pengeluaran baru..."
                  value={newExpenseCat}
                  onChange={(e) => setNewExpenseCat(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => addCategoryItem(expenseCategories, newExpenseCat, setNewExpenseCat, '/internal/finance/expenses/categories', 'Pengeluaran')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {expenseCategories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-medium">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategoryItem(expenseCategories, cat, '/internal/finance/expenses/categories', 'Pengeluaran')}
                      className="text-slate-400 hover:text-rose-400 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Staff Payment Categories */}
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Kategori Pembayaran Staff
                </h4>
                <span className="text-[10px] text-slate-400">{paymentCategories.length} Kategori</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Kategori pembayaran staff baru..."
                  value={newPaymentCat}
                  onChange={(e) => setNewPaymentCat(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => addCategoryItem(paymentCategories, newPaymentCat, setNewPaymentCat, '/internal/finance/payments/categories', 'Pembayaran Staff')}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {paymentCategories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-medium">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategoryItem(paymentCategories, cat, '/internal/finance/payments/categories', 'Pembayaran Staff')}
                      className="text-slate-400 hover:text-rose-400 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Staff Member Roles/Categories */}
            <div className="p-5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Peran / Kategori Anggota Staff
                </h4>
                <span className="text-[10px] text-slate-400">{memberCategories.length} Kategori</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Role / kategori anggota baru..."
                  value={newMemberCat}
                  onChange={(e) => setNewMemberCat(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => addCategoryItem(memberCategories, newMemberCat, setNewMemberCat, '/internal/finance/members/categories', 'Anggota Staff')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {memberCategories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-medium">
                    {cat}
                    <button
                      type="button"
                      onClick={() => removeCategoryItem(memberCategories, cat, '/internal/finance/members/categories', 'Anggota Staff')}
                      className="text-slate-400 hover:text-rose-400 font-bold"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* User Management & Password Section */}
          <div className="space-y-6 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-cyan-400" /> Keamanan, Password & Hak Akses User
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Self Password Change Panel */}
              <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase">
                  <Key className="w-4 h-4 text-cyan-400" /> Ganti Password Akun Saya
                </div>
                <form onSubmit={handleSelfChangePassword} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Password Saat Ini</label>
                    <input
                      type="password"
                      required
                      value={selfPasswordForm.current_password}
                      onChange={(e) => setSelfPasswordForm({ ...selfPasswordForm, current_password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Password Baru (Min 6 Karakter)</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={selfPasswordForm.new_password}
                      onChange={(e) => setSelfPasswordForm({ ...selfPasswordForm, new_password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={selfPasswordForm.confirm_password}
                      onChange={(e) => setSelfPasswordForm({ ...selfPasswordForm, confirm_password: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Simpan Password Baru
                  </button>
                </form>
              </div>

              {/* Admin User Management & Password Reset Panel */}
              <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" /> Kelola Pengguna & Reset Password User
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Daftar akun administrator, divisi keuangan, dan sekretaris</p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setCreateUserModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> + Tambah User Baru
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                        <th className="py-2 px-3">User</th>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Aksi Password</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {usersList.map((u) => {
                        const isSelf = u.id === currentUser.id;
                        const roleColor = u.role_slug === 'administrator' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' : (u.role_slug === 'finance' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-purple-400 bg-purple-500/10 border-purple-500/30');

                        return (
                          <tr key={u.id} className="hover:bg-slate-900/50">
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {u.full_name || u.username}
                                {isSelf && <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">(Saya)</span>}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">{u.username} • {u.email}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full border ${roleColor}`}>
                                {u.role_slug || 'user'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <button
                                type="button"
                                disabled={isSelf || !isAdmin}
                                onClick={() => handleToggleUserStatus(u)}
                                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border transition-all ${
                                  u.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                                } ${isSelf || !isAdmin ? 'opacity-60 cursor-not-allowed' : ''}`}
                              >
                                {u.status === 'active' ? '🟢 Aktif' : '🔴 Nonaktif'}
                              </button>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isAdmin ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTargetUser(u);
                                    setTargetNewPassword('');
                                    setResetModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ml-auto"
                                >
                                  <Key className="w-3 h-3 text-amber-400" /> Ganti / Reset Password
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-500">Khusus Admin</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Reset Password User */}
          <Modal
            isOpen={resetModalOpen}
            onClose={() => setResetModalOpen(false)}
            title={`Ganti / Reset Password User: ${targetUser?.username || ''}`}
          >
            <form onSubmit={handleResetUserPassword} className="space-y-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-200">
                Anda akan mengganti password untuk akun <strong>{targetUser?.full_name} ({targetUser?.username})</strong>.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password Baru (Min 6 Karakter) *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={targetNewPassword}
                  onChange={(e) => setTargetNewPassword(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> Simpan Password Baru
                </button>
              </div>
            </form>
          </Modal>

          {/* Modal Tambah User Baru */}
          <Modal
            isOpen={createUserModalOpen}
            onClose={() => setCreateUserModalOpen(false)}
            title="Tambah Akun Pengguna Baru"
          >
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.full_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Role / Peran *</label>
                <select
                  value={newUserForm.role_id}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="1">Administrator</option>
                  <option value="2">Finance / Keuangan</option>
                  <option value="3">Secretary / Sekretaris</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Buat Akun User
                </button>
              </div>
            </form>
          </Modal>
        </div>
      </main>
    </div>
  );
};
