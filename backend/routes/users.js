const express = require('express');
const bcrypt  = require('bcrypt');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const r = await req.db.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user: r.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const r = await req.db.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), updated_at = NOW() WHERE id = $3 RETURNING id, full_name, email, phone, role',
      [full_name || null, phone || null, req.user.id]
    );
    if (!r.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: r.rows[0], message: 'Profile updated.' });
  } catch {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

router.patch('/password', requireAuth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Both passwords required.' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be 8+ characters.' });
    }
    const r = await req.db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!r.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const ok = await bcrypt.compare(current_password, r.rows[0].password_hash);
    if (!ok) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    const hash = await bcrypt.hash(new_password, 12);
    await req.db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
