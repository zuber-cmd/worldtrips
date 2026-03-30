/**
 * One-off: fixes bcrypt for seeded demo users (password Admin@1234).
 * Usage: DATABASE_URL="postgresql://..." node scripts/apply-demo-password-fix.js
 */
const { Client } = require('pg');

const sql = `
UPDATE users SET password_hash = '$2b$12$wziIo0lhfm2hyiWIdUp0Uuh6Fk0BeB55DGHr3yRYJaH9OQjoRhw46'
WHERE email IN ('admin@worldtrips.ke', 'sarah@example.com');
`;

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL');
    process.exit(1);
  }
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const r = await client.query(sql);
  console.log('Rows updated:', r.rowCount);
  await client.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
