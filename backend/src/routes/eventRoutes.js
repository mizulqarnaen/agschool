import express from 'express';
import {
  getInternalEvents, createEvent, updateEvent, uploadEventPoster, deleteEvent,
  getInternalPrizes, createPrize, updatePrize, deletePrize
} from '../controllers/eventController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { uploadPoster } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Allow Secretary and Administrator roles
router.use(authorizeRoles('administrator', 'secretary'));

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

export default router;
