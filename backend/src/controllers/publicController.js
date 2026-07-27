import { eventRepository } from '../repositories/eventRepository.js';
import { prizeRepository } from '../repositories/prizeRepository.js';
import { standingsRepository } from '../repositories/standingsRepository.js';
import { sortStandings, DEFAULT_POINT_SCHEMA } from '../services/standingsService.js';

export const getPublicEvents = (req, res) => {
  try {
    const { status, type, search } = req.query;
    const events = eventRepository.getPublicEvents({ status, type, search });
    
    // Attach prize count summary to each event
    const eventsWithPrizeCount = events.map(event => {
      const prizes = prizeRepository.getPrizesByEventId(event.id, true);
      const paidPrizes = prizes.filter(p => p.payment_status === 'Paid').length;
      return {
        ...event,
        prizes_count: prizes.length,
        paid_prizes_count: paidPrizes
      };
    });

    res.json({
      success: true,
      data: eventsWithPrizeCount
    });
  } catch (err) {
    console.error('Error fetching public events:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve public events.' });
  }
};

export const getPublicEventDetail = (req, res) => {
  try {
    const { id } = req.params;
    const event = eventRepository.findById(id);

    if (!event || event.event_status === 'Draft') {
      return res.status(404).json({ success: false, message: 'Public event not found.' });
    }

    const prizes = prizeRepository.getPrizesByEventId(event.id, true);

    res.json({
      success: true,
      data: {
        ...event,
        prizes
      }
    });
  } catch (err) {
    console.error('Error fetching event detail:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve event detail.' });
  }
};

export const getPublicEventStandings = (req, res) => {
  try {
    const { id } = req.params;
    const event = eventRepository.findById(id);

    if (!event || event.event_status === 'Draft') {
      return res.status(404).json({ success: false, message: 'Public event not found.' });
    }

    const leagueConfig = event.league_config || {
      is_league: !!event.is_league,
      max_finalists: 20,
      podium_count: 3,
      total_matches: 3,
      point_schema: DEFAULT_POINT_SCHEMA
    };

    const rawParticipants = standingsRepository.findByEventId(id);
    const standings = sortStandings(rawParticipants, leagueConfig.point_schema);

    res.json({
      success: true,
      data: {
        league_config: leagueConfig,
        standings
      }
    });
  } catch (err) {
    console.error('Error fetching public event standings:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve event standings.' });
  }
};
