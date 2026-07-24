import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { MemberModal } from '../components/common/MemberModal';
import { Plus, Trash2, Edit, Users, UserPlus, Settings, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const PaymentPage = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [paymentCategories, setPaymentCategories] = useState(['BA payment', 'Caster payment', 'Maintainer fee', 'Secretary stipend', 'Other payout']);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newPaymentCatName, setNewPaymentCatName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    member_id: '',
    payment_category: 'BA payment',
    amount: '',
    currency: 'IDR',
    status: 'Pending',
    payment_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchMembers();
    fetchPaymentCategories();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/finance/payments');
      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load member payment records');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/internal/finance/members');
      if (response.data.success) {
        setMembers(response.data.data);
        if (response.data.data.length > 0 && !formData.member_id) {
          setFormData(prev => ({ ...prev, member_id: response.data.data[0].id }));
        }
      }
    } catch (_) {}
  };

  const fetchPaymentCategories = async () => {
    try {
      const response = await api.get('/internal/finance/payments/categories');
      if (response.data.success && response.data.data) {
        setPaymentCategories(response.data.data);
        if (response.data.data.length > 0 && !formData.payment_category) {
          setFormData(prev => ({ ...prev, payment_category: response.data.data[0] }));
        }
      }
    } catch (_) {}
  };

  const handleAddPaymentCategory = async (e) => {
    e.preventDefault();
    if (!newPaymentCatName.trim()) return;
    const catName = newPaymentCatName.trim();
    if (paymentCategories.includes(catName)) {
      return toast.error('Payment category already exists');
    }
    const updatedCategories = [...paymentCategories, catName];
    try {
      await api.post('/internal/finance/payments/categories', { categories: updatedCategories });
      setPaymentCategories(updatedCategories);
      setNewPaymentCatName('');
      toast.success(`Payment Category "${catName}" added`);
    } catch (_) {
      toast.error('Failed to save payment category');
    }
  };

  const handleDeletePaymentCategory = async (catToDelete) => {
    if (paymentCategories.length <= 1) {
      return toast.error('At least one payment category must remain');
    }
    if (!window.confirm(`Delete payment category "${catToDelete}"?`)) return;
    const updatedCategories = paymentCategories.filter(c => c !== catToDelete);
    try {
      await api.post('/internal/finance/payments/categories', { categories: updatedCategories });
      setPaymentCategories(updatedCategories);
      toast.success(`Payment Category "${catToDelete}" deleted`);
    } catch (_) {
      toast.error('Failed to delete payment category');
    }
  };

  const handleMemberSelect = (memberId) => {
    const selectedMember = members.find(m => m.id === Number(memberId));
    setFormData(prev => {
      const updated = { ...prev, member_id: memberId };
      if (selectedMember && selectedMember.monthly_salary > 0) {
        updated.amount = selectedMember.monthly_salary;
        if (selectedMember.salary_currency) {
          updated.currency = selectedMember.salary_currency;
        }
      }
      return updated;
    });
  };

  const handleOpenModal = (payment = null) => {
    if (payment) {
      setEditingId(payment.id);
      setFormData({
        member_id: payment.member_id,
        payment_category: payment.payment_category || paymentCategories[0] || 'BA payment',
        amount: payment.amount,
        currency: payment.currency || 'IDR',
        status: payment.status || 'Pending',
        payment_date: payment.payment_date || '',
        notes: payment.notes || ''
      });
    } else {
      const firstMember = members.length > 0 ? members[0] : null;
      setEditingId(null);
      setFormData({
        member_id: firstMember ? firstMember.id : '',
        payment_category: paymentCategories[0] || 'BA payment',
        amount: firstMember && firstMember.monthly_salary > 0 ? firstMember.monthly_salary : '',
        currency: firstMember && firstMember.salary_currency ? firstMember.salary_currency : 'IDR',
        status: 'Pending',
        payment_date: '',
        notes: ''
      });
      if (!firstMember || !firstMember.salary_currency) {
        api.get('/internal/admin/settings').then(res => {
          if (res.data?.data?.default_currency) {
            setFormData(prev => ({ ...prev, currency: res.data.data.default_currency }));
          }
        }).catch(() => {});
      }
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/internal/finance/payments/${editingId}`, formData);
        toast.success('Payment updated successfully');
      } else {
        await api.post('/internal/finance/payments', formData);
        toast.success('Payment recorded successfully');
      }
      setModalOpen(false);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment record?')) return;
    try {
      await api.delete(`/internal/finance/payments/${id}`);
      toast.success('Payment record deleted');
      fetchPayments();
    } catch (err) {
      toast.error('Failed to delete payment record');
    }
  };

  const columns = [
    { header: t('select_member'), accessor: 'member_name', cellClassName: 'font-semibold text-white' },
    {
      header: t('payment_category'),
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {row.payment_category}
        </span>
      )
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
        <span className="font-extrabold text-purple-400">
          IDR {Number(row.base_amount_idr || row.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      )
    },
    {
      header: t('status'),
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
          row.status === 'Paid'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {row.status === 'Paid' ? t('paid') : row.status}
        </span>
      )
    },
    {
      header: t('date'),
      render: (row) => row.payment_date || <span className="text-xs text-slate-500">Unpaid</span>
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
              <Users className="w-7 h-7 text-purple-400" />
              {t('payments')} & Staff Management
            </h1>
            <p className="text-xs text-slate-400 mt-1">Record payouts and manage internal staff (BA, Caster, Maintainer, Secretary)</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <Settings className="w-4 h-4 text-purple-400" />
              {t('config_payment_categories')}
            </button>
            <button
              onClick={() => setMemberModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              {t('manage_staff_members')}
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('record_member_payment')}
            </button>
          </div>
        </div>

        {/* Payment Category Config Panel */}
        {showCategoryManager && (
          <div className="p-4 mb-6 bg-slate-900/90 rounded-2xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold text-purple-300 uppercase">{t('config_payment_categories')}</h5>
              <button onClick={() => setShowCategoryManager(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {paymentCategories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700">
                  <span>{cat}</span>
                  <button
                    type="button"
                    onClick={() => handleDeletePaymentCategory(cat)}
                    className="text-slate-400 hover:text-rose-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddPaymentCategory} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="New Payment Category (e.g. Streamer Stipend)"
                value={newPaymentCatName}
                onChange={(e) => setNewPaymentCatName(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-purple-500 text-white text-xs font-semibold hover:bg-purple-400"
              >
                {t('add')}
              </button>
            </form>
          </div>
        )}

        <Table columns={columns} data={payments} loading={loading} emptyMessage="No member payment records found." />

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Member Payment' : t('record_member_payment')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('select_member')} *</label>
              <select
                value={formData.member_id}
                onChange={(e) => handleMemberSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('payment_category')} *</label>
              <select
                value={formData.payment_category}
                onChange={(e) => setFormData({ ...formData, payment_category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold text-purple-300"
              >
                {paymentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">{t('processing')}</option>
                  <option value="Paid">{t('paid')}</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('date')}</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                />
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
                className="px-4 py-2 rounded-xl bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </Modal>

        <MemberModal
          isOpen={memberModalOpen}
          onClose={() => setMemberModalOpen(false)}
          onMembersUpdated={fetchMembers}
        />
      </main>
    </div>
  );
};
