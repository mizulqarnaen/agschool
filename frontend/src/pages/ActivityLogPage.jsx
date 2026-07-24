import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { History, Shield, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const ActivityLogPage = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/admin/logs');
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (_) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: t('date'),
      render: (row) => <span className="text-xs text-slate-400">{new Date(row.timestamp || row.created_at).toLocaleString()}</span>
    },
    {
      header: 'Aksi (Action)',
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {row.action}
        </span>
      )
    },
    { header: 'Modul', accessor: 'module', cellClassName: 'font-semibold text-white' },
    {
      header: 'Pengguna',
      render: (row) => row.user_id ? <span className="text-xs text-purple-400">User #{row.user_id}</span> : <span className="text-xs text-slate-500">System</span>
    },
    {
      header: 'Detail Aktivitas',
      render: (row) => (
        <span className="text-xs font-mono text-slate-300 line-clamp-1">
          {row.details_json || '-'}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-6 sm:p-8 lg:p-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
              <History className="w-7 h-7 text-cyan-400" />
              {t('logs')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Immutable security and operations audit log trail</p>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Logs
          </button>
        </div>

        <Table columns={columns} data={logs} loading={loading} emptyMessage="No activity logs recorded yet." />
      </main>
    </div>
  );
};
