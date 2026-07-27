import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Plus, Trash2, Edit, TrendingDown, Search, Filter, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const ExpensePage = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState(['Equipment', 'Logistics', 'Server/Domain', 'Refreshments', 'Operations', 'Event Prize Payout', 'Marketing', 'Other Expense']);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [datePeriod, setDatePeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    category: 'Pembuatan Map',
    description: '',
    amount: '',
    currency: 'IDR',
    related_event_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchEvents();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/internal/finance/expenses/categories');
      if (response.data.success && response.data.data?.length > 0) {
        setCategories(response.data.data);
        setFormData(prev => ({
          ...prev,
          category: prev.category && response.data.data.includes(prev.category) ? prev.category : response.data.data[0]
        }));
      }
    } catch (_) {}
  };

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/finance/expenses');
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (_) {
      toast.error('Failed to load expense records');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await api.get('/public/events');
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (_) {}
  };

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        transaction_date: expense.transaction_date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency || 'IDR',
        related_event_id: expense.related_event_id || '',
        notes: expense.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        transaction_date: new Date().toISOString().split('T')[0],
        category: categories[0] || 'Pembuatan Map',
        description: '',
        amount: '',
        currency: 'IDR',
        related_event_id: '',
        notes: ''
      });
      api.get('/internal/admin/settings').then(res => {
        if (res.data?.data?.default_currency) {
          setFormData(prev => ({ ...prev, currency: res.data.data.default_currency }));
        }
      }).catch(() => {});
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/internal/finance/expenses/${editingId}`, formData);
        toast.success('Pengeluaran diperbarui');
      } else {
        await api.post('/internal/finance/expenses', formData);
        toast.success('Pengeluaran baru dicatat');
      }
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pencatatan pengeluaran ini?')) return;
    try {
      await api.delete(`/internal/finance/expenses/${id}`);
      toast.success('Pengeluaran dihapus');
      fetchExpenses();
    } catch (_) {
      toast.error('Gagal menghapus pengeluaran');
    }
  };

  // Filter logic
  const filteredExpenses = expenses.filter(item => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchCategory = (item.category || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCategory && !matchNotes) return false;
    }

    // Category filter
    if (categoryFilter && item.category !== categoryFilter) return false;

    // Date Period filter
    const itemDate = item.transaction_date || (item.created_at ? item.created_at.split('T')[0] : '');
    if (!itemDate) return true;

    const now = new Date();
    if (datePeriod === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      if (itemDate !== todayStr) return false;
    } else if (datePeriod === 'month') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const startM = `${y}-${m}-01`;
      const endM = new Date(y, now.getMonth() + 1, 0).toISOString().split('T')[0];
      if (itemDate < startM || itemDate > endM) return false;
    } else if (datePeriod === 'year') {
      const y = now.getFullYear();
      if (itemDate < `${y}-01-01` || itemDate > `${y}-12-31`) return false;
    } else if (datePeriod === 'custom') {
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
    }

    return true;
  });

  const columns = [
    { header: t('date'), accessor: 'transaction_date' },
    {
      header: t('category'),
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
          {row.category}
        </span>
      )
    },
    { header: t('description'), accessor: 'description', cellClassName: 'font-semibold text-white' },
    {
      header: t('related_event'),
      render: (row) => {
        const ev = events.find(e => e.id === Number(row.related_event_id));
        return ev ? <span className="text-xs text-cyan-400 font-semibold">{ev.title}</span> : <span className="text-xs text-slate-500">None</span>;
      }
    },
    {
      header: `${t('amount')} (${t('currency')})`,
      render: (row) => (
        <span className="font-bold text-white font-mono">
          {row.currency || 'IDR'} {Number(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Konversi Base (IDR)',
      render: (row) => (
        <span className="font-extrabold text-rose-400 font-mono">
          IDR {Number(row.base_amount_idr || row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
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
              <TrendingDown className="w-7 h-7 text-rose-400" />
              {t('expenses')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Pencatatan pengeluaran operasional AG School & logistik acara</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold text-sm shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('record_expense')}
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="glass-panel p-4 rounded-2xl mb-6 border border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi pengeluaran / catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs font-bold">
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-medium"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              <select
                value={datePeriod}
                onChange={(e) => setDatePeriod(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-medium"
              >
                <option value="all">Semua Tanggal</option>
                <option value="today">Hari Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
                <option value="custom">Rentang Tanggal Custom</option>
              </select>
            </div>

            {datePeriod === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
                <span className="text-xs text-slate-500">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>
        </div>

        <Table columns={columns} data={filteredExpenses} loading={loading} emptyMessage="Tidak ada data pengeluaran ditemukan." />

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Catatan Pengeluaran' : t('record_expense')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('date')} *</label>
              <input
                type="date"
                required
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('category')} *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {Array.from(new Set([...categories, formData.category])).filter(Boolean).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('description')} *</label>
              <input
                type="text"
                required
                placeholder="contoh: Pembelian Peralatan Stream / Pembuatan Map"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('currency')}</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                >
                  <option value="IDR">IDR</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('related_event')}</label>
              <select
                value={formData.related_event_id}
                onChange={(e) => setFormData({ ...formData, related_event_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Tidak Terkait Acara Manapun --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('notes')}</label>
              <textarea
                rows="2"
                placeholder="Catatan tambahan (opsional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-bold shadow-lg transition-all"
              >
                {editingId ? t('save') : t('add')}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
