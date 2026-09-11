import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { createApp } from '../src/app.js';

// Seam: Stats e Desempenho Semanal derivados de dados reais (issue #5).
// Sem valores fixos no servidor: tudo agregado do banco.
describe('Stats + Desempenho Semanal derivados', () => {
  let server;
  let db;
  let baseUrl;
  let dbPath;

  before(async () => {
    dbPath = path.join(os.tmpdir(), `dashboard-stats-${Date.now()}.db`);
    const created = createApp({ dbPath });
    db = created.db;
    await new Promise((resolve) => {
      server = created.app.listen(0, () => resolve());
    });
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    await new Promise((resolve) => server.close(() => resolve()));
    db.close();
    for (const suffix of ['', '-wal', '-shm', '-journal']) {
      try { fs.rmSync(`${dbPath}${suffix}`, { force: true }); } catch { /* ignore */ }
    }
  });

  it('GET /api/stats agrega usuários, projetos ativos, vendas e receita do banco', async () => {
    const res = await fetch(`${baseUrl}/api/stats`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.data, 'esperava { data }');

    const usuarios = db.prepare('SELECT COUNT(*) AS total FROM users').get().total;
    const projetosAtivos = db.prepare("SELECT COUNT(*) AS total FROM projects WHERE status = 'ativo'").get().total;
    const vendas = db.prepare('SELECT COUNT(*) AS total FROM sales').get().total;
    const receita = db.prepare('SELECT COALESCE(SUM(valor), 0) AS total FROM sales').get().total;

    assert.equal(body.data.usuarios_totais, usuarios);
    assert.equal(body.data.projetos_ativos, projetosAtivos);
    assert.equal(body.data.vendas_total, vendas);
    assert.equal(body.data.receita_total, receita);
  });

  it('stats reagem a mudanças reais (criar usuário e venda movem os números)', async () => {
    const antes = await (await fetch(`${baseUrl}/api/stats`)).json();
    await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ nome: 'Stat Movedor', email: `stat-${Date.now()}@exemplo.com` }),
    });
    db.prepare("INSERT INTO sales (descricao, valor, dia) VALUES ('Teste stat', 1234.56, 'Seg')").run();
    const depois = await (await fetch(`${baseUrl}/api/stats`)).json();
    assert.equal(depois.data.usuarios_totais, antes.data.usuarios_totais + 1);
    assert.equal(depois.data.vendas_total, antes.data.vendas_total + 1);
    assert.ok(depois.data.receita_total > antes.data.receita_total);
  });

  it('GET /api/performance/weekly retorna vendas vs metas Seg–Sex de vendas reais', async () => {
    const res = await fetch(`${baseUrl}/api/performance/weekly`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.data));
    assert.deepEqual(body.data.map((d) => d.dia), ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']);

    for (const item of body.data) {
      const soma = db.prepare('SELECT COALESCE(SUM(valor), 0) AS total FROM sales WHERE dia = ?').get(item.dia).total;
      const meta = db.prepare('SELECT meta FROM weekly_goals WHERE dia = ?').get(item.dia).meta;
      assert.ok(Math.abs(item.vendas - soma) < 0.01, `vendas de ${item.dia} devem somar o banco`);
      assert.equal(item.meta, meta, `meta de ${item.dia} deve vir de weekly_goals`);
    }
  });
});
