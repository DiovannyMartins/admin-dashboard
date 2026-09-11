/**
 * seed — seed rico de demonstração, idempotente.
 *
 * Os dados vivem em `shared/seed-data.js` (fonte única, também usada pelo
 * fallback offline do front). Este módulo só insere no SQLite.
 * Só insere quando as tabelas estão vazias.
 */

import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_SALES,
  SEED_NOTIFICATIONS,
  SEED_GOALS,
} from '../../shared/seed-data.js';

const USUARIOS_SEED = SEED_USERS;
const PROJETOS_SEED = SEED_PROJECTS;
const VENDAS_SEED = SEED_SALES;
const NOTIFICACOES_SEED = SEED_NOTIFICATIONS.map((n) => ({
  titulo: n.titulo,
  mensagem: n.mensagem,
  lida: n.lida ? 1 : 0,
}));
const METAS_SEED = SEED_GOALS;

export function seedDatabase(db) {
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM users').get();
  const { total: projectsTotal } = db.prepare('SELECT COUNT(*) AS total FROM projects').get();
  const { total: salesTotal } = db.prepare('SELECT COUNT(*) AS total FROM sales').get();
  const { total: notificationsTotal } = db.prepare('SELECT COUNT(*) AS total FROM notifications').get();
  const { total: goalsTotal } = db.prepare('SELECT COUNT(*) AS total FROM weekly_goals').get();

  const insertUser = db.prepare('INSERT INTO users (nome, email, status, plano) VALUES (?, ?, ?, ?)');
  const insertProject = db.prepare('INSERT INTO projects (nome, status) VALUES (?, ?)');
  const insertSale = db.prepare('INSERT INTO sales (descricao, valor, dia) VALUES (?, ?, ?)');
  const insertNotification = db.prepare(
    'INSERT INTO notifications (titulo, mensagem, lida) VALUES (?, ?, ?)',
  );
  const insertGoal = db.prepare('INSERT INTO weekly_goals (dia, meta) VALUES (?, ?)');

  // Idempotente por tabela: só preenche o que está vazio (nunca duplica o demo
  // nem zera metas quando só uma tabela foi esvaziada).
  const seedAll = db.transaction(() => {
    if (total === 0) for (const u of USUARIOS_SEED) insertUser.run(u.nome, u.email, u.status, u.plano);
    if (projectsTotal === 0) for (const p of PROJETOS_SEED) insertProject.run(p.nome, p.status);
    if (salesTotal === 0) for (const s of VENDAS_SEED) insertSale.run(s.descricao, s.valor, s.dia);
    if (notificationsTotal === 0) for (const n of NOTIFICACOES_SEED) insertNotification.run(n.titulo, n.mensagem, n.lida);
    if (goalsTotal === 0) for (const g of METAS_SEED) insertGoal.run(g.dia, g.meta);
  });

  seedAll();
}
