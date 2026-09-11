import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, getCounts, isDatabaseUp } from './db.js';
import { seedDatabase } from './seed.js';
import { createUsersRouter } from './users.routes.js';
import { createStatsRouter } from './stats.routes.js';
import { createNotificationsRouter } from './notifications.routes.js';
import { createDemoRouter } from './demo.routes.js';
import { notFoundHandler, errorHandler } from './errors.js';

/**
 * createApp — fábrica do Express para produção e testes.
 *
 * - CORS liberado (front vanilla em file:// ou Live Server).
 * - JSON com limite conservador.
 * - GET /api/health com contagens do seed (verificável via HTTP).
 * - Serve o front estático (index.html, css/, js/) no mesmo processo,
 *   permitindo `npm run dev` único e futuro single deploy.
 * - 404 e erros sempre no envelope { error: { code, message } }.
 */
export function createApp({ dbPath } = {}) {
  const db = initDatabase(dbPath ?? process.env.DB_PATH ?? 'backend/data/dashboard.db');
  seedDatabase(db);

  const app = express();
  app.disable('x-powered-by');
  app.use(cors());
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/users', createUsersRouter(db));
  app.use('/api/notifications', createNotificationsRouter(db));
  app.use('/api/demo', createDemoRouter(db));
  app.use('/api', createStatsRouter(db));

  app.get('/api/health', (_req, res) => {
    const dbUp = isDatabaseUp(db);
    if (!dbUp) {
      return res.status(503).json({
        error: { code: 'INTERNAL_ERROR', message: 'Banco de dados indisponível' },
      });
    }
    return res.json({ status: 'ok', db: 'up', seed: getCounts(db) });
  });

  // Front estático junto da API (ADR-0002: Pages segue estático; local serve tudo).
  // /backend/* nunca é servido como arquivo (protege o SQLite e o código-fonte).
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.resolve(__dirname, '..', '..');
  app.use('/backend', notFoundHandler);
  app.use(express.static(rootDir));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, db };
}
