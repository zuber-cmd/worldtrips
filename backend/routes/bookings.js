const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const router = express.Router();

function makeRef() {
  return 'TRV-' + Math.floor(10000 + Math.random() * 90000);
}

// GET /api/bookings
router.get('/', requireAuth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const { status, search } = req.query;

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);

    if (Number.isNaN(page) || page <= 0 || Number.isNaN(limit) || limit <= 0 || limit > 100) {
      return res.status(400).json({ success: false, message: 'Invalid pagination parameters.' });
    }

    const offset = (page - 1) * limit;

    const params = [];
    let where = isAdmin ? 'WHERE 1=1' : 'WHERE b.user_id = $1';
    if (!isAdmin) params.push(req.user.id);

    if (status && status !== 'all') {
      params.push(status);
      where += ` AND b.status = $${params.length}`;
    }
    if (search && isAdmin) {
      params.push(`%${search}%`);
      where += ` AND (u.full_name ILIKE $${params.length} OR b.reference ILIKE $${params.length} OR d.name ILIKE $${params.length})`;
    }

    const countParams = [...params];
    params.push(limit, offset);

    const rows = await req.db.query(`
      SELECT b.*,
        u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
        d.name AS destination_name, d.country, d.emoji AS destination_emoji,
        h.name AS hotel_name
      FROM bookings b
      LEFT JOIN users        u ON u.id = b.user_id
      LEFT JOIN destinations d ON d.id = b.destination_id
      LEFT JOIN hotels       h ON h.id = b.hotel_id
      ${where}
      ORDER BY b.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const countResult = await req.db.query(`
      SELECT COUNT(*) FROM bookings b
      LEFT JOIN users        u ON u.id = b.user_id
      LEFT JOIN destinations d ON d.id = b.destination_id
      ${where}
    `, countParams);

    res.json({ success: true, bookings: rows.rows, total: parseInt(countResult.rows[0].count) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Could not load bookings.' });
  }
});

// GET /api/bookings/:id
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT b.*,
        u.full_name AS customer_name, u.email AS customer_email, u.phone AS customer_phone,
        d.name AS destination_name, d.country, d.emoji AS destination_emoji,
        h.name AS hotel_name, h.stars AS hotel_stars,
        COALESCE(json_agg(jsonb_build_object(
          'name', a.name, 'price', ba.unit_price, 'quantity', ba.quantity, 'emoji', a.emoji
        )) FILTER (WHERE a.id IS NOT NULL), '[]') AS activities
      FROM bookings b
      LEFT JOIN users              u  ON u.id  = b.user_id
      LEFT JOIN destinations       d  ON d.id  = b.destination_id
      LEFT JOIN hotels             h  ON h.id  = b.hotel_id
      LEFT JOIN booking_activities ba ON ba.booking_id = b.id
      LEFT JOIN activities         a  ON a.id  = ba.activity_id
      WHERE b.id = $1
      GROUP BY b.id, u.full_name, u.email, u.phone, d.name, d.country, d.emoji, h.name, h.stars
    `, [req.params.id]);

    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Booking not found.' });
    const booking = result.rows[0];
    if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    res.json({ success: true, booking });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/bookings
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      destination_id, hotel_id, check_in, check_out, guests,
      activity_ids = [], payment_method, mpesa_phone, notes
    } = req.body;

    if (!destination_id || !check_in || !check_out || !guests || !payment_method) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const guestsInt = parseInt(guests, 10);
    if (Number.isNaN(guestsInt) || guestsInt <= 0) {
      return res.status(400).json({ success: false, message: 'guests must be a positive integer.' });
    }

    const ci = new Date(check_in);
    const co = new Date(check_out);
    if (co <= ci) return res.status(400).json({ success: false, message: 'Check-out must be after check-in.' });

    const nights = Math.max(1, Math.ceil((co - ci) / 86400000));
    let hotelCost = 0;

    // Ensure destination exists
    const destCheck = await req.db.query('SELECT id FROM destinations WHERE id = $1 AND is_active = TRUE', [destination_id]);
    if (!destCheck.rows.length) {
      return res.status(400).json({ success: false, message: 'Invalid destination.' });
    }

    if (hotel_id) {
      const hr = await req.db.query('SELECT price_per_night, destination_id FROM hotels WHERE id = $1 AND is_active = TRUE', [hotel_id]);
      if (!hr.rows.length || hr.rows[0].destination_id !== destination_id) {
        return res.status(400).json({ success: false, message: 'Invalid hotel for this destination.' });
      }
      hotelCost = hr.rows[0].price_per_night * nights * guestsInt;
    }

    let actCost = 0;
    const actPrices = {};
    if (Array.isArray(activity_ids) && activity_ids.length > 0) {
      const ar = await req.db.query('SELECT id, price, destination_id FROM activities WHERE id = ANY($1) AND is_active = TRUE', [activity_ids]);

      // Ensure all requested activities belong to this destination
      const foundIds = new Set(ar.rows.map(a => a.id));
      for (const aid of activity_ids) {
        if (!foundIds.has(aid)) {
          return res.status(400).json({ success: false, message: 'One or more activities are invalid for this destination.' });
        }
      }

      ar.rows.forEach(a => {
        if (a.destination_id !== destination_id) {
          return;
        }
        actPrices[a.id] = a.price;
        actCost += a.price * guestsInt;
      });
    }

    const total = hotelCost + actCost;
    let reference = makeRef();
    const chk = await req.db.query('SELECT id FROM bookings WHERE reference = $1', [reference]);
    if (chk.rows.length) reference = makeRef() + '-' + Date.now().toString().slice(-3);

    const result = await req.db.query(
      `INSERT INTO bookings
        (reference, user_id, destination_id, hotel_id, check_in, check_out, guests,
         hotel_cost, activities_cost, total_amount, payment_method, mpesa_phone, notes, status, payment_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending','unpaid')
       RETURNING *`,
      [reference, req.user.id, destination_id, hotel_id || null, check_in, check_out,
       parseInt(guests), hotelCost, actCost, total, payment_method, mpesa_phone || null, notes || null]
    );

    const booking = result.rows[0];

    for (const aid of activity_ids) {
      if (actPrices[aid]) {
        await req.db.query(
          'INSERT INTO booking_activities (booking_id, activity_id, quantity, unit_price) VALUES ($1,$2,$3,$4)',
          [booking.id, aid, parseInt(guests), actPrices[aid]]
        );
      }
    }

    res.status(201).json({ success: true, booking, reference });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Could not create booking.' });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const valid = ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const existing = await req.db.query('SELECT user_id, status FROM bookings WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ success: false, message: 'Booking not found.' });

    const booking = existing.rows[0];
    if (req.user.role !== 'admin') {
      if (booking.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied.' });
      if (status !== 'cancelled') return res.status(403).json({ success: false, message: 'You can only cancel bookings.' });
      if (booking.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending bookings can be cancelled.' });
    }

    const result = await req.db.query(
      'UPDATE bookings SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, admin_notes || null, req.params.id]
    );
    res.json({ success: true, booking: result.rows[0], message: `Booking ${status}.` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// PATCH /api/bookings/:id/payment (admin)
router.patch('/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { payment_status } = req.body;
    if (!['unpaid', 'paid', 'refunded', 'partial'].includes(payment_status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status.' });
    }
    const result = await req.db.query(
      'UPDATE bookings SET payment_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [payment_status, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, booking: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// DELETE /api/bookings/:id (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await req.db.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, message: 'Booking deleted.' });
  } catch {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

module.exports = router;
