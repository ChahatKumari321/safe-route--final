const pool = require('../config/db');

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
const getStats = async (req, res) => {
  try {
    // Overall counts by status
    const statusCounts = await pool.query(
      `SELECT status, COUNT(*) AS count FROM incidents GROUP BY status`
    );

    // Count by category
    const categoryCounts = await pool.query(
      `SELECT ic.category_name, COUNT(i.id) AS count
       FROM incident_categories ic
       LEFT JOIN incidents i ON i.category_id = ic.id
       GROUP BY ic.id, ic.category_name
       ORDER BY count DESC`
    );

    // Top areas
    const areaCounts = await pool.query(
      `SELECT location_name, COUNT(*) AS count
       FROM incidents
       GROUP BY location_name
       ORDER BY count DESC
       LIMIT 10`
    );

    // Total users
    const totalUsers = await pool.query('SELECT COUNT(*) AS count FROM users WHERE role = $1', ['user']);

    // Recent 7 days trend
    const trend = await pool.query(
      `SELECT DATE(created_at) AS day, COUNT(*) AS count
       FROM incidents
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY day ASC`
    );

    // Map status array to object
    const statusMap = { pending: 0, verified: 0, rejected: 0, expired: 0, total: 0 };
    statusCounts.rows.forEach((r) => {
      statusMap[r.status] = parseInt(r.count);
      statusMap.total += parseInt(r.count);
    });

    return res.status(200).json({
      success: true,
      data: {
        status: statusMap,
        categories: categoryCounts.rows,
        areas: areaCounts.rows,
        totalUsers: parseInt(totalUsers.rows[0].count),
        trend: trend.rows,
      },
    });
  } catch (error) {
    console.error('getStats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch statistics.' });
  }
};

// ─── ADMIN: LIST ALL INCIDENTS ────────────────────────────────────────────────
const adminGetIncidents = async (req, res) => {
  try {
    const { status, category_id, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT i.*, ic.category_name, ic.color_hex, u.name AS reporter_name, u.email AS reporter_email
      FROM incidents i
      JOIN incident_categories ic ON i.category_id = ic.id
      JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let p = 1;

    if (status) { query += ` AND i.status = $${p++}`; params.push(status); }
    if (category_id) { query += ` AND i.category_id = $${p++}`; params.push(parseInt(category_id)); }

    query += ` ORDER BY i.created_at DESC LIMIT $${p++} OFFSET $${p++}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows, count: result.rowCount });
  } catch (error) {
    console.error('adminGetIncidents error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch incidents.' });
  }
};

// ─── ADMIN: UPDATE INCIDENT STATUS ───────────────────────────────────────────
const updateIncidentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const allowedStatuses = ['pending', 'verified', 'rejected', 'expired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    // Check incident exists
    const existing = await pool.query('SELECT id FROM incidents WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    // Update incident status
    const updated = await pool.query(
      'UPDATE incidents SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Log to verifications audit table (only for non-pending decisions)
    if (status !== 'pending') {
      await pool.query(
        `INSERT INTO verifications (incident_id, admin_id, decision, comments)
         VALUES ($1, $2, $3, $4)`,
        [id, req.user.id, status, comments || null]
      );
    }

    return res.status(200).json({
      success: true,
      message: `Incident marked as ${status}.`,
      data: updated.rows[0],
    });
  } catch (error) {
    console.error('updateIncidentStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update incident status.' });
  }
};

// ─── ADMIN: DELETE INCIDENT ───────────────────────────────────────────────────
const adminDeleteIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await pool.query('SELECT id FROM incidents WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    await pool.query('DELETE FROM incidents WHERE id = $1', [id]);
    return res.status(200).json({ success: true, message: 'Incident deleted by admin.' });
  } catch (error) {
    console.error('adminDeleteIncident error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete incident.' });
  }
};

module.exports = { getStats, adminGetIncidents, updateIncidentStatus, adminDeleteIncident };
