import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Settings, Save, RefreshCw, DollarSign, Wallet, Plus, Trash2, Tag, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const { t } = useTranslation();

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

  useEffect(() => {
    fetchSettings();
    fetchAllCategories();
  }, []);

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
        </div>
      </main>
    </div>
  );
};
