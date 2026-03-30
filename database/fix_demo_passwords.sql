-- Run once on existing DBs where seed used the old wrong bcrypt hash.
-- Password for both: Admin@1234
UPDATE users SET password_hash = '$2b$12$wziIo0lhfm2hyiWIdUp0Uuh6Fk0BeB55DGHr3yRYJaH9OQjoRhw46'
WHERE email IN ('admin@worldtrips.ke', 'sarah@example.com');
