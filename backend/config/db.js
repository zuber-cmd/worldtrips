const { Pool } = require('pg');

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV,
} = process.env;

if (!DB_HOST || !DB_NAME || !DB_USER) {
  // Fail fast on clearly invalid DB configuration
  throw new Error('Database configuration missing. Please set DB_HOST, DB_NAME and DB_USER in .env');
}

const isProd = NODE_ENV === 'production';

const pool = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT || '5432', 10),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: isProd
    ? { rejectUnauthorized: false }
    : undefined,
});

async function checkConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  checkConnection,
};

