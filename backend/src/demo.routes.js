import { Router } from 'express';
import { seedDatabase } from './seed.js';
import { getCounts } from './db.js';

/**
 * demo.routes — reset demo para portfólio (issue #8).
 *
 * - POST /api/demo/reset: limpa Usuários/projetos/vendas/Notificações/metas
 *   e reinsere o seed rico. Usado pelo botão "reset demo" do front.
 */
export function createDemoRouter(db) {
  const router = Router();

  router.post('/reset', (_req, res, next) => {
    try {
      const reset = db.transaction(() => {
        db.prepare('DELETE FROM users').run();
        db.prepare('DELETE FROM projects').run();
        db.prepare('DELETE FROM sales').run();
        db.prepare('DELETE FROM notifications').run();
        db.prepare('DELETE FROM weekly_goals').run();
        try { db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('users','projects','sales','notifications')").run(); } catch { /* sem sqlite_sequence: ok */ }
      });
      reset();
      seedDatabase(db);
      return res.json({ data: { reset: true, seed: getCounts(db) } });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
