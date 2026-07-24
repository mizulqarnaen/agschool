import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Plus, Trash2, Edit, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const ExpensePage = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    category: 'Logistics',
    description: '',
    amount: '',
    currency: 'IDR',
    related_event_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchEvents();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/finance/expenses');
      if (response.data.success) {
        setExpenses(response.data.data);
      }
    } catch (err) {
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
        category: 'Logistics',
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
        toast.success('Expense updated successfully');
      } else {
        await api.post('/internal/finance/expenses', formData);
        toast.success('Expense recorded successfully');
      }
      setModalOpen(false);
      fetchExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.delete(`/internal/finance/expenses/${id}`);
      toast.success('Expense record deleted');
      fetchExpenses();
    } catch (err) {
      toast.error('Failed to delete expense record');
    }
  };

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
        return ev ? <span className="text-xs text-cyan-400">{ev.title}</span> : <span className="text-xs text-slate-500">None</span>;
      }
    },
    {
      header: `${t('amount')} (${t('currency')})`,
      render: (row) => (
        <span className="font-bold text-white">
          {row.currency || 'IDR'} {Number(row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: 'Konversi Base (IDR)',
      render: (row) => (
        <span className="font-extrabold text-rose-400">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <TrendingDown className="w-7 h-7 text-rose-400" />
              {t('expenses')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Record and manage AG School operational expenses & event logistics</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-semibold text-sm shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('record_expense')}
          </button>
        </div>

        <Table columns={columns} data={expenses} loading={loading} emptyMessage="No expense records found." />

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Expense Record' : t('record_expense')}>
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
                <option value="Equipment">Equipment</option>
                <option value="Logistics">Logistics</option>
                <option value="Server/Domain">Server / Domain</option>
                <option value="Refreshments">Refreshments</option>
                <option value="Operations">Operations</option>
                <option value="Event Prize Payout">Event Prize Payout</option>
                <option value="Other Expense">Other Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('description')} *</label>
              <input
                type="text"
                required
                placeholder="Description of expenditure"
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
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('currency')}</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-bold text-cyan-400"
                >
                  <option value="IDR">IDR (Rupiah)</option>
                  <option value="SGD">SGD (Dollar)</option>
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
                <option value="">-- No Related Event --</option>
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
                placeholder="Optional internal notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-400"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
