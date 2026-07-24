import { eventRepository } from '../repositories/eventRepository.js';
import { prizeRepository } from '../repositories/prizeRepository.js';
import { expenseRepository } from '../repositories/expenseRepository.js';
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
