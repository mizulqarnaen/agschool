import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ExcelImportModal = ({ isOpen, onClose, campaignId, campaignName, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [parsedRecords, setParsedRecords] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });

        // Map column headers flexibly matching user screenshot
        const mapped = rawJson.map((row) => {
          // Helper parser for keys case-insensitive
          const getVal = (possibleKeys) => {
            for (const key of Object.keys(row)) {
              const cleanKey = key.trim().toLowerCase();
              if (possibleKeys.some(pk => cleanKey.includes(pk.toLowerCase()))) {
                return row[key];
              }
            }
            return '';
          };

          const discord_username = String(getVal(['NAMA DC', 'DISCORD', 'DC']) || '').trim().replace(/^@/, '');
          const roblox_username = String(getVal(['USN ROBLOX', 'ROBLOX', 'USN']) || '').trim();
          const rawAmount = getVal(['Harga (Rp)', 'IDR', 'HARGA', 'NOMINAL']);
          
          // Parse amount cleaning IDR / Rp formatting
          let amount = 50000;
          if (typeof rawAmount === 'number') {
            amount = rawAmount;
          } else if (rawAmount) {
            const cleanNum = String(rawAmount).replace(/[^0-9]/g, '');
            if (cleanNum) amount = parseInt(cleanNum, 10);
          }

          const rawStatus = String(getVal(['Status', 'STATUS']) || '').trim().toUpperCase();
          let payment_status = 'Pending';
          if (rawStatus.includes('PEND') || rawStatus.includes('UNPAID')) {
            payment_status = 'Pending';
          } else if (rawStatus.includes('COMP') || rawStatus.includes('PAID') || rawStatus.includes('DONE')) {
            payment_status = 'Completed';
          } else if (rawStatus.includes('PROC')) {
            payment_status = 'Processing';
          }

          const notes = String(getVal(['Katerangan', 'Keterangan', 'Rekening', 'NOTES']) || '').trim();
          const rekening = String(getVal(['Rekening']) || '').trim();
          const accept_status = String(getVal(['Accept']) || '').trim();

          return {
            campaign_id: campaignId,
            discord_username,
            roblox_username,
            full_name: discord_username || roblox_username || 'Member Komunitas',
            amount,
            payment_status,
            rekening,
            notes,
            accept_status
          };
        });

        // Filter out completely empty rows
        const validRecords = mapped.filter(r => r.discord_username || r.roblox_username || r.amount > 0);
        setParsedRecords(validRecords);
        toast.success(`Berhasil mengurai ${validRecords.length} baris data dari Excel!`);
      } catch (err) {
        console.error(err);
        toast.error('Gagal membaca file Excel. Pastikan format file valid (.xlsx / .csv)');
      } finally {
        setParsing(false);
      }
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'NO': 1,
        'TANGGAL': '2026-08-07',
        'NAMA DC': 'raziraaa_51553',
        'USN ROBLOX': 'liaaaauuuuuu4',
        'Katerangan': 'Kompensasi AGCL',
        'Harga (Rp)': 'Rp50.000',
        'IDR': 50000,
        'Singapore Dollar': '$3,60',
        'Rekening': 'BCA 12345678',
        'Status': 'PENDING',
        'Accept': 'YES'
      },
      {
        'NO': 2,
        'TANGGAL': '2026-08-07',
        'NAMA DC': 'achaaaa019',
        'USN ROBLOX': 'Aca200607',
        'Katerangan': 'Kompensasi AGCL',
        'Harga (Rp)': 'Rp50.000',
        'IDR': 50000,
        'Singapore Dollar': '$3,60',
        'Rekening': 'DANA 0812345678',
        'Status': 'COMPLETED',
        'Accept': 'YES'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Kompensasi');
    XLSX.writeFile(wb, 'template_kompensasi_agcl.xlsx');
  };

  const handleSubmitImport = async () => {
    if (parsedRecords.length === 0) return toast.error('Tidak ada baris data valid untuk di-import');
    setSubmitting(true);
    try {
      const res = await api.post('/internal/compensations/records/bulk', {
        records: parsedRecords
      });

      if (res.data.success) {
        toast.success(`Berhasil meng-import ${parsedRecords.length} record kompensasi!`);
        onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error('Gagal meng-import data kompensasi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              Import Data Kompensasi dari Excel (.xlsx / .csv)
            </h2>
            <p className="text-xs text-slate-400">
              Program: <strong className="text-cyan-400">{campaignName || 'AGCL Compensation'}</strong>
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Upload Area & Sample Template Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Drop Area */}
            <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-2xl p-6 text-center bg-slate-950/60 transition-colors flex flex-col items-center justify-center space-y-2">
              <Upload className="w-8 h-8 text-cyan-400 animate-bounce" />
              <div className="space-y-1">
                <p className="font-bold text-white">Pilih atau Drag File Excel</p>
                <p className="text-[11px] text-slate-400">Format didukung: .xlsx, .xls, .csv</p>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="mt-2 inline-block px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black cursor-pointer shadow-sm transition-all"
              >
                {file ? file.name : 'Pilih File Spreadsheet'}
              </label>
            </div>

            {/* Template Download & Column Mapping Guide */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-200">Panduan Kolom Excel</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download Template (.xlsx)
                </button>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <p>Header kolom otomatis terdeteksi dari Excel Anda:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-300">
                  <li><strong>NAMA DC</strong> ➔ Username Discord</li>
                  <li><strong>USN ROBLOX</strong> ➔ Username Roblox</li>
                  <li><strong>Harga (Rp) / IDR</strong> ➔ Nominal Kompensasi</li>
                  <li><strong>Status</strong> ➔ PENDING / COMPLETED / PROCESSING</li>
                  <li><strong>Rekening / Katerangan</strong> ➔ Catatan Transfer</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          {parsing ? (
            <div className="text-center py-10 text-slate-400 animate-pulse font-semibold">
              Mengurai data dari file Excel...
            </div>
          ) : parsedRecords.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-white text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Pratinjau Data ({parsedRecords.length} Baris Siap Di-import)
                </span>
                <span className="text-[11px] text-slate-400">Penerima disimpan sebagai Free-Text & Auto-Matched ke Member jika ada</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-60">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-950 text-slate-300 uppercase font-extrabold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">Nama DC (Discord)</th>
                      <th className="px-3 py-2">USN Roblox</th>
                      <th className="px-3 py-2">Nominal (IDR)</th>
                      <th className="px-3 py-2">Status Transfer</th>
                      <th className="px-3 py-2">Catatan / Rekening</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900">
                    {parsedRecords.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/60">
                        <td className="px-3 py-2 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono font-bold text-indigo-300">{r.discord_username || '-'}</td>
                        <td className="px-3 py-2 font-mono font-bold text-cyan-300">{r.roblox_username || '-'}</td>
                        <td className="px-3 py-2 font-black text-emerald-400">IDR {Number(r.amount).toLocaleString()}</td>
                        <td className="px-3 py-2 font-bold">{r.payment_status}</td>
                        <td className="px-3 py-2 text-slate-400 truncate max-w-xs">{r.notes || r.rekening || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedRecords.length === 0 || submitting}
            onClick={handleSubmitImport}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Proses Import ({parsedRecords.length} Data)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
