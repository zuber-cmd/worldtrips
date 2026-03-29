/**
 * Applies database/schema.sql (schema + seed data) using DATABASE_URL or DB_* vars.
 * Run after creating an empty database: npm run db:seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const { DB_HOST, DB_NAME, DB_USER } = process.env;
const connectionString = [process.env.DATABASE_URL, process.env.POSTGRES_URL]
  .find((u) => u && String(u).trim());

/** Remote Postgres (Render, Neon, etc.) requires TLS even when NODE_ENV is not production. */
function sslOptions() {
  if (connectionString) {
    try {
      const host = new URL(connectionString).hostname;
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

const ssl = sslOptions();

const poolConfig = connectionString
  ? { connectionString: connectionString.trim(), ssl }
  : DB_HOST && DB_NAME && DB_USER
    ? {
        host: DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        database: DB_NAME,
        user: DB_USER,
        password: process.env.DB_PASSWORD || '',
        ssl,
      }
    : null;

if (!poolConfig) {
  console.error('Set DATABASE_URL (or POSTGRES_URL) or DB_HOST, DB_NAME, DB_USER (and DB_PASSWORD) in .env');
  process.exit(1);
}

const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
const sql = fs.readFileSync(schemaPath, 'utf8');

const pool = new Pool(poolConfig);

(async () => {
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('✅ Schema and seed applied from database/schema.sql');
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
