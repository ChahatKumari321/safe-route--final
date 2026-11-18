const pool = require('../config/db');

// ─── GET ALL INCIDENTS ────────────────────────────────────────────────────────
const getIncidents = async (req, res) => {
  try {
    const { category_id, status, from_date, to_date, limit = 200, offset = 0 } = req.query;

    let query = `
      SELECT
        i.id, i.title, i.description,
        i.latitude, i.longitude, i.location_name,
        i.incident_datetime, i.status,
        i.created_at, i.updated_at,
        i.category_id,
        ic.category_name, ic.color_hex,
        u.name AS reporter_name
      FROM incidents i
      JOIN incident_categories ic ON i.category_id = ic.id
      JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let p = 1;

    if (category_id) {
      query += ` AND i.category_id = $${p++}`;
      params.push(parseInt(category_id));
    }
    if (status) {
      query += ` AND i.status = $${p++}`;
      params.push(status);
    }
    if (from_date) {
      query += ` AND i.incident_datetime >= $${p++}`;
      params.push(from_date);
    }
    if (to_date) {
      query += ` AND i.incident_datetime <= $${p++}`;
      params.push(to_date);
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${p++} OFFSET $${p++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    console.error('getIncidents error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch incidents.' });
  }
};

// ─── GET SINGLE INCIDENT ──────────────────────────────────────────────────────
const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         i.id, i.title, i.description,
         i.latitude, i.longitude, i.location_name,
         i.incident_datetime, i.status,
         i.created_at, i.updated_at,
         i.category_id,
         ic.category_name, ic.color_hex,
         u.name AS reporter_name
       FROM incidents i
       JOIN incident_categories ic ON i.category_id = ic.id
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    // Fetch verification history
    const verifications = await pool.query(
      `SELECT v.decision, v.comments, v.created_at, u.name AS admin_name
       FROM verifications v
       JOIN users u ON v.admin_id = u.id
       WHERE v.incident_id = $1
       ORDER BY v.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: { ...result.rows[0], verifications: verifications.rows },
    });
  } catch (error) {
    console.error('getIncidentById error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch incident.' });
  }
};

// ─── CREATE INCIDENT ──────────────────────────────────────────────────────────
const createIncident = async (req, res) => {
  try {
    const { title, description, category_id, latitude, longitude, location_name, incident_datetime } = req.body;

    // Validation
    if (!title || !description || !category_id || latitude == null || longitude == null || !location_name || !incident_datetime) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (title.trim().length < 5) {
      return res.status(400).json({ success: false, message: 'Title must be at least 5 characters.' });
    }
    if (description.trim().length < 20) {
      return res.status(400).json({ success: false, message: 'Description must be at least 20 characters.' });
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || lat < 24.5 || lat > 25.2 || lng < 66.5 || lng > 67.5) {
      return res.status(400).json({ success: false, message: 'Coordinates must be within Karachi region.' });
    }

    // Verify category exists
    const catResult = await pool.query('SELECT id FROM incident_categories WHERE id = $1', [parseInt(category_id)]);
    if (catResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid incident category.' });
    }

    const result = await pool.query(
      `INSERT INTO incidents
         (user_id, category_id, title, description, latitude, longitude, location_name, incident_datetime)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        parseInt(category_id),
        title.trim(),
        description.trim(),
        lat,
        lng,
        location_name.trim(),
        new Date(incident_datetime),
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Incident reported successfully. It is pending review.',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('createIncident error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit incident.' });
  }
};

// ─── UPDATE OWN INCIDENT ──────────────────────────────────────────────────────
const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category_id, location_name, incident_datetime } = req.body;

    // Check ownership
    const existing = await pool.query('SELECT * FROM incidents WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    const incident = existing.rows[0];
    if (incident.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own incidents.' });
    }
    if (incident.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only pending incidents can be edited.' });
    }

    const result = await pool.query(
      `UPDATE incidents
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category_id = COALESCE($3, category_id),
           location_name = COALESCE($4, location_name),
           incident_datetime = COALESCE($5, incident_datetime)
       WHERE id = $6
       RETURNING *`,
      [
        title ? title.trim() : null,
        description ? description.trim() : null,
        category_id ? parseInt(category_id) : null,
        location_name ? location_name.trim() : null,
        incident_datetime ? new Date(incident_datetime) : null,
        id,
      ]
    );

    return res.status(200).json({ success: true, message: 'Incident updated.', data: result.rows[0] });
  } catch (error) {
    console.error('updateIncident error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update incident.' });
  }
};

// ─── DELETE OWN INCIDENT ──────────────────────────────────────────────────────
const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT * FROM incidents WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    const incident = existing.rows[0];
    if (incident.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only delete your own incidents.' });
    }

    await pool.query('DELETE FROM incidents WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'Incident deleted.' });
  } catch (error) {
    console.error('deleteIncident error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete incident.' });
  }
};

// ─── GET CATEGORIES ───────────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM incident_categories ORDER BY id');
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
};

// ─── GET USER'S OWN INCIDENTS ─────────────────────────────────────────────────
const getMyIncidents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, ic.category_name, ic.color_hex
       FROM incidents i
       JOIN incident_categories ic ON i.category_id = ic.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch your incidents.' });
  }
};

module.exports = { getIncidents, getIncidentById, createIncident, updateIncident, deleteIncident, getCategories, getMyIncidents };
