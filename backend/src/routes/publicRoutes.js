import express from 'express';
import { getPublicEvents, getPublicEventDetail } from '../controllers/publicController.js';

const router = express.Router();

router.get('/events', getPublicEvents);
router.get('/events/:id', getPublicEventDetail);

export default router;
