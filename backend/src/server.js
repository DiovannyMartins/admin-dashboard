import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.js';

/**
 * server — ponto de entrada: `npm run dev`.
 * Sobe a API em http://localhost:3001 com SQLite + seed rico.
 */

const PORT = Number(process.env.PORT ?? 3001);
const DB_PATH = process.env.DB_PATH ?? path.join('backend', 'data', 'dashboard.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const { app } = createApp({ dbPath: DB_PATH });

app.listen(PORT, () => {
  console.log(`[dashboard] API em http://localhost:${PORT}`);
  console.log(`[dashboard] health: http://localhost:${PORT}/api/health`);
  console.log(`[dashboard] banco: ${DB_PATH}`);
});
