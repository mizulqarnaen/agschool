import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getPublicCompensations,
  getAdminCampaigns,
  createAdminCampaign,
  updateAdminCampaign,
  deleteAdminCampaign,
  getAdminRecords,
  createAdminRecord,
  bulkCreateAdminRecords,
  updateAdminRecord,
  deleteAdminRecord
} from '../controllers/compensationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Multer Storage setup for Transfer Proof files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `proof_${Date.now()}_${Math.random().toString(36).substr(2, 6)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = express.Router();

// Public Route (No auth required)
router.get('/public/compensations', getPublicCompensations);

// Admin Routes (Auth required)
router.get('/internal/compensations/campaigns', authenticateToken, getAdminCampaigns);
router.post('/internal/compensations/campaigns', authenticateToken, createAdminCampaign);
router.put('/internal/compensations/campaigns/:id', authenticateToken, updateAdminCampaign);
router.delete('/internal/compensations/campaigns/:id', authenticateToken, deleteAdminCampaign);

router.get('/internal/compensations/records', authenticateToken, getAdminRecords);
router.post('/internal/compensations/records', authenticateToken, upload.single('proof'), createAdminRecord);
router.post('/internal/compensations/records/bulk', authenticateToken, bulkCreateAdminRecords);
router.put('/internal/compensations/records/:id', authenticateToken, upload.single('proof'), updateAdminRecord);
router.delete('/internal/compensations/records/:id', authenticateToken, deleteAdminRecord);

export default router;
