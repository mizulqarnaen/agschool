import express from 'express';
import { getPublicEvents, getPublicEventDetail, getPublicEventStandings } from '../controllers/publicController.js';

const router = express.Router();

router.get('/events', getPublicEvents);
router.get('/events/:id', getPublicEventDetail);
router.get('/events/:id/standings', getPublicEventStandings);

export default router;
