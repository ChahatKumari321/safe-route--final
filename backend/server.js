require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const path        = require('path');
const rateLimit   = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const adminRoutes    = require('./routes/admin');
const routeRoutes    = require('./routes/routes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// ─── RATE LIMITERS ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { success: false, message: 'Report limit reached. Please wait before submitting again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── ROUTES ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authLimiter,   authRoutes);
app.use('/api/incidents', reportLimiter, incidentRoutes);
app.use('/api/admin',                    adminRoutes);
app.use('/api/routes',                   routeRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SafeRoute Karachi API is running.', timestamp: new Date() });
});

// ─── CATCH-ALL: Serve frontend pages ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 SafeRoute Karachi server running on http://localhost:${PORT}`);
  console.log(`📋 API health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
