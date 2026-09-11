import { Router } from 'express';
import { createError } from './errors.js';

/**
 * notifications.routes — coleção de Notificações persistente (issue #6).
 *
 * - GET /api/notifications: { data: [{ id, titulo, mensagem, lida, created_at }], meta: { nao_lidas } }
 * - PATCH /api/notifications/:id { lida: bool }: marca como lida/não-lida
 * - DELETE /api/notifications: limpa todas
 */

function toNotificationJson(row) {
  return {
    id: row.id,
    titulo: row.titulo,
    mensagem: row.mensagem ?? '',
    lida: row.lida === 1,
    created_at: row.created_at,
  };
}

export function createNotificationsRouter(db) {
  const router = Router();

  router.get('/', (_req, res, next) => {
    try {
      const rows = db.prepare('SELECT * FROM notifications ORDER BY id DESC').all();
      const data = rows.map(toNotificationJson);
      return res.json({ data, meta: { nao_lidas: data.filter((n) => !n.lida).length } });
    } catch (err) {
      return next(err);
    }
  });

  router.patch('/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
      if (!row) return next(createError(404, 'NOT_FOUND', 'Notificação não encontrada'));
      if (req.body?.lida === undefined || typeof req.body.lida !== 'boolean') {
        return next(createError(400, 'VALIDATION_ERROR', 'Campo lida deve ser booleano', [{ field: 'lida', message: 'Informe lida como true ou false' }]));
      }
      db.prepare('UPDATE notifications SET lida = ? WHERE id = ?').run(req.body.lida ? 1 : 0, id);
      const atual = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
      return res.json({ data: toNotificationJson(atual) });
    } catch (err) {
      return next(err);
    }
  });

  router.delete('/', (_req, res, next) => {
    try {
      const info = db.prepare('DELETE FROM notifications').run();
      return res.json({ data: { removidas: info.changes } });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
