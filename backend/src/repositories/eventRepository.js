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

    return events.sort((a, b) => {
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
