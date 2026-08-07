import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { CampaignModal, RecordModal } from '../components/compensation/CompensationModal';
import { ExcelImportModal } from '../components/compensation/ExcelImportModal';
import {
  ShieldCheck, Plus, Search, Filter, Edit, Trash2,
  CheckCircle2, Clock, DollarSign, UserCheck, RefreshCw, Eye, EyeOff, Info, HelpCircle,
  FileSpreadsheet, Upload, Download, Image as ImageIcon
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const CompensationPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cmpRes, recRes] = await Promise.all([
        api.get('/internal/compensations/campaigns'),
        api.get('/internal/compensations/records')
      ]);

      if (cmpRes.data.success) {
        const cmpList = cmpRes.data.data || [];
        setCampaigns(cmpList);
        if (cmpList.length > 0 && !selectedCampaignId) {
          setSelectedCampaignId(cmpList[0].id);
        }
      }

      if (recRes.data.success) {
        setRecords(recRes.data.data || []);
      }
    } catch (err) {
      toast.error('Gagal mengambil data kompensasi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCampaign = async (campaignData) => {
    try {
      if (editingCampaign) {
        const res = await api.put(`/internal/compensations/campaigns/${editingCampaign.id}`, campaignData);
        if (res.data.success) {
          toast.success('Program kompensasi berhasil diperbarui');
        }
      } else {
        const res = await api.post('/internal/compensations/campaigns', campaignData);
        if (res.data.success) {
          toast.success('Program kompensasi baru berhasil dibuat');
          setSelectedCampaignId(res.data.data.id);
        }
      }
      fetchData();
    } catch (err) {
      toast.error('Gagal menyimpan program kompensasi');
    }
  };

  const handleDeleteCampaign = async (id, name) => {
    if (!window.confirm(`Hapus program kompensasi "${name}" beserta seluruh record penerimanya?`)) return;
    try {
      await api.delete(`/internal/compensations/campaigns/${id}`);
      toast.success('Program kompensasi berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus program kompensasi');
    }
  };

  const handleSaveRecord = async (recordData, proofFile) => {
    try {
      const formData = new FormData();
      Object.keys(recordData).forEach(key => {
        if (recordData[key] !== null && recordData[key] !== undefined) {
          formData.append(key, recordData[key]);
        }
      });
      if (proofFile) {
        formData.append('proof', proofFile);
      }

      if (editingRecord) {
        await api.put(`/internal/compensations/records/${editingRecord.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Record kompensasi diperbarui');
      } else {
        await api.post('/internal/compensations/records', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Penerima kompensasi ditambahkan');
      }
      fetchData();
    } catch (err) {
      toast.error('Gagal menyimpan record kompensasi');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Hapus record penerima kompensasi ini?')) return;
    try {
      await api.delete(`/internal/compensations/records/${id}`);
      toast.success('Record berhasil dihapus');
      fetchData();
    } catch (err) {
      toast.error('Gagal menghapus record');
    }
  };

  const handleToggleStatus = async (record) => {
    const nextStatus = record.payment_status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await api.put(`/internal/compensations/records/${record.id}`, {
        payment_status: nextStatus,
        payment_date: nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
      });
      toast.success(`Status pembayaran diubah ke ${nextStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Gagal merubah status');
    }
  };

  // Filtered records for selected campaign & search
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const activeRecords = records.filter(r => r.campaign_id === selectedCampaignId);

  const filteredRecords = activeRecords.filter(r => {
    const matchesSearch = !search || (
      (r.full_name && r.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (r.discord_username && r.discord_username.toLowerCase().includes(search.toLowerCase())) ||
      (r.roblox_username && r.roblox_username.toLowerCase().includes(search.toLowerCase()))
    );

    const matchesStatus = !statusFilter || String(r.payment_status).toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalAmount = activeRecords.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const completedAmount = activeRecords.filter(r => r.payment_status === 'Completed').reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const pendingCount = activeRecords.filter(r => r.payment_status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      {/* Main Content Area (Full Stretch Responsive) */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 w-full space-y-6">
        {/* Page Top Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-cyan-400" /> Modul Kompensasi AGCL
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Kelola daftar penerima kompensasi & status pencairan dana yang terhubung ke Master Member Directory.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={!selectedCampaignId}
              onClick={() => setIsExcelModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Import Excel (.xlsx)
            </button>

            <button
              type="button"
              onClick={() => { setEditingCampaign(null); setIsCampaignModalOpen(true); }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 text-cyan-400" /> Program Kompensasi Baru
            </button>

            <button
              type="button"
              disabled={!selectedCampaignId}
              onClick={() => { setEditingRecord(null); setIsRecordModalOpen(true); }}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> Tambah Penerima Member
            </button>
          </div>
        </div>

        {/* Educational Helper Banner */}
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 flex items-start gap-3 text-xs">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold text-cyan-300">
              💡 Apa itu Program Kompensasi?
            </p>
            <p className="text-slate-300 leading-relaxed">
              <strong>Program Kompensasi</strong> adalah wadah pengelompokan event kompensasi (contoh: <em>"AGCL Compensation"</em>, <em>"Anniversary Rewards"</em>). Pilih program di tab bawah ini, lalu tambahkan member penerima dari Master Directory.
            </p>
          </div>
        </div>

        {/* Program / Campaign Selector Tabs */}
        {campaigns.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
            {campaigns.map((cmp) => (
              <div key={cmp.id} className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedCampaignId(cmp.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    selectedCampaignId === cmp.id
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{cmp.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/60 font-mono">
                    {records.filter(r => r.campaign_id === cmp.id).length} Recs
                  </span>
                </button>

                {selectedCampaignId === cmp.id && (
                  <div className="flex items-center ml-1 space-x-1">
                    <button
                      type="button"
                      onClick={() => { setEditingCampaign(cmp); setIsCampaignModalOpen(true); }}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg"
                      title="Edit Program"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCampaign(cmp.id, cmp.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                      title="Hapus Program"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stat Summary Panel */}
        {selectedCampaign && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Anggaran Program</span>
              <span className="text-xl sm:text-2xl font-black text-white block">IDR {totalAmount.toLocaleString()}</span>
              <span className="text-xs text-slate-400 block">{activeRecords.length} Member Terdaftar</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">Total Sudah Ditransfer</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block">IDR {completedAmount.toLocaleString()}</span>
              <span className="text-xs text-slate-400 block">
                {activeRecords.filter(r => r.payment_status === 'Completed').length} Member Selesai
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/30 border border-amber-800/40 space-y-1">
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">Pending Transfer</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 block">{pendingCount} Record</span>
              <span className="text-xs text-slate-400 block">Sisa Anggaran: IDR {(totalAmount - completedAmount).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Filter & Search Toolbars */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, Discord, Roblox..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-bold focus:outline-none"
            >
              <option value="">Semua Status Transfer</option>
              <option value="Completed">Completed (Selesai)</option>
              <option value="Processing">Processing (Diproses)</option>
              <option value="Pending">Pending (Menunggu)</option>
            </select>
          </div>
        </div>

        {/* Table Records List */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-300 font-extrabold uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Nama Member</th>
                <th className="px-4 py-3.5">Discord Handle</th>
                <th className="px-4 py-3.5">Roblox Username</th>
                <th className="px-4 py-3.5">Nominal Hadiah</th>
                <th className="px-4 py-3.5">Status Transfer</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500 animate-pulse">
                    Memuat record kompensasi...
                  </td>
                </tr>
              ) : filteredRecords.length > 0 ? (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/80 transition-colors">
                    {/* Nama Member */}
                    <td className="px-4 py-3.5 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-slate-200 uppercase shrink-0">
                          {rec.avatar_url ? (
                            <img src={rec.avatar_url} alt={rec.full_name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            rec.full_name ? rec.full_name.charAt(0) : 'M'
                          )}
                        </div>
                        <span>{rec.full_name}</span>
                      </div>
                    </td>

                    {/* Discord Handle */}
                    <td className="px-4 py-3.5 font-mono font-bold text-indigo-300 whitespace-nowrap">
                      {rec.discord_username ? `@${rec.discord_username}` : '-'}
                    </td>

                    {/* Roblox Username */}
                    <td className="px-4 py-3.5 font-mono font-bold text-cyan-300 whitespace-nowrap">
                      {rec.roblox_username || '-'}
                    </td>

                    {/* Nominal Hadiah */}
                    <td className="px-4 py-3.5 font-black text-emerald-400 whitespace-nowrap">
                      IDR {Number(rec.amount || 0).toLocaleString()}
                    </td>

                    {/* Status Transfer */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(rec)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Klik untuk ubah status transfer"
                      >
                        {rec.payment_status === 'Completed' ? (
                          <span className="badge-status badge-status-success">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                          </span>
                        ) : rec.payment_status === 'Processing' ? (
                          <span className="badge-status badge-status-info">
                            <Clock className="w-3.5 h-3.5" /> Processing
                          </span>
                        ) : (
                          <span className="badge-status badge-status-warning">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => { setEditingRecord(rec); setIsRecordModalOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
                          title="Edit Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                          title="Hapus Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500 font-medium">
                    Belum ada record penerima kompensasi untuk program ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Campaign Modal */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        campaign={editingCampaign}
        onSave={handleSaveCampaign}
      />

      {/* Record Modal */}
      <RecordModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        record={editingRecord}
        campaignId={selectedCampaignId}
        defaultAmount={selectedCampaign?.default_amount || 50000}
        onSave={handleSaveRecord}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        campaignId={selectedCampaignId}
        campaignName={selectedCampaign?.name}
        onSuccess={fetchData}
      />
    </div>
  );
};
