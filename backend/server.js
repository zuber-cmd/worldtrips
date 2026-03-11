require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool }  = require('pg');

// ── Database ──────────────────────────────────────────────────
const db = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'worldtrips',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

db.connect()
  .then(c => { console.log('✅ PostgreSQL connected'); c.release(); })
  .catch(e => {
    console.error('❌ PostgreSQL connection failed:', e.message);
    console.error('   Check your .env DB_PASSWORD setting');
  });

// ── App ───────────────────────────────────────────────────────
const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS: allow localhost + any device on your local network ──
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

    // Also allow whatever is set in .env
    if (origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    console.warn('⚠️  CORS blocked origin:', origin);
    return callback(null, true); // permissive during dev — change to false in production
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
app.use((req, _res, next) => { req.db = db; next(); });

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/bookings',     require('./routes/bookings'));
app.use('/api/chat',         require('./routes/chat'));
app.use('/api/admin',        require('./routes/admin'));

app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date() }));

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// ── Listen on ALL interfaces so phone can reach it ────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 WorldTrips API running`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://10.14.0.193:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
});