import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { Trophy, Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const PrizeModal = ({ isOpen, onClose, event }) => {
  const { t } = useTranslation();
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrizeId, setEditingPrizeId] = useState(null);

  const [formData, setFormData] = useState({
    prize_title: 'Champion',
    winner_name: '',
    reward_description: '',
    prize_amount: '',
    currency: 'IDR',
    payment_status: 'Unpaid',
    payment_date: '',
    internal_notes: ''
  });

  useEffect(() => {
    if (event && isOpen) {
      fetchPrizes();
    }
  }, [event, isOpen]);

  const fetchPrizes = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/internal/events/prizes/list?event_id=${event.id}`);
      if (response.data.success) {
        setPrizes(response.data.data);
      }
    } catch (_) {}
    finally {
      setLoading(false);
    }
  };

  const handleEdit = (prize) => {
    setEditingPrizeId(prize.id);
    setFormData({
      prize_title: prize.prize_title,
      winner_name: prize.winner_name,
      reward_description: prize.reward_description,
      prize_amount: prize.prize_amount || '',
      currency: prize.currency || 'IDR',
      payment_status: prize.payment_status,
      payment_date: prize.payment_date || '',
      internal_notes: prize.internal_notes || ''
    });
  };

  const handleResetForm = () => {
    setEditingPrizeId(null);
    setFormData({
      prize_title: 'Champion',
      winner_name: '',
      reward_description: '',
      prize_amount: '',
      currency: 'IDR',
      payment_status: 'Unpaid',
      payment_date: '',
      internal_notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, event_id: event.id };
      if (editingPrizeId) {
        await api.put(`/internal/events/prizes/${editingPrizeId}`, payload);
        toast.success('Prize updated successfully');
      } else {
        await api.post('/internal/events/prizes', payload);
        toast.success('Prize tier added successfully');
      }
      handleResetForm();
      fetchPrizes();
    } catch (err) {
      toast.error('Failed to save prize');
    }
  };

  const handleDelete = async (prizeId) => {
    if (!window.confirm('Delete this prize tier?')) return;
    try {
      await api.delete(`/internal/events/prizes/${prizeId}`);
      toast.success('Prize deleted');
      fetchPrizes();
    } catch (_) {
      toast.error('Failed to delete prize');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('manage_prizes')}: ${event?.title || ''}`}>
      <div className="space-y-6">
        {/* Existing Prizes List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Current Event Prizes</h4>
          {loading ? (
            <div className="text-xs text-slate-400">Loading prizes...</div>
          ) : prizes.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {prizes.map((p) => (
                <div key={p.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-sm">{p.prize_title}</span>
                      <span className="text-xs text-cyan-300">({p.winner_name})</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{p.reward_description}</p>
                    {p.prize_amount > 0 && (
                      <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                        Payout Amount: {p.currency || 'IDR'} {Number(p.prize_amount).toLocaleString()}
                      </p>
                    )}
                    <div className="mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        p.payment_status === 'Paid' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        Status: {p.payment_status} {p.payment_date ? `(${p.payment_date})` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(p)} className="p-1 text-slate-400 hover:text-cyan-400">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500">No prize tiers defined yet for this event.</div>
          )}
        </div>

        {/* Add/Edit Prize Form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {editingPrizeId ? 'Edit Prize Tier' : 'Add Prize Tier'}
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase">Prize Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Champion"
                value={formData.prize_title}
                onChange={(e) => setFormData({ ...formData, prize_title: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase">Winner Name / Team *</label>
              <input
                type="text"
                required
                placeholder="e.g. Team Nova"
                value={formData.winner_name}
                onChange={(e) => setFormData({ ...formData, winner_name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase">Reward Description (Public Label) *</label>
            <input
              type="text"
              required
              placeholder="e.g. IDR 1.500.000 + Trophy"
              value={formData.reward_description}
              onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase">Cash Payout Amount (Auto-syncs to Expenses when Paid)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.prize_amount}
                onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-semibold text-emerald-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase">{t('currency')}</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold text-cyan-400"
              >
                <option value="IDR">IDR</option>
                <option value="SGD">SGD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase">Public Payment Status</label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="Unpaid">{t('unpaid')}</option>
                <option value="Processing">{t('processing')}</option>
                <option value="Paid">{t('paid')} (Auto-syncs to Operational Expense)</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase">{t('date')}</label>
              <input
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            {editingPrizeId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                {t('cancel')}
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-cyan-500 text-white text-xs font-semibold hover:bg-cyan-400"
            >
              {editingPrizeId ? t('save') : t('add')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
