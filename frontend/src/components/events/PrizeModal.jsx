import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { Trophy, Plus, Trash2, Edit, CheckCircle2, Search, Award, Clock, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const PrizeModal = ({ isOpen, onClose, event }) => {
  const { t } = useTranslation();
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPrizeId, setEditingPrizeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    prize_title: 'Juara 1',
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
      prize_amount: prize.prize_amount !== undefined && prize.prize_amount !== null ? prize.prize_amount : '',
      currency: prize.currency || event?.currency || 'IDR',
      payment_status: prize.payment_status || 'Unpaid',
      payment_date: prize.payment_date || '',
      internal_notes: prize.internal_notes || ''
    });
  };

  const handleResetForm = () => {
    setEditingPrizeId(null);
    setFormData({
      prize_title: 'Juara 1',
      winner_name: '',
      reward_description: '',
      prize_amount: '',
      currency: event?.currency || 'IDR',
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
        toast.success('Pemenang / Tier Hadiah berhasil diperbarui');
      } else {
        await api.post('/internal/events/prizes', payload);
        toast.success('Pemenang / Tier Hadiah baru berhasil ditambahkan');
      }
      handleResetForm();
      fetchPrizes();
    } catch (err) {
      toast.error('Gagal menyimpan data pemenang');
    }
  };

  const handleDelete = async (prizeId) => {
    if (!window.confirm('Hapus rincian pemenang / tier hadiah ini?')) return;
    try {
      await api.delete(`/internal/events/prizes/${prizeId}`);
      toast.success('Rincian pemenang dihapus');
      fetchPrizes();
    } catch (_) {
      toast.error('Gagal menghapus data pemenang');
    }
  };

  // Filter prizes by search query
  const filteredPrizes = prizes.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.prize_title?.toLowerCase().includes(q) ||
      p.winner_name?.toLowerCase().includes(q) ||
      p.reward_description?.toLowerCase().includes(q)
    );
  });

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Kelola Hadiah & Pemenang: ${event.title}`} maxWidth="max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Prize & Winner List + Real-time Search */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pemenang / kategori / hadiah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="text-xs text-slate-400 font-semibold shrink-0">
              Total <span className="text-amber-400 font-bold">{prizes.length}</span> Hadiah
            </div>
          </div>

          {/* List of Prizes */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Memuat rincian pemenang...</div>
          ) : filteredPrizes.length > 0 ? (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredPrizes.map((p) => {
                const isPaid = p.payment_status === 'Paid';
                const isProcessing = p.payment_status === 'Processing';

                return (
                  <div
                    key={p.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      editingPrizeId === p.id
                        ? 'bg-cyan-950/40 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="font-bold text-white text-sm">{p.prize_title}</span>
                          <span className="text-xs font-bold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                            {p.winner_name}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-medium pl-6">{p.reward_description}</p>

                        <div className="flex flex-wrap items-center gap-3 pl-6 pt-1">
                          {Number(p.prize_amount) > 0 && (
                            <span className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                              <span>Payout: {p.currency || 'IDR'} {Number(p.prize_amount).toLocaleString()}</span>
                            </span>
                          )}

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isProcessing
                              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}>
                            {isPaid && <CheckCircle2 className="w-3 h-3" />}
                            {isProcessing && <Clock className="w-3 h-3 animate-spin" />}
                            <span>{p.payment_status || 'Unpaid'}</span>
                            {p.payment_date && <span className="font-mono text-slate-400">({p.payment_date})</span>}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                          title="Edit Hadiah"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Hapus Hadiah"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs bg-slate-900/40 rounded-2xl border border-slate-800">
              {searchQuery ? `Tidak ada pemenang cocok dengan "${searchQuery}"` : 'Belum ada rincian hadiah terdaftar untuk acara ini.'}
            </div>
          )}
        </div>

        {/* Right Column: Add/Edit Prize Form Panel */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              {editingPrizeId ? 'Edit Tier / Pemenang Hadiah' : 'Tambah Tier Hadiah Baru'}
            </h4>
            {editingPrizeId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-[10px] text-slate-400 hover:text-white font-semibold"
              >
                + Tambah Baru
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Kategori / Tier Hadiah *
              </label>
              <input
                type="text"
                required
                placeholder="contoh: Juara 1 / Best Support"
                value={formData.prize_title}
                onChange={(e) => setFormData({ ...formData, prize_title: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Nama Pemenang / Tim *
              </label>
              <input
                type="text"
                required
                placeholder="contoh: YeemMKJZT_ID / Team Alpha"
                value={formData.winner_name}
                onChange={(e) => setFormData({ ...formData, winner_name: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                Deskripsi Hadiah (Tabel Publik) *
              </label>
              <input
                type="text"
                required
                placeholder="contoh: Hadiah Peringkat 1 (37 Poin) / Rp 1.500.000 + Tropi"
                value={formData.reward_description}
                onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Cash Payout & Currency Input */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-500/20 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Nominal Cash Payout (Opsional)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.prize_amount}
                  onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
                  className="flex-1 min-w-0 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-20 shrink-0 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-bold text-center focus:outline-none focus:border-cyan-500"
                >
                  <option value="IDR">IDR</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-400">Jika diisi dan status diset "Paid", otomatis tercatat ke Laporan Pengeluaran.</p>
            </div>

            {/* Status & Date Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Status Pembayaran
                </label>
                <select
                  value={formData.payment_status}
                  onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="Unpaid">Belum Dibayar</option>
                  <option value="Processing">Proses Pencairan</option>
                  <option value="Paid">Lunas (Paid)</option>
                  <option value="Cancelled">Dibatalkan</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase mb-1">
                  Tanggal Pencairan
                </label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              {editingPrizeId && (
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
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md glow-cyan"
              >
                {editingPrizeId ? t('save') : 'Simpan Tier Hadiah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
