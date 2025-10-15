import express from 'express';
import { q } from '../db.js';

const router = express.Router();

// POST /api/occupancy
// { spaceId, type: 'enter'|'exit'|'block'|'unblock', plate? }
router.post('/', async (req, res, next) => {
  try {
    const { spaceId, type, plate } = req.body ?? {};
    const id = Number(spaceId);
    const allowed = new Set(['enter','exit','block','unblock']);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'spaceId required' });
    if (!allowed.has(type)) return res.status(400).json({ error: 'invalid event type' });

    // update space status based on event
    const nextStatus = {
      enter: 'occupied',
      exit: 'open',
      block: 'blocked',
      unblock: 'open'
    }[type];

    // transactional sanity
    const conn = await (await import('../db.js')).pool.getConnection();
    try {
      await conn.beginTransaction();

      const [space] = await conn.execute('SELECT space_id, status FROM spaces WHERE space_id = ? FOR UPDATE', [id]);
      if (space.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: 'space not found' });
      }

      await conn.execute(
        'INSERT INTO occupancy_events (space_id, event_type, plate) VALUES (?,?,?)',
        [id, type, plate || null]
      );

      await conn.execute('UPDATE spaces SET status = ? WHERE space_id = ?', [nextStatus, id]);

      await conn.commit();
      conn.release();

      res.status(201).json({ ok: true, spaceId: id, status: nextStatus });
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (e) { next(e); }
});

// GET /api/occupancy/recent?limit=50
router.get('/recent', async (req, res, next) => {
  try {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));
    const rows = await q(
      `
      SELECT e.event_id, e.space_id, s.label, e.event_type, e.plate, e.ts
      FROM occupancy_events e
      JOIN spaces s ON s.space_id = e.space_id
      ORDER BY e.ts DESC
      LIMIT ?
      `,
      [limit]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

export default router;
