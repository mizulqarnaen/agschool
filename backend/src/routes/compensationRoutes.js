import express from 'express';
import {
  getPublicCompensations,
  getAdminCampaigns,
  createAdminCampaign,
  updateAdminCampaign,
  deleteAdminCampaign,
  getAdminRecords,
  createAdminRecord,
  updateAdminRecord,
  deleteAdminRecord
} from '../controllers/compensationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Route (No auth required)
router.get('/public/compensations', getPublicCompensations);

// Admin Routes (Auth required)
router.get('/internal/compensations/campaigns', authenticateToken, getAdminCampaigns);
router.post('/internal/compensations/campaigns', authenticateToken, createAdminCampaign);
router.put('/internal/compensations/campaigns/:id', authenticateToken, updateAdminCampaign);
router.delete('/internal/compensations/campaigns/:id', authenticateToken, deleteAdminCampaign);

router.get('/internal/compensations/records', authenticateToken, getAdminRecords);
router.post('/internal/compensations/records', authenticateToken, createAdminRecord);
router.put('/internal/compensations/records/:id', authenticateToken, updateAdminRecord);
router.delete('/internal/compensations/records/:id', authenticateToken, deleteAdminRecord);

export default router;
