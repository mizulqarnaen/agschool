import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { ArrearsModal } from '../components/arrears/ArrearsModal';
import api from '../services/api';
import {
  AlertCircle, Plus, Search, Filter, Edit, Trash2, CheckCircle2, Clock,
  Calendar, Users, ExternalLink, RefreshCw, Shield, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ArrearsPage = () => {
  const { t } = useTranslation();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total_amount: 0,
    total_juli: 0,
    total_agustus: 0,
    total_recipients: 0,
    pending_count: 0,
    processing_count: 0,
    paid_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchArrears();
  }, [search, statusFilter]);

  const fetchArrears = async () => {
    setLoading(true);
    try {
      const res = await api.get('/internal/arrears');
      if (res.data.success) {
        let list = res.data.data.records || [];
        setStats(res.data.data.stats || {});

        // Filter client side
        if (statusFilter) {
          list = list.filter(r => String(r.status || '').toLowerCase() === statusFilter.toLowerCase());
        }
        if (search.trim()) {
          const q = search.toLowerCase();
          list = list.filter(r =>
            (r.full_name || '').toLowerCase().includes(q) ||
            (r.discord_username || '').toLowerCase().includes(q) ||
            (r.roblox_username || '').toLowerCase().includes(q) ||
            (r.role || '').toLowerCase().includes(q)
          );
        }

        setRecords(list);
      }
    } catch (err) {
      toast.error('Gagal mengambil data tunggakan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus data tunggakan ${record.full_name}?`)) {
      return;
    }

    try {
      const res = await api.delete(`/internal/arrears/${record.id}`);
      if (res.data.success) {
        toast.success('Data tunggakan berhasil dihapus.');
        fetchArrears();
      }
    } catch (err) {
      toast.error('Gagal menghapus data tunggakan.');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Paid' || status === 'Completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas / Paid
        </span>
      );
    }
    if (status === 'Processing') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          <Clock className="w-3.5 h-3.5 animate-spin" /> Processing
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/30">
        <Clock className="w-3.5 h-3.5" /> Belum Dibayar
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-none">
          {/* Top Banner & Actions Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Transparansi Tunggakan Staff, Pengurus & Player</span>
              </div>
              <h1 className="text-2xl font-black text-white">Data Tunggakan AG School</h1>
              <p className="text-xs text-slate-400">
                Informasi daftar tunggakan honor pengurus, maintainer, staff, dan player yang belum dicairkan periode Juli - Agustus
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/compensation"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold text-xs flex items-center gap-2 transition-all"
              >
                <span>Lihat Portal Publik</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => {
                  setSelectedRecord(null);
                  setModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tunggakan Baru</span>
              </button>
            </div>
          </div>

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-900/60">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">Total Nominal Tunggakan</span>
              <div className="text-2xl font-black text-rose-500 mt-1">
                IDR {Number(stats.total_amount || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Juli: IDR {Number(stats.total_juli || 0).toLocaleString()} | Ags: IDR {Number(stats.total_agustus || 0).toLocaleString()}</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Member Terdampak</span>
              <div className="text-2xl font-black text-white mt-1">
                {stats.total_recipients || 0} Orang
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{stats.pending_count || 0} Belum Dibayar</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Tunggakan Bulan Juli</span>
              <div className="text-2xl font-black text-amber-500 mt-1">
                IDR {Number(stats.total_juli || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Periode Juli 2026</p>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">Tunggakan Bulan Agustus</span>
              <div className="text-2xl font-black text-rose-400 mt-1">
                IDR {Number(stats.total_agustus || 0).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Periode Agustus 2026</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, role/jabatan, atau username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-700 rounded-xl text-xs bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-700 rounded-xl text-xs bg-slate-950 text-slate-200 focus:outline-none"
              >
                <option value="">Semua Status Payout</option>
                <option value="Pending">● Belum Dibayar (Pending)</option>
                <option value="Processing">Diproses (Processing)</option>
                <option value="Paid">Lunas / Terbayar (Paid)</option>
              </select>
            </div>
          </div>

          {/* Arrears Data Table (Auto-Sorted by Highest Total Arrears) */}
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-950/90 shadow-xl">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] sm:text-xs uppercase font-extrabold bg-slate-900/90 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5 text-center w-14">Rank</th>
                  <th className="px-4 py-3.5">Nama Member / Staff</th>
                  <th className="px-4 py-3.5">Role / Jabatan</th>
                  <th className="px-4 py-3.5 text-right">Juli (Rp)</th>
                  <th className="px-4 py-3.5 text-right">Agustus (Rp)</th>
                  <th className="px-4 py-3.5 text-right">Total (Rp)</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Memuat data tunggakan...
                    </td>
                  </tr>
                ) : records.length > 0 ? (
                  records.map((record, idx) => (
                    <tr key={record.id || idx} className="hover:bg-slate-900/60 transition-colors">
                      <td className="px-4 py-4 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black shadow-md ${
                          idx === 0
                            ? 'bg-rose-600 text-white'
                            : idx === 1
                            ? 'bg-amber-600 text-white font-black'
                            : idx === 2
                            ? 'bg-amber-800 text-white font-black'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          #{idx + 1}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-extrabold">
                        <div className="text-white">{record.full_name}</div>
                        {(record.discord_username || record.roblox_username) && (
                          <div className="text-[11px] text-slate-400 font-normal flex items-center gap-2 mt-0.5">
                            {record.discord_username && <span>@{record.discord_username}</span>}
                            {record.roblox_username && <span>Roblox: {record.roblox_username}</span>}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 font-bold">
                        <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs border border-slate-700 bg-slate-900 text-cyan-300">
                          {record.role || 'Staff'}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-400">
                        {record.juli_amount > 0 ? `IDR ${record.juli_amount.toLocaleString()}` : '-'}
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-bold text-slate-400">
                        {record.agustus_amount > 0 ? `IDR ${record.agustus_amount.toLocaleString()}` : '-'}
                      </td>

                      <td className="px-4 py-4 text-right font-mono font-black text-rose-500 text-base">
                        IDR {Number(record.total_amount || 0).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>

                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRecord(record);
                              setModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Edit Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(record)}
                            className="p-1.5 rounded-lg border border-rose-900/60 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 transition-colors"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Belum ada data tunggakan yang dimasukkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <ArrearsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        record={selectedRecord}
        onSuccess={fetchArrears}
      />
    </div>
  );
};
