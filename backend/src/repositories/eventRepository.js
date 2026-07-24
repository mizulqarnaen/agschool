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

    return events.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
  }
}

export const eventRepository = new EventRepository();
