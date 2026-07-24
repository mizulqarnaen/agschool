import { userRepository } from '../repositories/userRepository.js';
import { settingRepository } from '../repositories/settingRepository.js';
import { loggerService } from '../services/loggerService.js';
import { hashPassword } from '../middleware/authMiddleware.js';
import { currencyService } from '../services/currencyService.js';

// --- User Management ---
export const getUsers = (req, res) => {
  const users = userRepository.getUsersWithoutPasswords();
  res.json({ success: true, data: users });
};

export const createUser = async (req, res) => {
  try {
    const { username, email, full_name, password, role_id } = req.body;
    
    const existing = userRepository.readAll().find(u => u.username === username || u.email === email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username or email already exists.' });
    }

    const passwordHash = await hashPassword(password);
    const roleSlugMap = { 1: 'administrator', 2: 'finance', 3: 'secretary' };

    const newUser = userRepository.create({
      username,
      email,
      full_name,
      password_hash: passwordHash,
      role_id: Number(role_id),
      role_slug: roleSlugMap[Number(role_id)] || 'finance',
      status: 'active'
    });

    loggerService.logActivity(req.user.id, 'CREATE_USER', 'Users', newUser.id, { username });
    const { password_hash, ...userPayload } = newUser;
    res.status(201).json({ success: true, data: userPayload });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create user account.' });
  }
};

export const updateUserStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (Number(id) === req.user.id) {
    return res.status(400).json({ success: false, message: 'Administrators cannot alter their own account status.' });
  }

  const updated = userRepository.update(id, { status });
  if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
  
  loggerService.logActivity(req.user.id, 'UPDATE_USER_STATUS', 'Users', id, { status });
  const { password_hash, ...userPayload } = updated;
  res.json({ success: true, data: userPayload });
};

// --- Settings & Exchange Rates ---
export const getSettings = (req, res) => {
  const settings = settingRepository.getSettingsMap();
  const rateInfo = currencyService.getActiveRateInfo();
  res.json({ success: true, data: { ...settings, rate_info: rateInfo } });
};

export const updateSettings = (req, res) => {
  const updatedMap = settingRepository.updateSettingsMap(req.body);
  loggerService.logActivity(req.user.id, 'UPDATE_SETTINGS', 'Settings', null, req.body);
  res.json({ success: true, data: updatedMap });
};

export const syncExchangeRate = async (req, res) => {
  const result = await currencyService.syncAutoExchangeRate();
  loggerService.logActivity(req.user.id, 'SYNC_EXCHANGE_RATE', 'Settings', null, result);
  res.json({ success: result.success, data: result });
};

// --- Activity Logs ---
export const getLogs = (req, res) => {
  const logs = loggerService.getLogs(100);
  res.json({ success: true, data: logs });
};
