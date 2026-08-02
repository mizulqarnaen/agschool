import express from 'express';
import {
  getUsers, createUser, updateUserStatus, updateUserPassword,
  getSettings, updateSettings, syncExchangeRate,
  getLogs
} from '../controllers/adminController.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authorizeRoles('administrator'));

// Users
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id/status', updateUserStatus);
router.put('/users/:id/password', updateUserPassword);

// Settings & Exchange Rates
router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.post('/settings/sync-rate', syncExchangeRate);

// Activity Logs
router.get('/logs', getLogs);

export default router;
