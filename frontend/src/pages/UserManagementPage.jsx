import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { Modal } from '../components/common/Modal';
import { Shield, Plus, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const UserManagementPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role_id: 2
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (_) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/internal/admin/users', formData);
      toast.success('User account created');
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/internal/admin/users/${user.id}/status`, { status: newStatus });
      toast.success(`User marked as ${newStatus}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const columns = [
    { header: t('username'), accessor: 'username', cellClassName: 'font-bold text-white' },
    { header: t('full_name'), accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    {
      header: t('role'),
      render: (row) => (
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {row.role_slug || 'Role'}
        </span>
      )
    },
    {
      header: t('status'),
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
          row.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
        }`}>
          {row.status === 'active' ? (t('language') === 'Bahasa Indonesia' || t('language') === 'id' ? 'Aktif' : 'Active') : (t('language') === 'Bahasa Indonesia' || t('language') === 'id' ? 'Nonaktif' : 'Inactive')}
        </span>
      )
    },
    {
      header: t('actions'),
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
            row.status === 'active'
              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
          }`}
        >
          {row.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          {row.status === 'active' ? (t('language') === 'Bahasa Indonesia' || t('language') === 'id' ? 'Nonaktifkan' : 'Deactivate') : (t('language') === 'Bahasa Indonesia' || t('language') === 'id' ? 'Aktifkan' : 'Activate')}
        </button>
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
              <Shield className="w-7 h-7 text-cyan-400" />
              {t('users')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage system user access and role assignments (Admin / Finance / Secretary)</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('create_user')}
          </button>
        </div>

        <Table columns={columns} data={users} loading={loading} emptyMessage="No user accounts found." />

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('create_user')}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('username')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. john_finance"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('full_name')} *</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="john@agschool.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('role')} *</label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value={1}>Administrator (Full Access)</option>
                <option value={2}>Finance Team (Financials & Reports)</option>
                <option value={3}>Secretary (Events & Prizes)</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400"
              >
                {t('save')}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};
