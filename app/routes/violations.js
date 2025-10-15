import express from 'express';
import { q } from '../db.js';

const router = express.Router();

// GET /api/violations?resolved=false
router.get('/', async (req, res, next) => {
  try {
    const resolved = String(req.query.resolved ?? 'false').toLowerCase() === 'true' ? 1 : 0;
    const rows = await q(
      `
      SELECT v.violation_id AS id, v.space_id, s.label, v.plate, v.reason, v.ts, v.resolved
      FROM violations v
      JOIN spaces s ON s.space_id = v.space_id
      WHERE v.resolved = ?
      ORDER BY v.ts DESC
      `,
      [resolved]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

// POST /api/violations
// { spaceId, plate, reason }
router.post('/', async (req, res, next) => {
  try {
    const { spaceId, plate, reason } = req.body ?? {};
    const id = Number(spaceId);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'spaceId required' });
    if (!plate || !reason)   return res.status(400).json({ error: 'plate and reason required' });

    const result = await q(
      'INSERT INTO violations (space_id, plate, reason) VALUES (?,?,?)',
      [id, String(plate).slice(0, 16), String(reason).slice(0, 255)]
    );
    res.status(201).json({ ok: true, id: result.insertId });
  } catch (e) { next(e); }
});

// POST /api/violations/:id/resolve
router.post('/:id/resolve', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });
    const result = await q('UPDATE violations SET resolved = 1 WHERE violation_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
