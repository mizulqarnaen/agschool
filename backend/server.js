import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JsonRepository } from './src/repositories/baseRepository.js';
import { comparePassword, generateToken, authenticateToken } from './src/middleware/authMiddleware.js';
import { loggerService } from './src/services/loggerService.js';

// Route Module Imports
import publicRoutes from './src/routes/publicRoutes.js';
import financeRoutes from './src/routes/financeRoutes.js';
import eventRoutes from './src/routes/eventRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Repositories for Auth
const userRepository = new JsonRepository('users.json');
const roleRepository = new JsonRepository('roles.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public API Routes
app.use('/api/public', publicRoutes);

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const users = userRepository.readAll();
    const roles = roleRepository.readAll();

    const user = users.find(u => (u.username === username || u.email === username) && u.status === 'active');
    if (!user) {
      loggerService.logActivity(null, 'LOGIN_FAILED', 'Auth', null, { username, reason: 'User not found or inactive' });
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      loggerService.logActivity(user.id, 'LOGIN_FAILED', 'Auth', user.id, { username, reason: 'Invalid password' });
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const role = roles.find(r => r.id === user.role_id);
    user.role_slug = role ? role.slug : 'administrator';

    // Update last_login_at
    userRepository.update(user.id, { last_login_at: new Date().toISOString() });
    loggerService.logActivity(user.id, 'LOGIN_SUCCESS', 'Auth', user.id, { username: user.username });

    const token = generateToken(user);
    const { password_hash, ...userPayload } = user;

    res.json({
      success: true,
      token,
      user: userPayload
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  if (req.user) {
    loggerService.logActivity(req.user.id, 'LOGOUT', 'Auth', req.user.id, { username: req.user.username });
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Self Change Password Endpoint
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Password saat ini dan password baru wajib diisi.' });
    }

    if (new_password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const users = userRepository.readAll(true);
    const user = users.find(u => Number(u.id) === Number(req.user.id));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const isMatch = await comparePassword(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini salah / tidak cocok.' });
    }

    const passwordHash = await hashPassword(new_password);
    userRepository.update(user.id, { password_hash: passwordHash });

    loggerService.logActivity(user.id, 'CHANGE_PASSWORD_SELF', 'Auth', user.id, { username: user.username });

    res.json({ success: true, message: 'Password Anda berhasil diperbarui!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui password.' });
  }
});

// Authenticated Internal Routes
app.use('/api/internal/finance', authenticateToken, financeRoutes);
app.use('/api/internal/events', authenticateToken, eventRoutes);
app.use('/api/internal/admin', authenticateToken, adminRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'online', timestamp: new Date().toISOString() });
});

// Serve static frontend build files in production if available
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Root fallback route when frontend build is not yet uploaded
  app.get('/', (req, res) => {
    res.json({
      success: true,
      message: '🚀 AG School Finance API is online and running on IDCloudHost!',
      status: 'Active',
      notice: 'Frontend dist is not yet uploaded. Upload frontend/dist to serve full UI.',
      endpoints: {
        public_events: '/api/public/events',
        health: '/api/health'
      }
    });
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AG School Finance API running on http://localhost:${PORT}`);
});

export default app;
