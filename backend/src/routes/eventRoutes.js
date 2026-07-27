import express from 'express';
import {
  getInternalEvents, createEvent, updateEvent, uploadEventPoster, deleteEvent,
  getInternalPrizes, createPrize, updatePrize, deletePrize,
  getEventStandings, updateLeagueConfig, updateStandingsParticipants, updateMatchResult, syncStandingsToPrizes
} from '../controllers/eventController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { uploadPoster } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Allow Administrator, Secretary, and Finance roles
router.use(authorizeRoles('administrator', 'secretary', 'finance'));

// Events
router.get('/', getInternalEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.post('/:id/poster', uploadPoster.single('poster'), uploadEventPoster);
router.delete('/:id', deleteEvent);

// Prizes
router.get('/prizes/list', getInternalPrizes);
router.post('/prizes', createPrize);
router.put('/prizes/:id', updatePrize);
router.delete('/prizes/:id', deletePrize);

// Standings & League Points
router.get('/:eventId/standings', getEventStandings);
router.post('/:eventId/standings/config', updateLeagueConfig);
router.post('/:eventId/standings/participants', updateStandingsParticipants);
router.put('/:eventId/standings/results', updateMatchResult);
router.post('/:eventId/standings/sync-prizes', syncStandingsToPrizes);

export default router;
