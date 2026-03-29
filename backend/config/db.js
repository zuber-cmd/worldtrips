const { Pool } = require('pg');

const {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  NODE_ENV,
} = process.env;

/** Prefer DATABASE_URL (Render, Heroku, etc.); POSTGRES_URL is a common alias. */
const connectionString = [process.env.DATABASE_URL, process.env.POSTGRES_URL]
  .find((u) => u && String(u).trim());

const isProd = NODE_ENV === 'production';

/** Render / cloud Postgres requires TLS; apply whenever the host is not local. */
function sslOptions(urlString) {
  if (urlString) {
    try {
      const host = new URL(urlString).hostname;
      if (host === 'localhost' || host === '127.0.0.1') return undefined;
    } catch {
      return { rejectUnauthorized: false };
    }
    return { rejectUnauthorized: false };
  }
  if (DB_HOST && DB_HOST !== 'localhost' && DB_HOST !== '127.0.0.1') {
    return { rejectUnauthorized: false };
  }
  return isProd ? { rejectUnauthorized: false } : undefined;
}

const ssl = sslOptions(connectionString);

const poolConfig = connectionString
  ? {
      connectionString: connectionString.trim(),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl,
    }
  : (() => {
      if (!DB_HOST || !DB_NAME || !DB_USER) {
        throw new Error(
          'Database configuration missing.\n' +
            '  • On Render: Web Service → Environment → add DATABASE_URL. Copy the Internal ' +
            'Database URL from your Render PostgreSQL (Dashboard → database → Connect), ' +
            'or link the database to this service so Render injects DATABASE_URL.\n' +
            '  • Locally: set DATABASE_URL in .env, or DB_HOST, DB_NAME, DB_USER (and DB_PASSWORD).'
        );
      }
      return {
        host: DB_HOST,
        port: parseInt(DB_PORT || '5432', 10),
        database: DB_NAME,
        user: DB_USER,
        password: DB_PASSWORD || '',
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl,
      };
    })();

const pool = new Pool(poolConfig);

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
