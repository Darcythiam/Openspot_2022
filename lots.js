import express from 'express';
import { q } from '../db.js';

const router = express.Router();

// GET /api/lots
router.get('/', async (_req, res, next) => {
  try {
    const rows = await q('SELECT lot_id AS id, name, address FROM lots ORDER BY name');
    res.json(rows);
  } catch (e) { next(e); }
});

// GET /api/lots/:lotId/spaces?status=open|occupied|blocked
router.get('/:lotId/spaces', async (req, res, next) => {
  try {
    const lotId = Number(req.params.lotId);
    if (!Number.isInteger(lotId)) return res.status(400).json({ error: 'Invalid lotId' });

    const allowed = ['open','occupied','blocked'];
    const { status } = req.query;
    const filter = allowed.includes(String(status)) ? 'AND s.status = ?' : '';
    const params = [lotId];
    if (filter) params.push(status);

    const rows = await q(
      `
      SELECT s.space_id AS id, s.label, s.is_accessible, s.is_reserved, s.status
      FROM spaces s
      WHERE s.lot_id = ?
      ${filter}
      ORDER BY s.label
      `,
      params
    );
    res.json(rows);
  } catch (e) { next(e); }
});

export default router;
