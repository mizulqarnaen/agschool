import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Plus, Trash2, Edit, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const IncomePage = () => {
  const { t } = useTranslation();
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState(['Sponsorship', 'Donation', 'Registration Fee', 'School Allocation', 'Merchandise Sales', 'Other Income']);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    category: 'Sponsorship',
    source: '',
    description: '',
    amount: '',
    currency: 'IDR',
    notes: ''
  });

  useEffect(() => {
    fetchIncomes();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/internal/finance/incomes/categories');
      if (response.data.success && response.data.data?.length > 0) {
        setCategories(response.data.data);
      }
    } catch (_) {}
  };

  const fetchIncomes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/finance/incomes');
      if (response.data.success) {
        setIncomes(response.data.data);
      }
    } catch (_) {
      toast.error('Failed to load income records');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (income = null) => {
    if (income) {
      setEditingId(income.id);
      setFormData({
        transaction_date: income.transaction_date,
        category: income.category,
        source: income.source,
        description: income.description,
        amount: income.amount,
        currency: income.currency || 'IDR',
        notes: income.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        transaction_date: new Date().toISOString().split('T')[0],
        category: 'Sponsorship',
        source: '',
        description: '',
        amount: '',
        currency: 'IDR',
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
        await api.put(`/internal/finance/incomes/${editingId}`, formData);
        toast.success('Income updated successfully');
      } else {
        await api.post('/internal/finance/incomes', formData);
        toast.success('Income recorded successfully');
      }
      setModalOpen(false);
      fetchIncomes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record?')) return;
    try {
      await api.delete(`/internal/finance/incomes/${id}`);
      toast.success('Income record deleted');
      fetchIncomes();
    } catch (_) {
      toast.error('Failed to delete income record');
    }
  };

  const columns = [
    { header: t('date'), accessor: 'transaction_date' },
    {
      header: t('category'),
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {row.category}
        </span>
      )
    },
    { header: t('income_source'), accessor: 'source', cellClassName: 'font-semibold text-white' },
    { header: t('description'), accessor: 'description' },
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
        <span className="font-extrabold text-emerald-400">
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
              <TrendingUp className="w-7 h-7 text-emerald-400" />
              {t('incomes')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Record operational income in original transaction currency (IDR / SGD)</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('record_income')}
          </button>
        </div>

        <Table columns={columns} data={incomes} loading={loading} emptyMessage="No income records found." />

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Income Record' : t('record_income')}>
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
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('income_source')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. Tech Sponsor Corp"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('description')} *</label>
              <input
                type="text"
                required
                placeholder="Summary of income"
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
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400 shadow-md glow-cyan"
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
