import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

import lotsRouter from './routes/lots.js';
import spacesRouter from './routes/spaces.js';
import occupancyRouter from './routes/occupancy.js';
import violationsRouter from './routes/violations.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*'
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Health
app.get('/api/health', (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// Routes
app.use('/api/lots', lotsRouter);
app.use('/api/spaces', spacesRouter);
app.use('/api/occupancy', occupancyRouter);
app.use('/api/violations', violationsRouter);

// Serve static client (so hitting root shows the UI)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, '..', 'client');
app.use(express.static(clientDir));

// Fallback to index.html for root
app.get('/', (_req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Error handler (keep it simple)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected error' });
});

app.listen(PORT, () => {
  console.log(`OpenSpot server listening on http://localhost:${PORT}`);
});
