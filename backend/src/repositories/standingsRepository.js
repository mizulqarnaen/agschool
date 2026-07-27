import { JsonRepository } from './baseRepository.js';

export class StandingsRepository extends JsonRepository {
  constructor() {
    super('event_standings.json');
  }

  findByEventId(eventId) {
    const all = this.readAll();
    return all.filter(s => Number(s.event_id) === Number(eventId));
  }
}

export const standingsRepository = new StandingsRepository();
