import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const EventFormModal = ({ isOpen, onClose, event, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Tournament',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    registration_status: 'Open',
    event_status: 'Scheduled',
    total_prize_pool: '',
    currency: 'IDR'
  });
  const [posterFile, setPosterFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        start_date: event.start_date,
        end_date: event.end_date,
        registration_status: event.registration_status,
        event_status: event.event_status,
        total_prize_pool: event.total_prize_pool,
        currency: event.currency || 'IDR'
      });
    } else if (isOpen) {
      setFormData({
        title: '',
        description: '',
        event_type: 'Tournament',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        registration_status: 'Open',
        event_status: 'Scheduled',
        total_prize_pool: '',
        currency: 'IDR'
      });
      // Automatically pull default reporting currency from system settings
      api.get('/internal/admin/settings').then(res => {
        if (res.data?.data?.default_currency) {
          setFormData(prev => ({ ...prev, currency: res.data.data.default_currency }));
        }
      }).catch(() => {});
    }
    setPosterFile(null);
  }, [event, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (event) {
        res = await api.put(`/internal/events/${event.id}`, formData);
      } else {
        res = await api.post('/internal/events', formData);
      }

      const savedEventId = event ? event.id : res.data.data.id;

      if (posterFile && savedEventId) {
        const data = new FormData();
        data.append('poster', posterFile);
        await api.post(`/internal/events/${savedEventId}/poster`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success(event ? 'Event updated successfully' : 'Event created successfully');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event ? t('edit_event') : t('create_event')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('event_title')} *</label>
          <input
            type="text"
            required
            placeholder="e.g. AG School Valorant Championship 2026"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('event_description')} *</label>
          <textarea
            rows="3"
            required
            placeholder="Event overview..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('event_type')} *</label>
          <select
            value={formData.event_type}
            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="Tournament">Tournament</option>
            <option value="Workshop">Workshop</option>
            <option value="Ceremony">Ceremony</option>
            <option value="Exhibition">Exhibition</option>
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('prize_pool_amount')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.total_prize_pool}
              onChange={(e) => setFormData({ ...formData, total_prize_pool: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('currency')}</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500 font-bold text-cyan-400"
            >
              <option value="IDR">IDR (Rupiah)</option>
              <option value="SGD">SGD (Dollar)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('start_date')} *</label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('end_date')} *</label>
            <input
              type="date"
              required
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('registration')}</label>
            <select
              value={formData.registration_status}
              onChange={(e) => setFormData({ ...formData, registration_status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Upcoming">Upcoming</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('status')}</label>
            <select
              value={formData.event_status}
              onChange={(e) => setFormData({ ...formData, event_status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Draft">Draft (Internal Only)</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">{t('poster_file')} (JPG / PNG / WEBP)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setPosterFile(e.target.files[0])}
            className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/20 file:text-cyan-400 hover:file:bg-cyan-500/30 cursor-pointer"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400 shadow-md glow-cyan disabled:opacity-50"
          >
            {loading ? '...' : t('save')}
          </button>
        </div>
      </form>
    </Modal>
  );
};
