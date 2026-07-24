import React, { useState } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { FileText, Download, FileSpreadsheet, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const ReportPage = () => {
  const { t } = useTranslation();
  const [reportType, setReportType] = useState('income');
  const [currencyDisplayMode, setCurrencyDisplayMode] = useState('both');

  // Date Period Filter State
  const [period, setPeriod] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);

  const fetchReportData = async () => {
    let endpoint = '';
    if (reportType === 'income') endpoint = '/internal/finance/incomes';
    else if (reportType === 'expense') endpoint = '/internal/finance/expenses';
    else if (reportType === 'payment') endpoint = '/internal/finance/payments';

    const response = await api.get(endpoint);
    if (!response.data.success || !response.data.data || response.data.data.length === 0) {
      toast.error('No records available to export.');
      return null;
    }

    let records = response.data.data;

    // Filter records by selected period / date range
    if (period !== 'all') {
      const now = new Date();
      let start = null;
      let end = null;

      if (period === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        start = todayStr;
        end = todayStr;
      } else if (period === 'month') {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        start = `${y}-${m}-01`;
        end = new Date(y, now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (period === 'year') {
        const y = now.getFullYear();
        start = `${y}-01-01`;
        end = `${y}-12-31`;
      } else if (period === 'custom') {
        start = startDate || '1970-01-01';
        end = endDate || '2099-12-31';
      }

      records = records.filter(item => {
        const rawDate = item.transaction_date || item.payment_date || (item.created_at ? item.created_at.split('T')[0] : '');
        if (!rawDate) return true;
        if (start && rawDate < start) return false;
        if (end && rawDate > end) return false;
        return true;
      });
    }

    if (records.length === 0) {
      toast.error('Tidak ada data transaksi pada periode tanggal yang dipilih.');
      return null;
    }

    // Format export rows based on currencyDisplayMode
    return records.map(item => {
      const baseRow = {
        'ID': item.id,
        'Date': item.transaction_date || item.payment_date || (item.created_at ? item.created_at.split('T')[0] : ''),
        'Category': item.category || item.payment_category || '',
        'Description / Recipient': item.description || item.source || item.member_name || ''
      };

      if (currencyDisplayMode === 'original') {
        baseRow['Original Amount'] = Number(item.amount || 0);
        baseRow['Original Currency'] = item.currency || 'IDR';
      } else if (currencyDisplayMode === 'base') {
        baseRow['Base Amount (IDR)'] = Number(item.base_amount_idr || item.amount || 0);
      } else {
        // Dual / Both
        baseRow['Original Amount'] = Number(item.amount || 0);
        baseRow['Original Currency'] = item.currency || 'IDR';
        baseRow['Exchange Rate Used'] = Number(item.exchange_rate_used || 11800);
        baseRow['Base Amount (IDR)'] = Number(item.base_amount_idr || item.amount || 0);
      }

      return baseRow;
    });
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const records = await fetchReportData();
      if (!records) return;

      const worksheet = XLSX.utils.json_to_sheet(records);

      // Auto-calculate column widths
      const colWidths = Object.keys(records[0]).map(key => {
        const maxLength = Math.max(
          key.length,
          ...records.map(r => String(r[key] !== undefined ? r[key] : '').length)
        );
        return { wch: Math.min(Math.max(maxLength + 3, 12), 40) };
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      const sheetName = `${reportType.toUpperCase()} Report`;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const filename = `ag_school_${reportType}_report_${period}_${currencyDisplayMode}.xlsx`;
      XLSX.writeFile(workbook, filename);
      toast.success(`Exported ${records.length} records to native Excel (${filename})`);
    } catch (err) {
      console.error('Excel Export Error:', err);
      toast.error('Failed to export Excel spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const records = await fetchReportData();
      if (!records) return;

      const keys = Object.keys(records[0]);
      const csvRows = [
        keys.join(','),
        ...records.map(row => keys.map(k => `"${String(row[k] !== undefined ? row[k] : '').replace(/"/g, '""')}"`).join(','))
      ].join('\r\n');

      // Add UTF-8 BOM so Excel opens CSV in separate columns natively
      const blob = new Blob(['\uFEFF' + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const filename = `ag_school_${reportType}_report_${period}_${currencyDisplayMode}.csv`;
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${records.length} records to CSV (${filename})`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 sm:p-8 lg:p-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-cyan-400" />
              {t('reports')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Export structured financial datasets directly to Native Excel (.xlsx) or CSV</p>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl max-w-2xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white mb-2">Financial Report Exporter</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">{t('category')} Dataset</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-semibold"
              >
                <option value="income">{t('incomes')}</option>
                <option value="expense">{t('expenses')}</option>
                <option value="payment">{t('payments')}</option>
              </select>
            </div>

            {/* Date Period Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">Periode Tanggal Export</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-cyan-300 font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Semua Waktu (All Time)</option>
                <option value="today">Hari Ini (Today)</option>
                <option value="month">Bulan Ini (This Month)</option>
                <option value="year">Tahun Ini (This Year)</option>
                <option value="custom">Rentang Custom (Custom Range)</option>
              </select>
            </div>

            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">{t('currency')} Format Mode</label>
              <select
                value={currencyDisplayMode}
                onChange={(e) => setCurrencyDisplayMode(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="both">Dual Display (Original Currency & Converted Base IDR)</option>
                <option value="original">Original Transaction Currency Only</option>
                <option value="base">Converted Base Currency (IDR) Only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
            {/* Primary Excel Button */}
            <button
              onClick={handleExportExcel}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-5 h-5" />
              {loading ? '...' : 'Export Native Excel (.xlsx)'}
            </button>

            {/* CSV Backup Button */}
            <button
              onClick={handleExportCSV}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {t('export_csv')} (.csv)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
