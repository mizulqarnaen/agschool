import express from 'express';
import { getPublicEvents, getPublicEventDetail, getPublicEventStandings } from '../controllers/publicController.js';
import { getPublicBrandAmbassadors, getPublicBrandAmbassadorDetail, getRobloxAvatarHeadshot } from '../controllers/brandAmbassadorController.js';

const router = express.Router();

router.get('/events', getPublicEvents);
router.get('/events/:id', getPublicEventDetail);
router.get('/events/:id/standings', getPublicEventStandings);

// Public Brand Ambassador endpoints
router.get('/brand-ambassadors/avatar-headshot', getRobloxAvatarHeadshot);
router.get('/brand-ambassadors', getPublicBrandAmbassadors);
router.get('/brand-ambassadors/:id', getPublicBrandAmbassadorDetail);

export default router;
