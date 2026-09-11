import { Router } from 'express';

/**
 * stats.routes — Stats e Desempenho Semanal derivados de dados reais (issue #5).
 *
 * - GET /api/stats: { data: { usuarios_totais, projetos_ativos, vendas_total, receita_total } }
 * - GET /api/performance/weekly: { data: [{ dia, vendas, meta }] } (Seg–Sex)
 *
 * Sem valores fixos: tudo agregado do banco (usuários, projetos, vendas, metas).
 */

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

export function createStatsRouter(db) {
  const router = Router();

  router.get('/stats', (_req, res, next) => {
    try {
      const usuariosTotais = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
      const projetosAtivos = db.prepare("SELECT COUNT(*) AS total FROM projects WHERE status = 'ativo'").get().total;
      const vendasTotal = db.prepare('SELECT COUNT(*) AS total FROM sales').get().total;
      const receitaTotal = db.prepare('SELECT COALESCE(SUM(valor), 0) AS total FROM sales').get().total;
      return res.json({
        data: {
          usuarios_totais: usuariosTotais,
          projetos_ativos: projetosAtivos,
          vendas_total: vendasTotal,
          receita_total: Math.round(receitaTotal * 100) / 100,
        },
      });
    } catch (err) {
      return next(err);
    }
  });

  router.get('/performance/weekly', (_req, res, next) => {
    try {
      const somaPorDia = db.prepare('SELECT dia, COALESCE(SUM(valor), 0) AS vendas FROM sales GROUP BY dia');
      const somas = new Map(somaPorDia.all().map((r) => [r.dia, Math.round(r.vendas * 100) / 100]));
      const metas = new Map(db.prepare('SELECT dia, meta FROM weekly_goals').all().map((r) => [r.dia, r.meta]));
      return res.json({
        data: DIAS.map((dia) => ({
          dia,
          vendas: somas.get(dia) ?? 0,
          meta: metas.get(dia) ?? 0,
        })),
      });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
