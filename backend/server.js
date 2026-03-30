require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { pool, checkConnection } = require('./config/db');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd   = NODE_ENV === 'production';

// ── App ───────────────────────────────────────────────────────
const app = express();

if (isProd) {
  app.set('trust proxy', 1);
}

app.use(helmet({
  contentSecurityPolicy: false,
  // Default is same-origin — blocks credentialed cross-origin fetch from Vercel → Render
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS: allow localhost + configured frontend ───────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const allowed = [
      // localhost variants
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      // Local network — 192.168.x.x, 10.x.x.x, 172.16-31.x.x
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/,
    ];

    if (allowed.some(pattern => pattern.test(origin))) {
      return callback(null, true);
    }

    const extraOrigins = (process.env.FRONTEND_URLS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (origin === process.env.FRONTEND_URL || extraOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.warn('CORS blocked origin:', origin);

    // In development, be permissive to reduce friction
    if (!isProd) {
      return callback(null, true);
    }

    // In production, block disallowed origins (do NOT pass Error — that turns preflight into HTTP 500)
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });
const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 500 });

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Attach db to every request
app.use((req, _res, next) => { req.db = pool; next(); });

// Root — avoids confusing 404 when opening the service URL in a browser
app.get('/', (_req, res) => {
  res.json({
    service: 'WorldTrips API',
    health: '/api/health',
    docs: 'Routes are under /api/* (e.g. POST /api/auth/login, GET /api/destinations).',
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/bookings',     require('./routes/bookings'));
app.use('/api/chat',         require('./routes/chat'));
app.use('/api/admin',        require('./routes/admin'));

// Health check including DB status
app.get('/api/health', async (_req, res) => {
  const time = new Date();
  try {
    await pool.query('SELECT 1');
    return res.json({ ok: true, db: true, time });
  } catch (e) {
    console.error('Healthcheck DB error:', e.message);
    return res.status(503).json({ ok: false, db: false, time });
  }
});

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// ── Startup: ensure DB is reachable then listen ───────────────
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await checkConnection();
    console.log('✅ PostgreSQL connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 WorldTrips API running`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Environment: ${NODE_ENV}\n`);
    });
  } catch (e) {
    console.error('❌ PostgreSQL connection failed:', e.message);
    console.error('   Check your .env DB_* settings');
    process.exit(1);
  }
})();
