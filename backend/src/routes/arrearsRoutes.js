import express from 'express';
import {
  getPublicArrears,
  getAdminArrears,
  createAdminArrears,
  updateAdminArrears,
  deleteAdminArrears
} from '../controllers/arrearsController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Route
router.get('/public/arrears', getPublicArrears);

// Admin Routes (Protected)
router.get('/internal/arrears', authenticateToken, getAdminArrears);
router.post('/internal/arrears', authenticateToken, createAdminArrears);
router.put('/internal/arrears/:id', authenticateToken, updateAdminArrears);
router.delete('/internal/arrears/:id', authenticateToken, deleteAdminArrears);

export default router;
