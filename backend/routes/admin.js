const express = require('express');
const bcrypt  = require('bcrypt');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [bookings, customers, revenue, pending, destinations, chart] = await Promise.all([
      req.db.query("SELECT COUNT(*) FROM bookings"),
      req.db.query("SELECT COUNT(*) FROM users WHERE role='customer' AND is_active=TRUE"),
      req.db.query("SELECT COALESCE(SUM(total_amount),0) AS total FROM bookings WHERE status IN ('confirmed','completed') AND payment_status='paid'"),
      req.db.query("SELECT COUNT(*) FROM bookings WHERE status='pending'"),
      req.db.query("SELECT COUNT(*) FROM destinations WHERE is_active=TRUE"),
      req.db.query(`
        SELECT
          date_trunc('month', created_at) AS month,
          SUM(total_amount) AS revenue,
          COUNT(*) AS bookings
        FROM bookings
        WHERE created_at >= NOW() - INTERVAL '6 months'
        GROUP BY 1 ORDER BY 1
      `),
    ]);

    res.json({
      success: true,
      stats: {
        totalBookings:     parseInt(bookings.rows[0].count),
        totalCustomers:    parseInt(customers.rows[0].count),
        totalRevenue:      parseInt(revenue.rows[0].total),
        pendingBookings:   parseInt(pending.rows[0].count),
        totalDestinations: parseInt(destinations.rows[0].count),
      },
      revenueChart: chart.rows,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Could not load stats.' });
  }
});

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = `
      SELECT u.id, u.full_name, u.email, u.phone, u.role, u.is_active, u.created_at,
             COUNT(b.id) AS booking_count
      FROM users u
      LEFT JOIN bookings b ON b.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }
    if (role) {
      params.push(role);
      query += ` AND u.role = $${params.length}`;
    }

    query += ' GROUP BY u.id ORDER BY u.created_at DESC';
    const result = await req.db.query(query, params);
    res.json({ success: true, users: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Could not load users.' });
  }
});

// POST /api/admin/users - create user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required.' });
    }
    const exists = await req.db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) {
      return res.status(409).json({ success: false, message: 'Email already in use.' });
    }
    const hash = await bcrypt.hash(password, 12);
    const result = await req.db.query(
      'INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, full_name, email, phone, role, created_at',
      [full_name, email.toLowerCase(), phone || null, hash, role || 'customer']
    );
    res.status(201).json({ success: true, user: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Could not create user.' });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/users/:id/status', requireAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own status.' });
    }
    await req.db.query('UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2', [is_active, req.params.id]);
    res.json({ success: true, message: `User ${is_active ? 'activated' : 'deactivated'}.` });
  } catch {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// PATCH /api/admin/users/:id/role
router.patch('/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });
    }
    await req.db.query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2', [role, req.params.id]);
    res.json({ success: true, message: `Role updated to ${role}.` });
  } catch {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself.' });
    }
    await req.db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'User deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

// GET /api/admin/bookings/export  - CSV download
router.get('/bookings/export', requireAdmin, async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT
        b.reference, u.full_name AS customer, u.email, u.phone,
        d.name AS destination, d.country,
        b.check_in, b.check_out,
        b.guests, b.hotel_cost, b.activities_cost, b.total_amount,
        b.status, b.payment_method, b.payment_status,
        h.name AS hotel,
        b.notes, b.admin_notes,
        b.created_at
      FROM bookings b
      LEFT JOIN users        u ON u.id = b.user_id
      LEFT JOIN destinations d ON d.id = b.destination_id
      LEFT JOIN hotels       h ON h.id = b.hotel_id
      ORDER BY b.created_at DESC
    `);

    if (!result.rows.length) {
      return res.json({ success: true, message: 'No bookings to export.' });
    }

    const cols = Object.keys(result.rows[0]);
    const csv = [
      cols.join(','),
      ...result.rows.map(row =>
        cols.map(c => {
          const val = row[c] === null || row[c] === undefined ? '' : String(row[c]);
          return `"${val.replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="worldtrips-bookings-${Date.now()}.csv"`);
    res.send(csv);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Export failed.' });
  }
});

module.exports = router;
