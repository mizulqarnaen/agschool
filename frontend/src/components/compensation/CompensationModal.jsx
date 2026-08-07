import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Save, User, ShieldCheck, DollarSign, Upload, Image as ImageIcon, FileText } from 'lucide-react';
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
            {campaign ? 'Edit Program Kompensasi' : 'Buat Program Kompensasi Baru'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Nama Program *</label>
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
            <label className="block font-bold text-slate-300 mb-1">Deskripsi Program</label>
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
              <span>Simpan Program</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const RecordModal = ({ isOpen, onClose, record, campaignId, defaultAmount, onSave }) => {
  const [entryMode, setEntryMode] = useState('free_text'); // 'directory' or 'free_text'
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [searchMember, setSearchMember] = useState('');

  // Free-text fields
  const [fullName, setFullName] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [robloxUsername, setRobloxUsername] = useState('');
  const [rekening, setRekening] = useState('');

  const [amount, setAmount] = useState(defaultAmount || 50000);
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [notes, setNotes] = useState('');

  // File upload state for transfer proof
  const [proofFile, setProofFile] = useState(null);
  const [existingProofUrl, setExistingProofUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      if (record) {
        setEntryMode(record.member_id ? 'directory' : 'free_text');
        setSelectedMemberId(record.member_id || '');
        setFullName(record.full_name || '');
        setDiscordUsername(record.discord_username || '');
        setRobloxUsername(record.roblox_username || '');
        setRekening(record.rekening || '');
        setAmount(record.amount || defaultAmount || 50000);
        setPaymentStatus(record.payment_status || 'Pending');
        setNotes(record.notes || '');
        setExistingProofUrl(record.proof_url || null);
        setProofFile(null);
      } else {
        setEntryMode('free_text');
        setSelectedMemberId('');
        setFullName('');
        setDiscordUsername('');
        setRobloxUsername('');
        setRekening('');
        setAmount(defaultAmount || 50000);
        setPaymentStatus('Pending');
        setNotes('');
        setExistingProofUrl(null);
        setProofFile(null);
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

  // Auto-fill details when member selected from Directory
  const handleSelectMember = (memberId) => {
    setSelectedMemberId(memberId);
    const m = members.find(item => item.id === memberId);
    if (m) {
      setFullName(m.full_name || '');
      setDiscordUsername(m.discord_username || '');
      setRobloxUsername(m.roblox_username || '');
      setRekening(m.bank_account_number || '');
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

    const payload = {
      campaign_id: campaignId,
      member_id: entryMode === 'directory' ? selectedMemberId : null,
      full_name: fullName || discordUsername || robloxUsername || 'Member Komunitas',
      discord_username: discordUsername,
      roblox_username: robloxUsername,
      rekening,
      amount: Number(amount),
      payment_status: paymentStatus,
      notes,
      proof_url: existingProofUrl
    };

    setSubmitting(true);
    try {
      await onSave(payload, proofFile);
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
          {/* Entry Mode Toggle Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => setEntryMode('free_text')}
              className={`flex-1 py-2 text-center rounded-lg font-bold transition-all ${
                entryMode === 'free_text'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ✍️ Input Free-Text (Manual)
            </button>
            <button
              type="button"
              onClick={() => setEntryMode('directory')}
              className={`flex-1 py-2 text-center rounded-lg font-bold transition-all ${
                entryMode === 'directory'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📁 Pilih dari Master Member
            </button>
          </div>

          {/* Directory Selector Mode */}
          {entryMode === 'directory' ? (
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
                size="4"
                value={selectedMemberId}
                onChange={(e) => handleSelectMember(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none"
              >
                {filteredMembers.map(m => (
                  <option key={m.id} value={m.id} className="p-1.5 hover:bg-slate-800 cursor-pointer">
                    {m.full_name} {m.discord_username ? `(@${m.discord_username})` : ''} {m.roblox_username ? `[Roblox: ${m.roblox_username}]` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Free-Text Input Fields */
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Member / Alias</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Razira, Jefry Pang"
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">NAMA DC (Discord Handle)</label>
                  <input
                    type="text"
                    value={discordUsername}
                    onChange={(e) => setDiscordUsername(e.target.value.replace(/^@/, ''))}
                    placeholder="raziraaa_51553"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-indigo-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">USN ROBLOX (Roblox Username)</label>
                  <input
                    type="text"
                    value={robloxUsername}
                    onChange={(e) => setRobloxUsername(e.target.value)}
                    placeholder="liaaaauuuuuu4"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Amount & Status */}
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
            <label className="block font-bold text-slate-300 mb-1">Detail Rekening / Catatan Transfer</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: BCA 12345678 a.n Jefry"
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          {/* Transfer Proof Upload Section */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <label className="block font-extrabold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                Upload Foto Bukti Transfer
              </span>
              <span className="text-[10px] text-slate-400 font-normal">(PNG, JPG, WEBP)</span>
            </label>

            {existingProofUrl && !proofFile && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <img src={existingProofUrl} alt="Bukti Transfer" className="w-10 h-10 object-cover rounded-lg" />
                <span className="text-slate-300 truncate flex-1">Bukti Transfer Ter-upload</span>
                <a href={existingProofUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-bold">Lihat</a>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
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
