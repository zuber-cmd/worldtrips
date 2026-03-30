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
  // Default is same-origin — blocks cross-origin fetch from Vercel → Render
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Avoid extra isolation headers on a public JSON API
  crossOriginOpenerPolicy: false,
}));

function normalizeOrigin(o) {
  if (!o || typeof o !== 'string') return '';
  return o.trim().replace(/\/$/, '');
}

// ── CORS: allow localhost + configured frontend ───────────────
// Note: Auth uses Bearer tokens in headers + localStorage — not cookies — so credentials:false
// avoids strict credentialed-CORS issues (exact Origin match, no wildcard with credentials).
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const allowed = [
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/,
    ];

    if (allowed.some((pattern) => pattern.test(origin))) {
      return callback(null, true);
    }

    const front = normalizeOrigin(process.env.FRONTEND_URL);
    const extras = (process.env.FRONTEND_URLS || '')
      .split(',')
      .map((s) => normalizeOrigin(s))
      .filter(Boolean);

    if (front && normalizeOrigin(origin) === front) {
      return callback(null, true);
    }
    if (extras.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }

    // Vercel production + preview URLs (HTTPS only)
    if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
      return callback(null, true);
    }

    console.warn('CORS blocked origin:', origin);

    if (!isProd) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
