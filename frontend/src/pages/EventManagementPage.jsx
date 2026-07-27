import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sidebar } from '../components/common/Sidebar';
import { Table } from '../components/common/Table';
import { EventFormModal } from '../components/events/EventFormModal';
import { PrizeModal } from '../components/events/PrizeModal';
import { LeagueStandingsModal } from '../components/events/LeagueStandingsModal';
import { Plus, Calendar, Trophy, Trash2, Edit, Award, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const EventManagementPage = () => {
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [standingsModalOpen, setStandingsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/internal/events');
      if (response.data.success) {
        setEvents(response.data.data);
      }
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedEvent(null);
    setFormModalOpen(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setFormModalOpen(true);
  };

  const handleManagePrizes = (event) => {
    setSelectedEvent(event);
    setPrizeModalOpen(true);
  };

  const handleManageStandings = (event) => {
    setSelectedEvent(event);
    setStandingsModalOpen(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event record?')) return;
    try {
      await api.delete(`/internal/events/${eventId}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const columns = [
    {
      header: t('event_title'),
      render: (row) => (
        <div>
          <div className="font-bold text-white text-sm flex items-center gap-2">
            <span>{row.title}</span>
            {row.is_league && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                ⚡ Sistem Poin Liga
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400 truncate max-w-xs">{row.description}</div>
        </div>
      )
    },
    {
      header: t('event_type'),
      render: (row) => (
        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-semibold">
          {row.event_type}
        </span>
      )
    },
    {
      header: 'Dates',
      render: (row) => (
        <div className="text-xs text-slate-300 font-mono">
          {row.start_date} <span className="text-slate-500">to</span> {row.end_date}
        </div>
      )
    },
    {
      header: t('status'),
      render: (row) => (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
          row.event_status === 'Completed'
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            : row.event_status === 'Ongoing'
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {row.event_status}
        </span>
      )
    },
    {
      header: 'Poster',
      render: (row) => row.poster_url ? (
        <span className="text-xs text-emerald-400 font-semibold">Ada Poster</span>
      ) : (
        <span className="text-xs text-slate-500">Tanpa Poster</span>
      )
    },
    {
      header: t('prize_pool'),
      render: (row) => (
        <span className="font-bold text-amber-300">
          {row.currency || 'IDR'} {Number(row.total_prize_pool || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: t('actions'),
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.is_league && (
            <button
              onClick={() => handleManageStandings(row)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 rounded-lg border border-purple-500/30 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Poin Liga
            </button>
          )}
          <button
            onClick={() => handleManagePrizes(row)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" />
            {t('manage_prizes')}
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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
              <Calendar className="w-7 h-7 text-cyan-400" />
              {t('events')}
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage community events, upload promotional posters, and update prize payment statuses</p>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg glow-cyan transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('create_event')}
          </button>
        </div>

        <Table columns={columns} data={events} loading={loading} emptyMessage="No events found." />

        <EventFormModal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          event={selectedEvent}
          onSave={fetchEvents}
        />

        <PrizeModal
          isOpen={prizeModalOpen}
          onClose={() => setPrizeModalOpen(false)}
          event={selectedEvent}
        />

        <LeagueStandingsModal
          isOpen={standingsModalOpen}
          onClose={() => setStandingsModalOpen(false)}
          event={selectedEvent}
          onStandingsUpdated={fetchEvents}
        />
      </main>
    </div>
  );
};
