import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PublicNavbar } from '../components/public/PublicNavbar';
import { PublicFooter } from '../components/public/PublicFooter';
import { EventCard } from '../components/public/EventCard';
import { Search, Filter, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export const PublicPortal = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPublicEvents();
  }, [search, statusFilter]);

  const fetchPublicEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/public/events', {
        params: { search, status: statusFilter }
      });
      if (response.data.success) {
        const rawEvents = response.data.data || [];
        const getStatusPriority = (status) => {
          const s = String(status || '').trim().toLowerCase();
          if (s === 'ongoing' || s === 'berlangsung') return 1;
          if (s === 'scheduled' || s === 'dijadwalkan') return 2;
          if (s === 'payment pending' || s === 'payment_pending' || s === 'pending') return 3;
          if (s === 'completed' || s === 'selesai') return 4;
          if (s === 'cancelled' || s === 'dibatalkan') return 5;
          return 6;
        };

        const sortedEvents = [...rawEvents].sort((a, b) => {
          const prioA = getStatusPriority(a.event_status);
          const prioB = getStatusPriority(b.event_status);
          if (prioA !== prioB) return prioA - prioB;

          const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
          const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
          if (dateB !== dateA) return dateB - dateA;

          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          if (timeB !== timeA) return timeB - timeA;

          return (b.id || 0) - (a.id || 0);
        });

        setEvents(sortedEvents);
      }
    } catch (err) {
      console.error('Failed to load public events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <PublicNavbar />

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-4 sm:mb-6">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Portal Resmi Acara AG School</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
            AG School Event & Turnamen
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Selamat datang di Portal Resmi Acara AG School. Temukan informasi acara komunitas, poster turnamen, status pendaftaran, klasemen poin liga, dan daftar pemenang resmi.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16">
        {/* Search & Filter Bar */}
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl mb-8 sm:mb-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama event atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors font-semibold"
            >
              <option value="">Semua Status Event</option>
              <option value="Scheduled">Dijadwalkan</option>
              <option value="Ongoing">Berlangsung</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Completed">Selesai</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-2xl h-96 animate-pulse p-6">
                <div className="w-full h-40 bg-slate-800/60 rounded-xl mb-4" />
                <div className="w-3/4 h-6 bg-slate-800/60 rounded mb-2" />
                <div className="w-1/2 h-4 bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-16 text-center max-w-md mx-auto my-12">
            <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4 stroke-1" />
            <h3 className="text-xl font-bold text-white mb-2">No Events Found</h3>
            <p className="text-sm text-slate-400">
              There are currently no public events matching your search criteria.
            </p>
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};
