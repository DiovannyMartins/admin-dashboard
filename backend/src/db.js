import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

/**
 * db — inicialização do SQLite e definição das tabelas base.
 *
 * Tabelas (base para todos os tickets do spec #1):
 * - users: Usuário (nome, email, Status de Usuário, Plano)
 * - projects: projetos (nome, status ativo/concluído)
 * - sales: vendas (descrição, valor, dia Seg–Sex)
 * - notifications: Notificação (título, mensagem, lida 0/1)
 * - weekly_goals: metas do Desempenho Semanal por dia (Seg–Sex)
 */

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL CHECK (length(nome) >= 2 AND length(nome) <= 100),
  email TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  plano TEXT NOT NULL DEFAULT 'Básico' CHECK (plano IN ('Básico', 'Premium')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluído')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao TEXT NOT NULL DEFAULT '',
  valor REAL NOT NULL CHECK (valor >= 0),
  dia TEXT NOT NULL CHECK (dia IN ('Seg', 'Ter', 'Qua', 'Qui', 'Sex')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL DEFAULT '',
  lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS weekly_goals (
  dia TEXT PRIMARY KEY CHECK (dia IN ('Seg', 'Ter', 'Qua', 'Qui', 'Sex')),
  meta REAL NOT NULL CHECK (meta >= 0)
);
`;

export function initDatabase(dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

export function getCounts(db) {
  const usuarios = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
  const projetos = db.prepare('SELECT COUNT(*) AS total FROM projects').get().total;
  const vendas = db.prepare('SELECT COUNT(*) AS total FROM sales').get().total;
  const notificacoes = db.prepare('SELECT COUNT(*) AS total FROM notifications').get().total;
  return { usuarios, projetos, vendas, notificacoes };
}

export function isDatabaseUp(db) {
  try {
    db.prepare('SELECT 1').get();
    return true;
  } catch {
    return false;
  }
}
