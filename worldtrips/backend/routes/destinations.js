const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/destinations
router.get('/', async (req, res) => {
  try {
    const { region, category, search } = req.query;
    let query = `
      SELECT d.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', h.id, 'name', h.name, 'stars', h.stars,
          'price_per_night', h.price_per_night, 'amenities', h.amenities
        )) FILTER (WHERE h.id IS NOT NULL), '[]') AS hotels,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', a.id, 'name', a.name, 'price', a.price,
          'duration', a.duration, 'emoji', a.emoji
        )) FILTER (WHERE a.id IS NOT NULL), '[]') AS activities
      FROM destinations d
      LEFT JOIN hotels     h ON h.destination_id = d.id AND h.is_active = TRUE
      LEFT JOIN activities a ON a.destination_id = d.id AND a.is_active = TRUE
      WHERE d.is_active = TRUE
    `;
    const params = [];

    if (region && region !== 'All') {
      params.push(region);
      query += ` AND d.region = $${params.length}`;
    }
    if (category && category !== 'All') {
      params.push(category);
      query += ` AND d.category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (d.name ILIKE $${params.length} OR d.country ILIKE $${params.length})`;
    }

    query += ' GROUP BY d.id ORDER BY d.rating DESC';
    const result = await req.db.query(query, params);
    res.json({ success: true, destinations: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Could not load destinations.' });
  }
});

// GET /api/destinations/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await req.db.query(`
      SELECT d.*,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', h.id, 'name', h.name, 'stars', h.stars,
          'price_per_night', h.price_per_night, 'amenities', h.amenities
        )) FILTER (WHERE h.id IS NOT NULL), '[]') AS hotels,
        COALESCE(json_agg(DISTINCT jsonb_build_object(
          'id', a.id, 'name', a.name, 'price', a.price,
          'duration', a.duration, 'emoji', a.emoji
        )) FILTER (WHERE a.id IS NOT NULL), '[]') AS activities
      FROM destinations d
      LEFT JOIN hotels     h ON h.destination_id = d.id AND h.is_active = TRUE
      LEFT JOIN activities a ON a.destination_id = d.id AND a.is_active = TRUE
      WHERE d.id = $1
      GROUP BY d.id
    `, [req.params.id]);

    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, destination: result.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// POST /api/destinations (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, country, region, category, emoji, base_price, description, highlights, fallback_color, image_path } = req.body;
    if (!name || !country || !region || !category || !base_price) {
      return res.status(400).json({ success: false, message: 'Name, country, region, category and price are required.' });
    }
    const r = await req.db.query(
      `INSERT INTO destinations (name, country, region, category, emoji, base_price, description, highlights, fallback_color, image_path)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [name, country, region, category, emoji || '🌍', parseInt(base_price), description || null, highlights || null, fallback_color || '#4a6fa5', image_path || null]
    );
    res.status(201).json({ success: true, destination: r.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Could not create destination.' });
  }
});

// PUT /api/destinations/:id (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, country, region, category, emoji, base_price, description, highlights, fallback_color, image_path } = req.body;
    const r = await req.db.query(
      `UPDATE destinations SET name=$1, country=$2, region=$3, category=$4, emoji=$5,
       base_price=$6, description=$7, highlights=$8, fallback_color=$9, image_path=$10
       WHERE id=$11 RETURNING *`,
      [name, country, region, category, emoji, parseInt(base_price), description, highlights, fallback_color, image_path, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    res.json({ success: true, destination: r.rows[0] });
  } catch {
    res.status(500).json({ success: false, message: 'Update failed.' });
  }
});

// DELETE /api/destinations/:id (admin - soft delete)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await req.db.query('UPDATE destinations SET is_active = FALSE WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Destination removed.' });
  } catch {
    res.status(500).json({ success: false, message: 'Delete failed.' });
  }
});

module.exports = router;
