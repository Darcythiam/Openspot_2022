import express from 'express';
import { q } from '../db.js';

const router = express.Router();

// GET /api/spaces/search?lotId=1&status=open
router.get('/search', async (req, res, next) => {
  try {
    const lotId = Number(req.query.lotId);
    const status = req.query.status ? String(req.query.status) : null;
    const allowed = ['open','occupied','blocked'];

    if (!Number.isInteger(lotId)) return res.status(400).json({ error: 'lotId required' });

    const parts = ['WHERE s.lot_id = ?'];
    const params = [lotId];
    if (status && allowed.includes(status)) {
      parts.push('AND s.status = ?');
      params.push(status);
    }

    const rows = await q(
      `
      SELECT s.space_id AS id, s.label, s.status, s.is_accessible, s.is_reserved
      FROM spaces s
      ${parts.join(' ')}
      ORDER BY s.label
      `,
      params
    );

    res.json(rows);
  } catch (e) { next(e); }
});

export default router;
