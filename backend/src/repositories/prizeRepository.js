import { JsonRepository } from './baseRepository.js';

export class PrizeRepository extends JsonRepository {
  constructor() {
    super('prizes.json');
  }

  getPrizesByEventId(eventId, isPublic = true) {
    const prizes = this.readAll();
    const eventPrizes = prizes.filter(p => p.event_id === Number(eventId));

    if (isPublic) {
      // Strip internal notes for public safety
      return eventPrizes.map(({ internal_notes, ...publicPrize }) => publicPrize);
    }
    return eventPrizes;
  }
}

export const prizeRepository = new PrizeRepository();
