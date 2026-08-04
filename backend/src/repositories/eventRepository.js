import { JsonRepository } from './baseRepository.js';

export class EventRepository extends JsonRepository {
  constructor() {
    super('events.json');
  }

  getPublicEvents(filters = {}) {
    let events = this.readAll();
    // Exclude Draft events from public visibility
    events = events.filter(e => e.event_status !== 'Draft');

    if (filters.status) {
      events = events.filter(e => e.event_status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.type) {
      events = events.filter(e => e.event_type.toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      events = events.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
    }

    const getStatusPriority = (status) => {
      const s = String(status || '').trim().toLowerCase();
      if (s === 'ongoing' || s === 'berlangsung') return 1;
      if (s === 'scheduled' || s === 'dijadwalkan') return 2;
      if (s === 'payment pending' || s === 'payment_pending' || s === 'pending') return 3;
      if (s === 'completed' || s === 'selesai') return 4;
      if (s === 'cancelled' || s === 'dibatalkan') return 5;
      return 6;
    };

    return events.sort((a, b) => {
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
  }
}

export const eventRepository = new EventRepository();
