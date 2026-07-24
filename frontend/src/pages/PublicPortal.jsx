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
        setEvents(response.data.data);
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
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Community Transparency Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent mb-6">
            AG School Event
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Welcome to the public transparency portal. Here you can explore community events, view tournament posters, check official winner rosters, and inspect real-time prize payment statuses.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search event title or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors"
            >
              <option value="">All Event Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
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
