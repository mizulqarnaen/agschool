import React, { useState, useEffect } from 'react';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { TikTokIcon, DiscordIcon } from '../components/common/SocialIcons';
import {
  Search, ShieldCheck, CheckCircle2, Clock, Filter,
  ChevronLeft, ChevronRight, Gamepad2, ArrowUpRight, Award, DollarSign, Loader2,
  Users, AlertCircle, AlertTriangle, FileText, Calendar, Trophy
} from 'lucide-react';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export const PublicCompensation = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Active Tab state synced with URL ?tab= (defaults to 'tunggakan')
  const paramTab = searchParams.get('tab');
  const activeTab = paramTab === 'kompensasi' ? 'kompensasi' : 'tunggakan';

  const setActiveTab = (tabKey) => {
    setSearchParams({ tab: tabKey });
  };

  // Arrears Data State (Tab 1)
  const [arrearsRecords, setArrearsRecords] = useState([]);
  const [arrearsStats, setArrearsStats] = useState({
    total_amount: 0,
    total_juli: 0,
    total_agustus: 0,
    total_recipients: 0,
    pending_count: 0,
    processing_count: 0,
    paid_count: 0
  });
  const [arrearsSearch, setArrearsSearch] = useState('');
  const [arrearsStatusFilter, setArrearsStatusFilter] = useState('');
  const [arrearsPagination, setArrearsPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    limit: 25
  });
  const [arrearsLoading, setArrearsLoading] = useState(true);

  // Compensation Data State (Tab 2)
  const [compRecords, setCompRecords] = useState([]);
  const [compStats, setCompStats] = useState({
    total_recipients: 0,
    completed_count: 0,
    pending_count: 0,
    processing_count: 0,
    total_amount: 0
  });
  const [compSearch, setCompSearch] = useState('');
  const [compStatusFilter, setCompStatusFilter] = useState('');
  const [compPagination, setCompPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    limit: 12
  });
  const [compLoading, setCompLoading] = useState(false);

  // Load Arrears data on mount or when filters/page change
  useEffect(() => {
    fetchArrearsData();
  }, [arrearsSearch, arrearsStatusFilter, arrearsPagination.current_page]);

  // Load Compensation data
  useEffect(() => {
    if (activeTab === 'kompensasi') {
      fetchCompensationData();
    }
  }, [activeTab, compSearch, compStatusFilter, compPagination.current_page]);

  const fetchArrearsData = async () => {
    setArrearsLoading(true);
    try {
      const res = await api.get('/public/arrears', {
        params: {
          search: arrearsSearch,
          status: arrearsStatusFilter,
          page: arrearsPagination.current_page,
          limit: arrearsPagination.limit
        }
      });
      if (res.data.success) {
        setArrearsRecords(res.data.data.records || []);
        setArrearsStats(res.data.data.stats || {});
        if (res.data.data.pagination) {
          setArrearsPagination(res.data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error loading public arrears:', err);
    } finally {
      setArrearsLoading(false);
    }
  };

  const handleArrearsPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (arrearsPagination.total_pages || 1) && newPage !== arrearsPagination.current_page) {
      setArrearsPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  const fetchCompensationData = async () => {
    setCompLoading(true);
    try {
      const res = await api.get('/public/compensations', {
        params: {
          search: compSearch,
          status: compStatusFilter,
          page: compPagination.current_page,
          limit: compPagination.limit
        }
      });

      if (res.data.success) {
        setCompRecords(res.data.data.records || []);
        setCompStats(res.data.data.stats || {});
        if (res.data.data.pagination) {
          setCompPagination(res.data.data.pagination);
        }
      }
    } catch (err) {
      console.error('Error loading public compensations:', err);
    } finally {
      setCompLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (compPagination.total_pages || 1) && newPage !== compPagination.current_page) {
      setCompPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed' || status === 'Paid') {
      return (
        <span className="badge-status badge-status-success">
          <CheckCircle2 className="w-3.5 h-3.5" /> Lunas / Terbayar
        </span>
      );
    }
    if (status === 'Processing') {
      return (
        <span className="badge-status badge-status-info">
          <Clock className="w-3.5 h-3.5 animate-spin" /> Diproses
        </span>
      );
    }
    return (
      <span className="badge-status badge-status-warning">
        <Clock className="w-3.5 h-3.5" /> Belum Dibayar
      </span>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      <PublicNavbar />

      {/* Hero Section */}
      <section className={`border-b py-8 sm:py-12 relative overflow-hidden ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-4 mb-8">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs ${
              isDark ? 'bg-rose-950/80 border border-rose-800 text-rose-300' : 'bg-rose-100 border border-rose-300 text-rose-900'
            }`}>
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
              <span>Transparansi Publik & Hak Komunitas</span>
            </div>

            <h1 className={`text-3xl sm:text-5xl font-black tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {activeTab === 'tunggakan' ? 'Data Tunggakan AG School' : (activeTab === 'kompensasi' ? 'Portal Kompensasi AGCL' : 'Portal Resmi AG School')}
            </h1>

            <p className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {activeTab === 'tunggakan'
                ? 'Informasi daftar tunggakan honor pengurus, maintainer, staff, dan player yang belum dicairkan periode Juli - Agustus'
                : 'Portal transparansi verifikasi pencairan kompensasi publik AG School.'}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* TAB 1: DATA TUNGGAKAN PAYOUT */}
        {activeTab === 'tunggakan' && (
          <div className="space-y-8">
            {/* Top Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Nominal Tunggakan */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-rose-950/40 border-rose-900/60' : 'bg-rose-50 border-rose-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">Total Nominal Tunggakan</span>
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-500">
                  IDR {Number(arrearsStats.total_amount || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Akumulasi Juli & Agustus</p>
              </div>

              {/* Card 2: Total Member / Staff / Player Terdampak */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Penerima Terdampak (Staff/Player)</span>
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {arrearsStats.total_recipients || 0} Orang
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{arrearsStats.pending_count || 0} Belum Dibayar</p>
              </div>

              {/* Card 3: Tunggakan Bulan Juli */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Tunggakan Bulan Juli</span>
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-500">
                  IDR {Number(arrearsStats.total_juli || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Periode Juli 2026</p>
              </div>

              {/* Card 4: Tunggakan Bulan Agustus */}
              <div className={`p-5 rounded-3xl border transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400">Tunggakan Bulan Agustus</span>
                  <Calendar className="w-5 h-5 text-rose-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-400">
                  IDR {Number(arrearsStats.total_agustus || 0).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Periode Agustus 2026</p>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau role/jabatan..."
                  value={arrearsSearch}
                  onChange={(e) => setArrearsSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:border-rose-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-rose-600'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={arrearsStatusFilter}
                  onChange={(e) => setArrearsStatusFilter(e.target.value)}
                  className={`px-3 py-2 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                  }`}
                >
                  <option value="">Semua Status Payout</option>
                  <option value="Pending">● Belum Dibayar (Pending)</option>
                  <option value="Processing">Diproses (Processing)</option>
                  <option value="Paid">Lunas / Terbayar (Paid)</option>
                </select>
              </div>
            </div>

            {/* Arrears Data Table (Sorted by Highest Total Arrears Descending) */}
            <div className={`overflow-x-auto rounded-3xl border shadow-xl ${
              isDark ? 'border-slate-800 bg-slate-950/90' : 'border-slate-200 bg-white'
            }`}>
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className={`text-[11px] sm:text-xs uppercase font-extrabold border-b ${
                  isDark ? 'bg-slate-900/90 text-slate-300 border-slate-800' : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  <tr>
                    <th className="px-4 py-3.5 text-center w-14">Rank</th>
                    <th className="px-4 py-3.5">Nama Member / Staff</th>
                    <th className="px-4 py-3.5">Role / Jabatan</th>
                    <th className="px-4 py-3.5 text-right">Juli (Rp)</th>
                    <th className="px-4 py-3.5 text-right">Agustus (Rp)</th>
                    <th className="px-4 py-3.5 text-right">Total (Rp)</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                  {arrearsLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                        <span>Memuat data tunggakan...</span>
                      </td>
                    </tr>
                  ) : arrearsRecords.length > 0 ? (
                    arrearsRecords.map((record, idx) => (
                      <tr key={record.id || idx} className={`transition-colors ${
                        isDark ? 'hover:bg-slate-900/60' : 'hover:bg-slate-50'
                      }`}>
                        {/* Rank / No */}
                        <td className="px-4 py-4 text-center font-bold">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-xl text-xs font-black shadow-md ${
                            idx === 0
                              ? 'bg-rose-600 text-white glow-rose'
                              : idx === 1
                              ? 'bg-amber-600 text-white font-black'
                              : idx === 2
                              ? 'bg-amber-800 text-white font-black'
                              : (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')
                          }`}>
                            #{idx + 1}
                          </span>
                        </td>

                        {/* Nama Member / Staff / Player */}
                        <td className="px-4 py-4 font-extrabold">
                          <div className={isDark ? 'text-white' : 'text-slate-900'}>
                            {record.full_name}
                          </div>
                        </td>

                        {/* Role / Jabatan Column */}
                        <td className="px-4 py-4 font-bold">
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs border font-bold ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 text-cyan-300'
                              : 'bg-slate-100 border-slate-300 text-slate-800'
                          }`}>
                            {record.role || 'Staff'}
                          </span>
                        </td>

                        {/* Juli (Rp) */}
                        <td className="px-4 py-4 text-right font-mono font-bold text-slate-400">
                          {record.juli_amount > 0 ? `IDR ${record.juli_amount.toLocaleString()}` : '-'}
                        </td>

                        {/* Agustus (Rp) */}
                        <td className="px-4 py-4 text-right font-mono font-bold text-slate-400">
                          {record.agustus_amount > 0 ? `IDR ${record.agustus_amount.toLocaleString()}` : '-'}
                        </td>

                        {/* Total (Rp) */}
                        <td className="px-4 py-4 text-right font-mono font-black text-rose-500 text-base">
                          IDR {Number(record.total_amount || 0).toLocaleString()}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4 text-center whitespace-nowrap">
                          {getStatusBadge(record.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Tidak ada data tunggakan yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Bar for Arrears Tab */}
            {arrearsPagination.total_pages > 1 && (
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                {/* Page Info Counter */}
                <div className="text-xs text-slate-400 font-medium text-center sm:text-left">
                  Menampilkan halaman <strong className="text-white">{arrearsPagination.current_page}</strong> dari <strong className="text-white">{arrearsPagination.total_pages}</strong> (Total <strong className="text-white">{arrearsPagination.total_items}</strong> data tunggakan)
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Page Numbers Strip */}
                  <div className="flex items-center justify-center gap-1 overflow-x-auto max-w-full py-1">
                    {Array.from({ length: arrearsPagination.total_pages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleArrearsPageChange(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          pageNum === arrearsPagination.current_page
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                            : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Prev & Next Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      type="button"
                      disabled={arrearsPagination.current_page <= 1}
                      onClick={() => handleArrearsPageChange(arrearsPagination.current_page - 1)}
                      className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        arrearsPagination.current_page <= 1
                          ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                          : isDark ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Sebelumnya</span>
                    </button>

                    <button
                      type="button"
                      disabled={arrearsPagination.current_page >= arrearsPagination.total_pages}
                      onClick={() => handleArrearsPageChange(arrearsPagination.current_page + 1)}
                      className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        arrearsPagination.current_page >= arrearsPagination.total_pages
                          ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                          : isDark ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KOMPENSASI AGCL */}
        {activeTab === 'kompensasi' && (
          <div className="space-y-8">
            {/* Summary Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className={`p-5 rounded-2xl border text-center space-y-1 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Penerima</span>
                <div className={`text-2xl sm:text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {compStats.total_recipients || 0} Member
                </div>
              </div>

              <div className={`p-5 rounded-2xl border text-center space-y-1 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">Selesai / Terbayar</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {compStats.completed_count || 0} Penerima
                </div>
              </div>

              <div className={`p-5 rounded-2xl border text-center space-y-1 transition-all ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Pending / Belum</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-400">
                  {compStats.pending_count || 0} Penerima
                </div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}>
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Username Discord atau Roblox..."
                  value={compSearch}
                  onChange={(e) => setCompSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <select
                value={compStatusFilter}
                onChange={(e) => setCompStatusFilter(e.target.value)}
                className={`px-3 py-2 border rounded-xl text-xs sm:text-sm font-medium focus:outline-none ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                <option value="">Semua Status Kompensasi</option>
                <option value="Completed">Selesai (Completed)</option>
                <option value="Processing">Diproses (Processing)</option>
                <option value="Pending">Belum Dibayar (Pending)</option>
              </select>
            </div>

            {/* Compensation Cards Grid */}
            {compLoading ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
                <span>Memuat data kompensasi...</span>
              </div>
            ) : compRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {compRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`p-6 rounded-3xl border space-y-4 transition-all ${
                      isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-extrabold text-sm text-cyan-400">
                        {record.discord_username ? `@${record.discord_username}` : (record.full_name || 'Recipient')}
                      </div>
                      {getStatusBadge(record.status)}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Nominal Kompensasi</div>
                      <div className="text-xl font-black text-emerald-400">
                        {record.currency || 'IDR'} {Number(record.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                Tidak ada data kompensasi yang ditemukan.
              </div>
            )}

            {/* Pagination Controls Bar for Compensation Tab */}
            {compPagination.total_pages > 1 && (
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 ${
                isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                {/* Page Info Counter */}
                <div className="text-xs text-slate-400 font-medium text-center sm:text-left">
                  Menampilkan halaman <strong className="text-white">{compPagination.current_page}</strong> dari <strong className="text-white">{compPagination.total_pages}</strong> (Total <strong className="text-white">{compPagination.total_items}</strong> penerima)
                </div>

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  {/* Page Numbers Strip */}
                  <div className="flex items-center justify-center gap-1 overflow-x-auto max-w-full py-1">
                    {Array.from({ length: compPagination.total_pages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                          pageNum === compPagination.current_page
                            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                            : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Prev & Next Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <button
                      type="button"
                      disabled={compPagination.current_page <= 1}
                      onClick={() => handlePageChange(compPagination.current_page - 1)}
                      className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        compPagination.current_page <= 1
                          ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                          : isDark ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Sebelumnya</span>
                    </button>

                    <button
                      type="button"
                      disabled={compPagination.current_page >= compPagination.total_pages}
                      onClick={() => handlePageChange(compPagination.current_page + 1)}
                      className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        compPagination.current_page >= compPagination.total_pages
                          ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                          : isDark ? 'border-slate-700 bg-slate-900 text-white hover:bg-slate-800' : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
