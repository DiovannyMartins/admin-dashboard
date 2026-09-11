/**
 * fallback-seed — seed local rico para o modo offline (GitHub Pages).
 *
 * Derivado de `shared/seed-data.js` (fonte única, mesma do back-end), para o
 * demo nunca quebrar sem servidor. Usado pelo ApiService quando o `fetch` na
 * API local falha. Uma mudança no demo edita só `shared/seed-data.js`.
 */

import {
  SEED_USERS,
  SEED_PROJECTS,
  SEED_SALES,
  SEED_NOTIFICATIONS,
  SEED_GOALS,
} from '../../shared/seed-data.js';

const round2 = (n) => Math.round(n * 100) / 100;

/** Mesma ordem de inserção do back-end (ids autoincrement 1..N). */
export const FALLBACK_USERS = SEED_USERS.map((u, i) => ({ id: i + 1, ...u }));

/** Mesma ordem do `GET /api/notifications` (id DESC). */
export const FALLBACK_NOTIFICATIONS = SEED_NOTIFICATIONS.map((n, i) => ({
  id: i + 1,
  ...n,
})).reverse();

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

/** Vendas agregadas por dia (somatório do seed do back-end). */
export const FALLBACK_SALES_BY_DAY = DIAS.map((dia) => {
  const vendasDia = SEED_SALES.filter((s) => s.dia === dia);
  return {
    dia,
    vendas: round2(vendasDia.reduce((s, v) => s + v.valor, 0)),
    quantidade: vendasDia.length,
  };
});

export const FALLBACK_GOALS_BY_DAY = SEED_GOALS.map((g) => ({ ...g }));

/** Projetos do seed (só contagem de ativos importa para os Stats offline). */
export const FALLBACK_ACTIVE_PROJECTS = SEED_PROJECTS.filter((p) => p.status === 'ativo').length;
