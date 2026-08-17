import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { UserCheck, Search, DollarSign, Calendar, FileText, CheckCircle2, Clock, AlertCircle, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const ArrearsModal = ({ isOpen, onClose, record, onSuccess }) => {
  const isEditing = !!record;

  const [formData, setFormData] = useState({
    member_id: '',
    full_name: '',
    discord_username: '',
    roblox_username: '',
    role: 'Staff',
    juli_amount: '',
    agustus_amount: '',
    status: 'Pending',
    notes: ''
  });

  const [directoryMembers, setDirectoryMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchDirectory, setSearchDirectory] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchDirectoryMembers();
      if (record) {
        setFormData({
          member_id: record.member_id || '',
          full_name: record.full_name || '',
          discord_username: record.discord_username || '',
          roblox_username: record.roblox_username || '',
          role: record.role || 'Staff',
          juli_amount: record.juli_amount !== undefined ? record.juli_amount : '',
          agustus_amount: record.agustus_amount !== undefined ? record.agustus_amount : '',
          status: record.status || 'Pending',
          notes: record.notes || ''
        });
      } else {
        setFormData({
          member_id: '',
          full_name: '',
          discord_username: '',
          roblox_username: '',
          role: 'Staff',
          juli_amount: '',
          agustus_amount: '',
          status: 'Pending',
          notes: ''
        });
      }
    }
  }, [isOpen, record]);

  // Click outside to close directory dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchDirectoryMembers = async () => {
    try {
      const res = await api.get('/internal/finance/members');
      if (res.data.success) {
        setDirectoryMembers(res.data.data || []);
      }
    } catch (_) {}
  };

  const getMemberRoleString = (m) => {
    if (!m) return 'Player';
    if (m.entity_type === 'player' || m.type === 'player') {
      return 'Player';
    }

    const roleList = [];
    if (Array.isArray(m.roles) && m.roles.length > 0) {
      roleList.push(...m.roles);
    } else if (Array.isArray(m.categories) && m.categories.length > 0) {
      roleList.push(...m.categories);
    } else if (m.role) {
      roleList.push(m.role);
    } else if (m.category) {
      roleList.push(m.category);
    }

    const unique = [...new Set(roleList.filter(r => Boolean(r) && String(r).trim() !== ''))];
    if (unique.length > 0) {
      return unique.join(', ');
    }

    return (m.entity_type === 'staff' || m.type === 'staff') ? 'Staff' : 'Player';
  };

  const handleSelectMember = (m) => {
    const roleStr = getMemberRoleString(m);

    setFormData(prev => ({
      ...prev,
      member_id: m.id,
      full_name: m.full_name || m.ign_tag || '',
      discord_username: m.discord_username || '',
      roblox_username: m.roblox_username || '',
      role: roleStr
    }));
    setShowDropdown(false);
    toast.success(`Data ${m.full_name || m.ign_tag} (${roleStr}) berhasil dipilih!`);
  };

  const calculatedTotal = Number(formData.juli_amount || 0) + Number(formData.agustus_amount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        juli_amount: Number(formData.juli_amount || 0),
        agustus_amount: Number(formData.agustus_amount || 0),
        total_amount: calculatedTotal
      };

      let res;
      if (isEditing) {
        res = await api.put(`/internal/arrears/${record.id}`, payload);
      } else {
        res = await api.post('/internal/arrears', payload);
      }

      if (res.data.success) {
        toast.success(isEditing ? 'Data tunggakan berhasil diperbarui!' : 'Data tunggakan baru berhasil ditambahkan!');
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan data tunggakan.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = directoryMembers.filter(m => {
    if (!searchDirectory.trim()) return true;
    const q = searchDirectory.toLowerCase();
    return (m.full_name || '').toLowerCase().includes(q) ||
      (m.discord_username || '').toLowerCase().includes(q) ||
      (m.roblox_username || '').toLowerCase().includes(q) ||
      (m.ign_tag || '').toLowerCase().includes(q);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Data Tunggakan Payout' : 'Tambah Data Tunggakan Payout Baru'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Searchable Directory Select (Auto-fill) */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Pilih Member Dari Direktori (Auto-fill)</span>
            <span className="text-[10px] text-cyan-400 font-semibold">Opsional / Free Text</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Ketik untuk mencari nama member/staff di direktori..."
              value={searchDirectory}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setSearchDirectory(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Directory Dropdown List */}
          {showDropdown && filteredMembers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-800">
              {filteredMembers.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMember(m)}
                  className="w-full text-left p-3 hover:bg-slate-800 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-extrabold text-white">{m.full_name || m.ign_tag}</div>
                    <div className="text-[11px] text-slate-400">
                      @{m.discord_username || '-'} | Role: {getMemberRoleString(m)}
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recipient Full Name & Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Nama Lengkap / IGN <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Contoh: Iqbal / Maintainer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Role / Jabatan <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Contoh: Maintainer & Lead Developer, Caster, BA"
            />
          </div>
        </div>

        {/* Usernames (Discord & Roblox) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Username Discord</label>
            <input
              type="text"
              value={formData.discord_username}
              onChange={(e) => setFormData({ ...formData, discord_username: e.target.value })}
              className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Tanpa @ (contoh: iqbal_dev)"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Username Roblox</label>
            <input
              type="text"
              value={formData.roblox_username}
              onChange={(e) => setFormData({ ...formData, roblox_username: e.target.value })}
              className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
              placeholder="Contoh: IqbalRoblox"
            />
          </div>
        </div>

        {/* Monthly Breakdown Amounts (Juli & Agustus) */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 space-y-4">
          <div className="text-xs font-black text-rose-400 flex items-center justify-between">
            <span>Rincian Tunggakan Per Bulan (IDR)</span>
            <span className="text-emerald-400 font-extrabold">Total Auto-Calculate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tunggakan Bulan Juli (IDR)</label>
              <input
                type="number"
                min="0"
                value={formData.juli_amount}
                onChange={(e) => setFormData({ ...formData, juli_amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Tunggakan Bulan Agustus (IDR)</label>
              <input
                type="number"
                min="0"
                value={formData.agustus_amount}
                onChange={(e) => setFormData({ ...formData, agustus_amount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Calculated Total Display */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-400">Total Akumulasi Tunggakan:</span>
            <span className="text-base font-black text-rose-500">IDR {calculatedTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Status Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Status Pembayaran / Payout</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="Pending">● Belum Dibayar (Pending)</option>
            <option value="Processing">Diproses (Processing)</option>
            <option value="Paid">Lunas / Terbayar (Paid)</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300">Catatan / Keterangan</label>
          <textarea
            rows="2"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-900 text-white focus:outline-none focus:border-cyan-500"
            placeholder="Catatan tambahan rincian tunggakan..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
          >
            {loading ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Data Tunggakan')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
