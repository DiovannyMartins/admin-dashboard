import { Router } from 'express';
import { validateUserInput, toUserJson, STATUS_VALIDOS, PLANOS_VALIDOS } from './validate.js';
import { createError } from './errors.js';

/**
 * users.routes — coleção de Usuários persistente via REST (issues #3 e #4).
 *
 * - GET /api/users?q=&status=&plano=&sort=&order=&page=&per_page=
 * - POST /api/users
 * - GET /api/users/:id
 * - PUT /api/users/:id
 * - DELETE /api/users/:id
 * - POST /api/users/:id/restore (undo de 5s do front)
 */

const SORTS_VALIDOS = ['nome', 'status', 'plano', 'created_at', 'id'];

function parseListParams(query) {
  const errors = [];
  const q = typeof query.q === 'string' ? query.q.trim() : '';

  let status;
  if (query.status !== undefined && query.status !== '') {
    if (!STATUS_VALIDOS.includes(query.status)) {
      errors.push({ field: 'status', message: 'Status de Usuário deve ser Ativo ou Inativo' });
    } else {
      status = query.status;
    }
  }

  let plano;
  if (query.plano !== undefined && query.plano !== '') {
    if (!PLANOS_VALIDOS.includes(query.plano)) {
      errors.push({ field: 'plano', message: 'Plano deve ser Básico ou Premium' });
    } else {
      plano = query.plano;
    }
  }

  const sort = query.sort ?? 'id';
  if (!SORTS_VALIDOS.includes(sort)) {
    errors.push({ field: 'sort', message: `Ordenação deve ser uma de: ${SORTS_VALIDOS.join(', ')}` });
  }

  const order = (query.order ?? 'desc').toLowerCase();
  if (!['asc', 'desc'].includes(order)) {
    errors.push({ field: 'order', message: 'Ordem deve ser asc ou desc' });
  }

  const page = query.page === undefined || query.page === '' ? 1 : Number(query.page);
  if (!Number.isInteger(page) || page < 1) {
    errors.push({ field: 'page', message: 'page deve ser inteiro >= 1' });
  }

  const perPage = query.per_page === undefined || query.per_page === '' ? 10 : Number(query.per_page);
  if (!Number.isInteger(perPage) || perPage < 1 || perPage > 100) {
    errors.push({ field: 'per_page', message: 'per_page deve ser inteiro entre 1 e 100' });
  }

  return { params: { q, status, plano, sort, order, page, perPage }, errors };
}

function emailEmUso(db, email, excetoId = null) {
  if (!email) return false;
  const row = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  return !!row && row.id !== excetoId;
}

export function createUsersRouter(db) {
  const router = Router();

  // Listagem avançada: busca + filtros + ordenação + paginação
  router.get('/', (req, res, next) => {
    try {
      const { params, errors } = parseListParams(req.query);
      if (errors.length > 0) {
        return next(createError(400, 'VALIDATION_ERROR', 'Parâmetros de listagem inválidos', errors));
      }
      const { q, status, plano, sort, order, page, perPage } = params;

      const conds = [];
      const args = [];
      if (q) {
        conds.push('(nome LIKE ? COLLATE NOCASE OR email LIKE ? COLLATE NOCASE)');
        args.push(`%${q}%`, `%${q}%`);
      }
      if (status) {
        conds.push('status = ?');
        args.push(status);
      }
      if (plano) {
        conds.push('plano = ?');
        args.push(plano);
      }
      const where = conds.length > 0 ? `WHERE ${conds.join(' AND ')}` : '';

      const { total } = db.prepare(`SELECT COUNT(*) AS total FROM users ${where}`).get(...args);
      const totalPages = Math.max(1, Math.ceil(total / perPage));
      const offset = (page - 1) * perPage;
      const rows = db
        .prepare(`SELECT * FROM users ${where} ORDER BY ${sort} ${order === 'asc' ? 'ASC' : 'DESC'} LIMIT ? OFFSET ?`)
        .all(...args, perPage, offset);

      return res.json({
        data: rows.map(toUserJson),
        meta: { total, page, per_page: perPage, total_pages: totalPages },
      });
    } catch (err) {
      return next(err);
    }
  });

  // Criação
  router.post('/', (req, res, next) => {
    try {
      const { value, errors } = validateUserInput(req.body ?? {});
      if (errors.length > 0) {
        return next(createError(400, 'VALIDATION_ERROR', 'Dados de Usuário inválidos', errors));
      }
      if (emailEmUso(db, value.email)) {
        return next(createError(400, 'VALIDATION_ERROR', 'Email já cadastrado', [{ field: 'email', message: 'Email já está em uso por outro usuário' }]));
      }
      const info = db
        .prepare('INSERT INTO users (nome, email, status, plano) VALUES (?, ?, ?, ?)')
        .run(value.nome, value.email, value.status, value.plano);
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
      return res.status(201).json({ data: toUserJson(row) });
    } catch (err) {
      if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return next(createError(400, 'VALIDATION_ERROR', 'Email já cadastrado', [{ field: 'email', message: 'Email já está em uso por outro usuário' }]));
      }
      return next(err);
    }
  });

  // Leitura por id
  router.get('/:id', (req, res, next) => {
    try {
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(req.params.id));
      if (!row) return next(createError(404, 'NOT_FOUND', 'Usuário não encontrado'));
      return res.json({ data: toUserJson(row) });
    } catch (err) {
      return next(err);
    }
  });

  // Atualização por id (parcial, validando o informado)
  router.put('/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const atual = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!atual) return next(createError(404, 'NOT_FOUND', 'Usuário não encontrado'));

      const { value, errors } = validateUserInput(req.body ?? {}, { partial: true });
      if (errors.length > 0) {
        return next(createError(400, 'VALIDATION_ERROR', 'Dados de Usuário inválidos', errors));
      }
      if (Object.keys(value).length === 0) {
        return next(createError(400, 'VALIDATION_ERROR', 'Nada para atualizar', []));
      }
      if (value.email !== undefined && emailEmUso(db, value.email, id)) {
        return next(createError(400, 'VALIDATION_ERROR', 'Email já cadastrado', [{ field: 'email', message: 'Email já está em uso por outro usuário' }]));
      }

      const sets = [];
      const args = [];
      for (const [campo, val] of Object.entries(value)) {
        sets.push(`${campo} = ?`);
        args.push(val);
      }
      args.push(id);
      try {
        db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...args);
      } catch (err) {
        if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return next(createError(400, 'VALIDATION_ERROR', 'Email já cadastrado', [{ field: 'email', message: 'Email já está em uso por outro usuário' }]));
        }
        throw err;
      }
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      return res.json({ data: toUserJson(row) });
    } catch (err) {
      return next(err);
    }
  });

  // Exclusão por id (imediata; o undo do front recria via restore)
  router.delete('/:id', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (!row) return next(createError(404, 'NOT_FOUND', 'Usuário não encontrado'));
      db.prepare('DELETE FROM users WHERE id = ?').run(id);
      return res.json({ data: toUserJson(row) });
    } catch (err) {
      return next(err);
    }
  });

  // Restauração com id explícito (recria após exclusão para o undo de 5s)
  router.post('/:id/restore', (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id) || id < 1) {
        return next(createError(400, 'VALIDATION_ERROR', 'Id inválido', [{ field: 'id', message: 'Id deve ser inteiro >= 1' }]));
      }
      const existente = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      if (existente) {
        return next(createError(400, 'VALIDATION_ERROR', 'Usuário já existe', [{ field: 'id', message: 'Já existe um Usuário com este id' }]));
      }
      const { value, errors } = validateUserInput(req.body ?? {});
      if (errors.length > 0) {
        return next(createError(400, 'VALIDATION_ERROR', 'Dados de Usuário inválidos', errors));
      }
      if (emailEmUso(db, value.email)) {
        return next(createError(400, 'VALIDATION_ERROR', 'Email já cadastrado', [{ field: 'email', message: 'Email já está em uso por outro usuário' }]));
      }
      try {
        db.prepare('INSERT INTO users (id, nome, email, status, plano) VALUES (?, ?, ?, ?, ?)')
          .run(id, value.nome, value.email, value.status, value.plano);
      } catch (err) {
        if (err?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return next(createError(400, 'VALIDATION_ERROR', 'Email já cadastrado', [{ field: 'email', message: 'Email já está em uso por outro usuário' }]));
        }
        throw err;
      }
      const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      return res.status(201).json({ data: toUserJson(row) });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
