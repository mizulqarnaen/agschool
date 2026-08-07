import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Save, User, ShieldCheck, DollarSign } from 'lucide-react';
import api from '../../services/api';

export const CampaignModal = ({ isOpen, onClose, campaign, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    default_amount: 50000,
    is_published: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        default_amount: campaign.default_amount || 50000,
        is_published: campaign.is_published ?? true
      });
    } else {
      setFormData({
        name: 'AGCL Compensation',
        description: 'Kompensasi resmi untuk peserta & tim AGCL',
        default_amount: 50000,
        is_published: true
      });
    }
  }, [campaign, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            {campaign ? 'Edit Kampanye Kompensasi' : 'Buat Kampanye Kompensasi Baru'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Nama Kampanye *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: AGCL Compensation, Anniversary Compensation"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Deskripsi Kampanye</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Jelaskan tujuan kompensasi atau kriteria penerima..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Nominal Bawaan (IDR)</label>
              <input
                type="number"
                min="0"
                value={formData.default_amount}
                onChange={(e) => setFormData({ ...formData, default_amount: Number(e.target.value) })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Status Publikasi</label>
              <select
                value={formData.is_published ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'true' })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-bold"
              >
                <option value="true">🟢 Tampilkan Publik</option>
                <option value="false">🔴 Sembunyikan (Draft)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Kampanye</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RecordModal = ({ isOpen, onClose, record, campaignId, defaultAmount, onSave }) => {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [amount, setAmount] = useState(defaultAmount || 50000);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      if (record) {
        setSelectedMemberId(record.member_id || '');
        setAmount(record.amount || 50000);
        setPaymentStatus(record.payment_status || 'Pending');
        setNotes(record.notes || '');
      } else {
        setSelectedMemberId('');
        setAmount(defaultAmount || 50000);
        setPaymentStatus('Pending');
        setNotes('');
      }
    }
  }, [record, isOpen, defaultAmount]);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/internal/members');
      if (res.data.success) {
        setMembers(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const filteredMembers = members.filter(m =>
    (m.full_name && m.full_name.toLowerCase().includes(searchMember.toLowerCase())) ||
    (m.discord_username && m.discord_username.toLowerCase().includes(searchMember.toLowerCase())) ||
    (m.roblox_username && m.roblox_username.toLowerCase().includes(searchMember.toLowerCase()))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) return alert('Pilih member penerima kompensasi');
    setSubmitting(true);
    try {
      await onSave({
        campaign_id: campaignId,
        member_id: selectedMemberId,
        amount: Number(amount),
        payment_status: paymentStatus,
        notes
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            {record ? 'Edit Record Kompensasi' : 'Tambah Penerima Kompensasi'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Member Search & Selection */}
          <div>
            <label className="block font-bold text-slate-300 mb-1">Pilih Member (Master Directory) *</label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama, Discord, atau Roblox..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              required
              size="4"
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none"
            >
              {filteredMembers.map(m => (
                <option key={m.id} value={m.id} className="p-1.5 hover:bg-slate-800 cursor-pointer">
                  {m.full_name} {m.discord_username ? `(@${m.discord_username})` : ''} {m.roblox_username ? `[Roblox: ${m.roblox_username}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Nominal Kompensasi (IDR) *</label>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-bold text-sm"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Status Pembayaran *</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-bold"
              >
                <option value="Completed">🟢 Completed (Selesai)</option>
                <option value="Processing">🔵 Processing (Diproses)</option>
                <option value="Pending">🟡 Pending (Menunggu)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Catatan Internal / Bukti Transfer</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Transfer Bank BCA 12345678"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black flex items-center gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Record</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
