import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Plus, Trash2, Edit, TrendingDown, Search, Filter, Calendar, CheckCircle2, Clock, XCircle, Tag, UserCheck, UserPlus, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const ExpensePage = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [directoryMembers, setDirectoryMembers] = useState([]);
  const [categories, setCategories] = useState(['Equipment', 'Logistics', 'Server/Domain', 'Refreshments', 'Operations', 'Event Prize Payout', 'Marketing', 'Other Expense']);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [datePeriod, setDatePeriod] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Inline Recipient Auto-Save State
  const [saveRecipientToDirectory, setSaveRecipientToDirectory] = useState(false);
  const [newRecipientType, setNewRecipientType] = useState('Player');
  const [newRecipientBank, setNewRecipientBank] = useState('');
  const [newRecipientAccount, setNewRecipientAccount] = useState('');

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    category: 'Pembuatan Map',
    description: '',
    amount: '',
    currency: 'IDR',
    payment_status: 'Paid',
    related_event_id: '',
    recipient_member_id: '',
    recipient_name: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchEvents();
    fetchCategories();
    fetchDirectoryMembers();
  }, []);

  const fetchDirectoryMembers = async () => {
    try {
      const response = await api.get('/internal/finance/members');
      if (response.data.success) {
        setDirectoryMembers(response.data.data);
      }
    } catch (_) {}
  };

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

  const handleSelectRecipient = (memberId) => {
    if (!memberId) {
      setFormData(prev => ({ ...prev, recipient_member_id: '', recipient_name: '' }));
      return;
    }
    const m = directoryMembers.find(item => item.id === Number(memberId));
    if (m) {
      const name = m.ign_tag || m.roblox_username || m.full_name;
      setFormData(prev => ({
        ...prev,
        recipient_member_id: m.id,
        recipient_name: name,
        notes: m.bank_account_number
          ? (prev.notes ? `${prev.notes} (Rek: ${m.bank_name} ${m.bank_account_number})` : `Rek: ${m.bank_name} ${m.bank_account_number} a.n ${m.bank_account_name || name}`)
          : prev.notes
      }));
    }
  };

  const handleOpenModal = (expense = null) => {
    setSaveRecipientToDirectory(false);
    setNewRecipientBank('');
    setNewRecipientAccount('');
    setNewRecipientType('Player');

    if (expense) {
      setEditingId(expense.id);
      setFormData({
        transaction_date: expense.transaction_date,
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency || 'IDR',
        payment_status: expense.payment_status || 'Paid',
        related_event_id: expense.related_event_id || '',
        recipient_member_id: expense.recipient_member_id || '',
        recipient_name: expense.recipient_name || '',
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
        payment_status: 'Paid',
        related_event_id: '',
        recipient_member_id: '',
        recipient_name: '',
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
      let finalMemberId = formData.recipient_member_id;

      // Inline Save New Recipient to Directory
      if (saveRecipientToDirectory && formData.recipient_name.trim()) {
        try {
          const res = await api.post('/internal/finance/members', {
            full_name: formData.recipient_name.trim(),
            member_type: newRecipientType,
            ign_tag: formData.recipient_name.trim(),
            bank_name: newRecipientBank,
            bank_account_number: newRecipientAccount,
            bank_account_name: formData.recipient_name.trim(),
            categories: [newRecipientType]
          });
          if (res.data.success && res.data.data?.id) {
            finalMemberId = res.data.data.id;
            toast.success(`Penerima "${formData.recipient_name}" langsung tersimpan ke Direktori!`);
            fetchDirectoryMembers();
          }
        } catch (_) {}
      }

      const payload = {
        ...formData,
        recipient_member_id: finalMemberId ? Number(finalMemberId) : null
      };

      if (editingId) {
        await api.put(`/internal/finance/expenses/${editingId}`, payload);
        toast.success('Pengeluaran diperbarui');
      } else {
        await api.post('/internal/finance/expenses', payload);
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
      const matchRecipient = (item.recipient_name || '').toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      if (!matchDesc && !matchCategory && !matchRecipient && !matchNotes) return false;
    }

    // Category filter
    if (categoryFilter && item.category !== categoryFilter) return false;

    // Status filter
    const status = item.payment_status || 'Paid';
    if (statusFilter && status !== statusFilter) return false;

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
    } else if (datePeriod === 'month_select') {
      if (selectedMonth && !itemDate.startsWith(selectedMonth)) return false;
    } else if (datePeriod === 'year') {
      const y = now.getFullYear();
      if (itemDate < `${y}-01-01` || itemDate > `${y}-12-31`) return false;
    } else if (datePeriod === 'custom') {
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
    }

    return true;
  });

  // Computed Totals based on Filtered Expenses
  const totalFilteredBaseIDR = filteredExpenses.reduce((sum, item) => sum + Number(item.base_amount_idr || item.amount || 0), 0);

  const totalPaidBaseIDR = filteredExpenses
    .filter(item => (!item.payment_status || item.payment_status === 'Paid'))
    .reduce((sum, item) => sum + Number(item.base_amount_idr || item.amount || 0), 0);

  const totalUnpaidBaseIDR = filteredExpenses
    .filter(item => item.payment_status === 'Unpaid')
    .reduce((sum, item) => sum + Number(item.base_amount_idr || item.amount || 0), 0);

  const totalCancelledBaseIDR = filteredExpenses
    .filter(item => item.payment_status === 'Cancelled')
    .reduce((sum, item) => sum + Number(item.base_amount_idr || item.amount || 0), 0);

  // Grouped Category Breakdown
  const categoryBreakdown = filteredExpenses.reduce((acc, item) => {
    const cat = item.category || 'Lainnya';
    const amt = Number(item.base_amount_idr || item.amount || 0);
    if (!acc[cat]) {
      acc[cat] = { count: 0, totalIDR: 0 };
    }
    acc[cat].count += 1;
    acc[cat].totalIDR += amt;
    return acc;
  }, {});

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
      header: 'Penerima Dana',
      render: (row) => (
        row.recipient_name ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold text-xs border border-cyan-500/20">
            <UserCheck className="w-3 h-3 text-cyan-400" /> {row.recipient_name}
          </span>
        ) : <span className="text-xs text-slate-500">-</span>
      )
    },
    {
      header: 'Status Pembayaran',
      render: (row) => {
        const st = row.payment_status || 'Paid';
        if (st === 'Paid') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Paid (Lunas)
            </span>
          );
        } else if (st === 'Unpaid') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" /> Unpaid (Pending)
            </span>
          );
        } else {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle className="w-3.5 h-3.5" /> Cancelled
            </span>
          );
        }
      }
    },
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
              placeholder="Cari deskripsi / penerima dana / catatan..."
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
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700/80 hover:border-rose-500/50 transition-colors">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-semibold cursor-pointer pr-1"
              >
                <option value="" className="bg-slate-900 text-white">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700/80 hover:border-rose-500/50 transition-colors">
              <span className="text-xs text-slate-400 font-semibold">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-semibold cursor-pointer pr-1"
              >
                <option value="" className="bg-slate-900 text-white">Semua Status</option>
                <option value="Paid" className="bg-slate-900 text-emerald-400 font-bold">🟢 Paid (Lunas)</option>
                <option value="Unpaid" className="bg-slate-900 text-amber-400 font-bold">🟡 Unpaid (Pending)</option>
                <option value="Cancelled" className="bg-slate-900 text-rose-400 font-bold">🔴 Cancelled</option>
              </select>
            </div>

            {/* Date Period Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700/80 hover:border-rose-500/50 transition-colors">
              <Calendar className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <select
                value={datePeriod}
                onChange={(e) => setDatePeriod(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none font-semibold cursor-pointer pr-1"
              >
                <option value="all" className="bg-slate-900 text-white">Semua Tanggal</option>
                <option value="today" className="bg-slate-900 text-white">Hari Ini</option>
                <option value="month" className="bg-slate-900 text-white">Bulan Ini</option>
                <option value="month_select" className="bg-slate-900 text-white">Pilih Bulan Spesifik...</option>
                <option value="year" className="bg-slate-900 text-white">Tahun Ini</option>
                <option value="custom" className="bg-slate-900 text-white">Rentang Tanggal Custom...</option>
              </select>
            </div>

            {datePeriod === 'month_select' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Bulan:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-rose-400 font-bold focus:outline-none focus:border-rose-500 cursor-pointer"
                />
              </div>
            )}

            {datePeriod === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                />
                <span className="text-xs text-slate-500 font-bold">s/d</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onClick={(e) => e.target.showPicker && e.target.showPicker()}
                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary Cards (Filtered) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-emerald-500 bg-emerald-500/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Total Paid (Disetujui)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                {filteredExpenses.filter(i => (!i.payment_status || i.payment_status === 'Paid')).length} Item
              </span>
            </div>
            <div className="text-lg font-extrabold text-white font-mono">
              IDR {totalPaidBaseIDR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-amber-500 bg-amber-500/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Pending (Unpaid)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                {filteredExpenses.filter(i => i.payment_status === 'Unpaid').length} Item
              </span>
            </div>
            <div className="text-lg font-extrabold text-amber-300 font-mono">
              IDR {totalUnpaidBaseIDR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-rose-500 bg-rose-500/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> Dibatalkan (Cancelled)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                {filteredExpenses.filter(i => i.payment_status === 'Cancelled').length} Item
              </span>
            </div>
            <div className="text-lg font-extrabold text-rose-400 font-mono">
              IDR {totalCancelledBaseIDR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border-l-4 border-l-pink-500 bg-pink-500/5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5" /> Total Pengeluaran Filtered
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                {filteredExpenses.length} Item
              </span>
            </div>
            <div className="text-lg font-extrabold text-rose-300 font-mono">
              IDR {totalFilteredBaseIDR.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Category Breakdown Badges Container */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div className="glass-panel p-4 rounded-2xl mb-6 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-rose-400" /> Ringkasan Pengeluaran Per Kategori (Terfilter)
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {Object.entries(categoryBreakdown).map(([catName, info]) => (
                <div key={catName} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-slate-700/80 text-xs">
                  <span className="font-semibold text-slate-300">{catName}:</span>
                  <span className="font-extrabold text-rose-400 font-mono">
                    IDR {info.totalIDR.toLocaleString()}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                    ({info.count} data)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('category')} *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {Array.from(new Set([...categories, formData.category])).filter(Boolean).map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">{cat}</option>
                ))}
              </select>
            </div>

            {/* Recipient Selection + Inline Add to Directory */}
            <div className="p-3 bg-slate-900/90 rounded-2xl border border-cyan-500/30 space-y-2">
              <label className="block text-xs font-bold text-cyan-300 uppercase flex items-center justify-between">
                <span>Penerima / Penerima Dana (Opsional)</span>
                {formData.recipient_name && !saveRecipientToDirectory && (
                  <span className="text-[10px] text-emerald-400 font-normal">✓ Terpilih: {formData.recipient_name}</span>
                )}
              </label>

              <select
                value={formData.recipient_member_id}
                onChange={(e) => handleSelectRecipient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">-- Pilih dari Direktori Pemain / Staff --</option>
                {directoryMembers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.full_name} {m.ign_tag ? `[${m.ign_tag}]` : ''} ({m.member_type || 'Staff'})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Atau ketik nama penerima baru..."
                value={formData.recipient_name}
                onChange={(e) => {
                  setFormData({ ...formData, recipient_name: e.target.value, recipient_member_id: '' });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />

              {/* Inline Save Recipient to Directory Toggle */}
              {formData.recipient_name.trim() && !formData.recipient_member_id && (
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveRecipientToDirectory}
                      onChange={(e) => setSaveRecipientToDirectory(e.target.checked)}
                      className="w-4 h-4 text-cyan-500 rounded border-slate-700 bg-slate-900 focus:ring-0"
                    />
                    <span className="text-xs text-cyan-300 font-bold flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5" /> Direct Simpan Penerima Ini ke Direktori Utama
                    </span>
                  </label>

                  {saveRecipientToDirectory && (
                    <div className="space-y-2 pt-1 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Tipe:</span>
                        <button
                          type="button"
                          onClick={() => setNewRecipientType('Player')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${
                            newRecipientType === 'Player' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          Pemain
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewRecipientType('Staff')}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border ${
                            newRecipientType === 'Staff' ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-900 text-slate-400 border-slate-700'
                          }`}
                        >
                          Staff
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Bank / E-Wallet (BCA/DANA)"
                          value={newRecipientBank}
                          onChange={(e) => setNewRecipientBank(e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300"
                        />
                        <input
                          type="text"
                          placeholder="No. Rekening Bank"
                          value={newRecipientAccount}
                          onChange={(e) => setNewRecipientAccount(e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-amber-300 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Status Pembayaran *</label>
              <select
                value={formData.payment_status || 'Paid'}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="Paid" className="bg-slate-900 text-emerald-400 font-bold">🟢 Paid (Lunas / Disetujui)</option>
                <option value="Unpaid" className="bg-slate-900 text-amber-400 font-bold">🟡 Unpaid (Belum Bayar / Pending)</option>
                <option value="Cancelled" className="bg-slate-900 text-rose-400 font-bold">🔴 Cancelled (Dibatalkan)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('description')} *</label>
              <input
                type="text"
                required
                placeholder="contoh: Hadiah Pemenang YeemMKJZT_ID / Pembuatan Map"
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-cyan-400 font-bold focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="IDR" className="bg-slate-900 text-white">IDR</option>
                  <option value="SGD" className="bg-slate-900 text-white">SGD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('related_event')}</label>
              <select
                value={formData.related_event_id}
                onChange={(e) => setFormData({ ...formData, related_event_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-white">-- Tidak Terkait Acara Manapun --</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id} className="bg-slate-900 text-white">
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('notes')}</label>
              <textarea
                rows="2"
                placeholder="Catatan tambahan / rincian rekening"
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
