import { eventRepository } from '../repositories/eventRepository.js';
import { prizeRepository } from '../repositories/prizeRepository.js';
import { expenseRepository } from '../repositories/expenseRepository.js';
import { standingsRepository } from '../repositories/standingsRepository.js';
import { sortStandings, DEFAULT_POINT_SCHEMA } from '../services/standingsService.js';
import { loggerService } from '../services/loggerService.js';
import { currencyService } from '../services/currencyService.js';

// Helper to auto-sync paid prize to Operational Expenses table
const syncPrizeToExpenses = (prize, userId) => {
  try {
    const allExpenses = expenseRepository.readAll();
    const existingIndex = allExpenses.findIndex(e => e.auto_prize_id === prize.id);

    if (prize.payment_status === 'Paid' && Number(prize.prize_amount) > 0) {
      const event = eventRepository.findById(prize.event_id);
      const eventTitle = event ? event.title : `Event #${prize.event_id}`;
      const description = `Prize Payout: ${prize.prize_title || 'Tier'} - ${prize.winner_name || 'Winner'} (${eventTitle})`;

      const expensePayload = {
        auto_prize_id: prize.id,
        transaction_date: prize.paid_date || new Date().toISOString().split('T')[0],
        category: 'Event Prize Payout',
        description,
        amount: Number(prize.prize_amount),
        currency: prize.currency || 'IDR',
        exchange_rate_used: prize.exchange_rate_used || 1,
        base_amount_idr: prize.base_amount_idr || prize.prize_amount,
        related_event_id: prize.event_id,
        notes: `Auto-generated from Event Prize Payout #${prize.id}`,
        recorded_by_user_id: userId
      };

      if (existingIndex >= 0) {
        expenseRepository.update(allExpenses[existingIndex].id, expensePayload);
      } else {
        expenseRepository.create(expensePayload);
      }
    } else if (existingIndex >= 0) {
      expenseRepository.softDelete(allExpenses[existingIndex].id);
    }
  } catch (err) {
    console.error('Error auto-syncing prize to expenses:', err);
  }
};

// --- Events ---
export const getInternalEvents = (req, res) => {
  const events = eventRepository.readAll();
  res.json({ success: true, data: events.sort((a, b) => new Date(b.start_date) - new Date(a.start_date)) });
};

export const createEvent = (req, res) => {
  const newEvent = eventRepository.create({
    ...req.body,
    currency: req.body.currency || 'IDR',
    total_prize_pool: Number(req.body.total_prize_pool || 0),
    created_by_user_id: req.user.id
  });
  loggerService.logActivity(req.user.id, 'CREATE_EVENT', 'Event', newEvent.id, { title: newEvent.title });
  res.status(201).json({ success: true, data: newEvent });
};

export const updateEvent = (req, res) => {
  const { id } = req.params;
  const updated = eventRepository.update(id, {
    ...req.body,
    currency: req.body.currency || 'IDR',
    total_prize_pool: Number(req.body.total_prize_pool || 0)
  });
  if (!updated) return res.status(404).json({ success: false, message: 'Event not found.' });
  loggerService.logActivity(req.user.id, 'UPDATE_EVENT', 'Event', id, req.body);
  res.json({ success: true, data: updated });
};

export const uploadEventPoster = (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No poster image file uploaded.' });
  }

  const posterUrl = `/uploads/posters/${req.file.filename}`;
  const updated = eventRepository.update(id, { poster_url: posterUrl });

  if (!updated) return res.status(404).json({ success: false, message: 'Event not found.' });
  loggerService.logActivity(req.user.id, 'UPLOAD_POSTER', 'Event', id, { poster_url: posterUrl });

  res.json({ success: true, poster_url: posterUrl, data: updated });
};

export const deleteEvent = (req, res) => {
  const { id } = req.params;
  const deleted = eventRepository.softDelete(id);
  if (!deleted) return res.status(404).json({ success: false, message: 'Event not found.' });
  loggerService.logActivity(req.user.id, 'DELETE_EVENT', 'Event', id);
  res.json({ success: true, message: 'Event soft-deleted.' });
};

// --- Prizes ---
export const getInternalPrizes = (req, res) => {
  const { event_id } = req.query;
  const prizes = event_id ? prizeRepository.getPrizesByEventId(event_id, false) : prizeRepository.readAll();
  res.json({ success: true, data: prizes });
};

export const createPrize = (req, res) => {
  const rateInfo = currencyService.getActiveRateInfo();
  const currency = req.body.currency || 'IDR';
  const prizeAmount = Number(req.body.prize_amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(prizeAmount, currency, rateUsed);

  const newPrize = prizeRepository.create({
    ...req.body,
    event_id: Number(req.body.event_id),
    prize_amount: prizeAmount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR
  });

  syncPrizeToExpenses(newPrize, req.user.id);
  loggerService.logActivity(req.user.id, 'CREATE_PRIZE', 'Prize', newPrize.id, { prize_title: newPrize.prize_title, winner_name: newPrize.winner_name, prize_amount: prizeAmount });
  res.status(201).json({ success: true, data: newPrize });
};

export const updatePrize = (req, res) => {
  const { id } = req.params;
  const rateInfo = currencyService.getActiveRateInfo();
  const currency = req.body.currency || 'IDR';
  const prizeAmount = Number(req.body.prize_amount || 0);
  const rateUsed = Number(req.body.exchange_rate_used || rateInfo.active_rate_sgd_idr);
  const baseIDR = currencyService.calculateBaseIdr(prizeAmount, currency, rateUsed);

  const updated = prizeRepository.update(id, {
    ...req.body,
    event_id: Number(req.body.event_id),
    prize_amount: prizeAmount,
    currency,
    exchange_rate_used: rateUsed,
    base_amount_idr: baseIDR
  });

  if (!updated) return res.status(404).json({ success: false, message: 'Prize record not found.' });
  syncPrizeToExpenses(updated, req.user.id);

  loggerService.logActivity(req.user.id, 'UPDATE_PRIZE', 'Prize', id, req.body);
  res.json({ success: true, data: updated });
};

export const deletePrize = (req, res) => {
  const { id } = req.params;
  const prize = prizeRepository.findById(id);
  const deleted = prizeRepository.softDelete(id);

  if (!deleted) return res.status(404).json({ success: false, message: 'Prize record not found.' });
  if (prize) {
    syncPrizeToExpenses({ ...prize, payment_status: 'Cancelled' }, req.user.id);
  }

  loggerService.logActivity(req.user.id, 'DELETE_PRIZE', 'Prize', id);
  res.json({ success: true, message: 'Prize soft-deleted.' });
};

// --- League Standings ---
export const getEventStandings = (req, res) => {
  try {
    const { eventId } = req.params;
    const event = eventRepository.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const leagueConfig = event.league_config || {
      is_league: !!event.is_league,
      max_finalists: 20,
      podium_count: 3,
      total_matches: 3,
      point_schema: DEFAULT_POINT_SCHEMA
    };

    const rawParticipants = standingsRepository.findByEventId(eventId);
    const standings = sortStandings(rawParticipants, leagueConfig.point_schema);

    res.json({
      success: true,
      event,
      league_config: leagueConfig,
      standings
    });
  } catch (err) {
    console.error('Error fetching event standings:', err);
    res.status(500).json({ success: false, message: err.message || 'Error fetching standings' });
  }
};

export const updateLeagueConfig = (req, res) => {
  try {
    const { eventId } = req.params;
    const event = eventRepository.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const currentConfig = event.league_config || {};
    const updatedConfig = {
      is_league: req.body.is_league !== undefined ? !!req.body.is_league : currentConfig.is_league || false,
      max_finalists: Number(req.body.max_finalists || currentConfig.max_finalists || 20),
      podium_count: Number(req.body.podium_count || currentConfig.podium_count || 3),
      total_matches: Number(req.body.total_matches || currentConfig.total_matches || 3),
      point_schema: req.body.point_schema || currentConfig.point_schema || DEFAULT_POINT_SCHEMA
    };

    const updatedEvent = eventRepository.update(eventId, {
      is_league: updatedConfig.is_league,
      league_config: updatedConfig
    });

    loggerService.logActivity(req.user.id, 'UPDATE_LEAGUE_CONFIG', 'Event', eventId, updatedConfig);
    res.json({ success: true, data: updatedEvent });
  } catch (err) {
    console.error('Error updating league config:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating league config' });
  }
};

export const updateStandingsParticipants = (req, res) => {
  try {
    const { eventId } = req.params;
    const event = eventRepository.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const { player_names } = req.body; // Array of string names
    if (!Array.isArray(player_names)) {
      return res.status(400).json({ success: false, message: 'player_names must be an array' });
    }

    const existing = standingsRepository.findByEventId(eventId);
    const existingMap = new Map(existing.map(p => [p.player_name.toLowerCase().trim(), p]));

    // Add new or preserve match score
    player_names.forEach(nameStr => {
      const trimmed = nameStr.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase();
      if (!existingMap.has(key)) {
        standingsRepository.create({
          event_id: Number(eventId),
          player_name: trimmed,
          matches: {}
        });
      }
    });

    // Remove players not in new list
    const newListLower = new Set(player_names.map(n => n.trim().toLowerCase()));
    existing.forEach(p => {
      if (!newListLower.has(p.player_name.toLowerCase().trim())) {
        standingsRepository.softDelete(p.id);
      }
    });

    const rawParticipants = standingsRepository.findByEventId(eventId);
    const pointSchema = event.league_config?.point_schema || DEFAULT_POINT_SCHEMA;
    const standings = sortStandings(rawParticipants, pointSchema);

    res.json({ success: true, standings });
  } catch (err) {
    console.error('Error updating standings participants:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating standings participants' });
  }
};

export const updateMatchResult = (req, res) => {
  try {
    const { eventId } = req.params;
    const { participant_id, match_number, placement } = req.body;

    const participant = standingsRepository.findById(participant_id);
    if (!participant || Number(participant.event_id) !== Number(eventId)) {
      return res.status(404).json({ success: false, message: 'Participant standings record not found' });
    }

    const matches = { ...(participant.matches || {}) };
    if (placement === null || placement === '' || placement === undefined) {
      delete matches[match_number];
    } else {
      matches[match_number] = Number(placement);
    }

    const updated = standingsRepository.update(participant_id, { matches });

    const event = eventRepository.findById(eventId);
    const pointSchema = event?.league_config?.point_schema || DEFAULT_POINT_SCHEMA;
    const rawParticipants = standingsRepository.findByEventId(eventId);
    const standings = sortStandings(rawParticipants, pointSchema);

    res.json({ success: true, updated, standings });
  } catch (err) {
    console.error('Error updating match result:', err);
    res.status(500).json({ success: false, message: err.message || 'Error updating match result' });
  }
};

export const syncStandingsToPrizes = (req, res) => {
  try {
    const { eventId } = req.params;
    const event = eventRepository.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const podiumCount = event.league_config?.podium_count || 3;
    const pointSchema = event.league_config?.point_schema || DEFAULT_POINT_SCHEMA;
    const rawParticipants = standingsRepository.findByEventId(eventId);
    const standings = sortStandings(rawParticipants, pointSchema);

    const topWinners = standings.slice(0, podiumCount);
    const existingPrizes = prizeRepository.readAll().filter(p => Number(p.event_id) === Number(eventId));

    const syncedPrizes = topWinners.map((winner, idx) => {
      const rankTitle = `Juara ${idx + 1}`;
      const existingIndex = existingPrizes.findIndex(p => p.prize_title === rankTitle || idx === existingPrizes.indexOf(p));

      const prizePayload = {
        event_id: Number(eventId),
        prize_title: rankTitle,
        winner_name: winner.player_name,
        reward_description: `Hadiah Peringkat ${idx + 1} (${winner.total_points} Poin)`,
        prize_amount: existingPrizes[existingIndex]?.prize_amount || 0,
        currency: event.currency || 'IDR',
        payment_status: existingPrizes[existingIndex]?.payment_status || 'Unpaid',
        internal_notes: `Sinkronisasi Otomatis dari Papan Skor Liga (Rank #${idx + 1}, Poin: ${winner.total_points})`
      };

      if (existingIndex >= 0 && existingPrizes[existingIndex]) {
        return prizeRepository.update(existingPrizes[existingIndex].id, prizePayload);
      } else {
        return prizeRepository.create(prizePayload);
      }
    });

    loggerService.logActivity(req.user.id, 'SYNC_STANDINGS_PRIZES', 'Event', eventId, { top_count: topWinners.length });
    res.json({ success: true, synced_prizes: syncedPrizes, message: `Berhasil menyinkronkan ${syncedPrizes.length} pemenang ke modul Hadiah.` });
  } catch (err) {
    console.error('Error syncing standings to prizes:', err);
    res.status(500).json({ success: false, message: err.message || 'Error syncing standings to prizes' });
  }
};
